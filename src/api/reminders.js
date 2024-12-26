import { db } from "./firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  getDoc,
  writeBatch,
} from "firebase/firestore";
import { addNotification } from "./notifications";
import { format } from "date-fns";

/**
 * Create a new reminder in Firestore.
 * @param {Object} reminderData - The reminder data from the form.
 * @param {Array} studentIds - List of assigned student IDs.
 * @returns {Promise<string>} - The ID of the created reminder.
 */
export const createReminder = async (reminderData, studentIds = []) => {
  try {
    const remindersRef = collection(db, "reminders");
    const docRef = await addDoc(remindersRef, {
      ...reminderData,
      createdAt: serverTimestamp(),
    });

    console.log("Reminder created with ID: ", docRef.id);

    // Notify assigned students
    if (studentIds.length > 0) {
      studentIds.forEach(async (studentId) => {
        const formattedDueDate = format(new Date(reminderData.dueDate), "dd-MM-yyyy");  // Format the date
        await addNotification(
          studentId,
          "New Reminder Assigned",
          `Reminder: ${reminderData.title} is due on ${formattedDueDate}.`,
          "reminder",
          docRef.id
        );
      });
    }
    return docRef.id;
  } catch (error) {
    console.error("Error adding reminder: ", error);
    throw error;
  }
};

/**
 * Fetch reminders for a specific user (student or teacher).
 * @param {string} userId - The ID of the logged-in user.
 * @param {string} role - The role of the user (student or teacher).
 * @returns {Promise<Array>} - A list of reminders.
 */
export const fetchReminders = async (userId, role) => {
  try {
    const remindersRef = collection(db, "reminders");
    let q;

    if (role === "teacher") {
      // Fetch teacher personal reminders (where creatorId is the teacher's ID)
      q = query(remindersRef, where("creatorId", "==", userId));
    } else {
      // Fetch reminders assigned to the student
      q = query(remindersRef, where("studentIds", "array-contains", userId));
    }

    const querySnapshot = await getDocs(q);
    const reminders = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return reminders;
  } catch (error) {
    console.error("Error fetching reminders: ", error);
    throw error;
  }
};

/**
 * Listen for real-time updates to reminders for a specific user (student or teacher).
 * @param {string} userId - The ID of the logged-in user.
 * @param {string} role - The role of the user (student or teacher).
 * @param {function} callback - Function to handle real-time updates.
 * @returns {function} - Unsubscribe function to stop listening.
 */
export const listenForReminders = (userId, role, type, callback) => {
  const remindersRef = collection(db, "reminders");
  let q;

  if (role === "teacher") {
    if (type === "personal") {
      // Fetch reminders created by the teacher that are NOT assigned to students
      q = query(
        remindersRef,
        where("creatorId", "==", userId),
      );
    } else if (type === "assigned") {
      // Fetch reminders assigned to students by the teacher
      q = query(
        remindersRef,
        where("assignedBy", "==", "Teacher"),
        where("creatorId", "==", userId)
      );
    }
  } 
  
  else if (role === "student") {
    if (type === "personal") {
      q = query(remindersRef, where("creatorId", "==", userId));
    } 
    else if (type === "assigned") {
      q = query(remindersRef, where("studentIds", "array-contains", userId));
    }
  }

  return onSnapshot(q, (snapshot) => {
    const reminders = snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate?.() || new Date(data.createdAt),
        dueDate: data.dueDate instanceof Date
          ? data.dueDate
          : new Date(data.dueDate),
      };
    });
    callback(reminders);
  });
};
/**
 * Delete a reminder by its ID.
 * If assigned, delete for all students as well.
 * @param {string} reminderId - The ID of the reminder to delete.
 * @param {Array} studentIds - List of assigned student IDs.
  * @param {string} userId - The ID of the logged-in user.
 * @param {string} role - The role of the user (student or teacher).
 */
