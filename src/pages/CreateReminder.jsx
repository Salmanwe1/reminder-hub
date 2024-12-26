import { Separator } from "../components/ui/separator"
import ReminderForm from "../components/forms/StudentReminderForm"
import Header from "../components/Header"

function CreateReminder() {
  return (
    <div className="space-y-10">
      <Header role="Student" page="Create Reminder"/>
      <div>
        <h1 className="text-3xl font-bold mb-2">Create a Reminder</h1>
      </div>
        <Separator />
      <ReminderForm />
    </div>
  )
}

export default CreateReminder