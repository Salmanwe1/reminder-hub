import { db } from "./firebase";
import { collection, addDoc, query, where, getDocs, updateDoc, deleteDoc, doc } from "firebase/firestore";

// Create a new notification
export const addNotification = async (userId, title, message, type = "general", reminderId = null) => {
  try {
    const notificationsRef = collection(db, "notifications");
    await addDoc(notificationsRef, {
      userId,
      title,
      message,
      type,
      isRead: false,
      createdAt: new Date(),
      reminderId,
    });
  } catch (error) {
    console.error("Error adding notification:", error);
  }
};

// Fetch notifications for a specific user
export const fetchNotifications = async (userId) => {
  try {
    const notificationsRef = collection(db, "notifications");
    const q = query(notificationsRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("Error fetching notifications:", error);
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    const notificationRef = doc(db, "notifications", notificationId);
    await updateDoc(notificationRef, { isRead: true });
  } catch (error) {
    console.error("Error marking notification as read:", error);
  }
};

// Delete a notification
export const deleteNotification = async (notificationId) => {
  try {
    const notificationRef = doc(db, "notifications", notificationId);
    await deleteDoc(notificationRef);
  } catch (error) {
    console.error("Error deleting notification:", error);
  }
};

// Clear all notifications for a user
export const clearAllNotifications = async (userId) => {
  try {
    const notificationsRef = collection(db, "notifications");
    const q = query(notificationsRef, where("userId", "==", userId));
    const snapshot = await getDocs(q);

    snapshot.forEach(async (doc) => {
      await deleteDoc(doc.ref);
    });
  } catch (error) {
    console.error("Error clearing notifications:", error);
  }
};