export const deleteReminder = async (reminderId, userId, role, studentIds = []) => {
  try {
    const reminderRef = doc(db, "reminders", reminderId);
    const reminderSnapshot = await getDoc(reminderRef);
    const reminder = reminderSnapshot.data();

    if (!reminderSnapshot.exists()) {
      throw new Error("Reminder not found.");
    }

    // Teacher deletes full reminder (including groups)
    if (role === "teacher") {
      const remindersRef = collection(db, "reminders");

      // Delete group reminders
      if (reminder.groupId?.length) {
        const groupQuery = query(remindersRef, where("groupId", "array-contains", reminder.groupId));
        const groupSnapshot = await getDocs(groupQuery);
        groupSnapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });
        console.log("Group reminders deleted.");
      }

      // Delete individually assigned reminders
      if (reminder.studentIds?.length) {
        const studentQuery = query(remindersRef, where("studentIds", "array-contains", userId));
        const studentSnapshot = await getDocs(studentQuery);
        studentSnapshot.forEach(async (doc) => {
          await deleteDoc(doc.ref);
        });
        console.log("Individual student reminders deleted.");
      }

      // Delete the reminder itself
      await deleteDoc(reminderRef);
      console.log("Reminder deleted for all students.");
      return;
    }

    // Student deleting their own personal reminder
    if (reminder.creatorId === userId) {
      await deleteDoc(reminderRef);
      console.log("Student personal reminder deleted.");
      return;
    }

    // Student removes themselves from assigned reminders
    if (reminder.studentIds?.includes(userId)) {
      const updatedStudentIds = reminder.studentIds.filter((id) => id !== userId);

      if (updatedStudentIds.length > 0) {
        await updateDoc(reminderRef, { studentIds: updatedStudentIds });
      } else {
        const freshSnapshot = await getDoc(reminderRef);
        if (freshSnapshot.exists()) {
          await deleteDoc(reminderRef);
        }
      }
      console.log("Reminder removed for student.");
    }

      // Notify students if the reminder was assigned
      if (role === "teacher" && studentIds.length > 0) {
        studentIds.forEach(async (studentId) => {
          await addNotification(
            studentId,
            "Reminder Removed",
            `A reminder assigned to you has been deleted.`,
            "reminder",
            reminderId
          );
        });
      }
  } catch (error) {
    console.error("Error deleting reminder:", error);
    throw error;
  }
};

/**
 * Update a reminder by its ID.
 * @param {string} id - Reminder ID.
 * @param {Object} updatedData - Updated reminder data.
 * @param {boolean} isAssigned - If true, update for all assigned students.
 */
export const updateReminder = async (id, updatedData, isAssigned = false) => {
  try {
    const reminderRef = doc(db, "reminders", id);
    const existingSnapshot = await getDoc(reminderRef);
    const existingReminder = existingSnapshot.data();
    await updateDoc(reminderRef, updatedData);

    
      // Check for newly added students to notify
      if (isAssigned && updatedData.studentIds?.length > 0) {
        const newlyAddedStudents = updatedData.studentIds.filter(
          (studentId) => !existingReminder.studentIds.includes(studentId)
        );

      if (newlyAddedStudents.length > 0) {
        newlyAddedStudents.forEach(async (studentId) => {
          await addNotification(
            studentId,
            "Reminder Updated",
            `Your reminder: ${updatedData.title} has been updated.`,
            "reminder",
            id
          );
        });
      }
    }

    if (isAssigned) {
      const remindersRef = collection(db, "reminders");
      const q = query(remindersRef, where("groupId", "array-contains", updatedData.groupId));
      const querySnapshot = await getDocs(q);

      const batch = writeBatch(db);
      querySnapshot.forEach((doc) => {
        batch.update(doc.ref, updatedData);
      });
    
      await batch.commit();
      console.log("Batch update completed for assigned reminders.");
    }

    console.log("Reminder updated successfully!");
  } catch (error) {
    console.error("Error updating reminder:", error);
    throw error;
  }
};

