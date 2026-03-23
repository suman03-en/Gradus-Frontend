export type UserProfile =
  | {
      id: string
      roll_no: string | null
      department: string
      current_semester: number
      batch_year: number | null
      section: string
    }
  | {
      department: string | null
      phone_number: string
      designation: string
      is_full_time: boolean
    }

export type User = {
  id: string
  username: string
  email: string
  first_name: string
  last_name: string
  profile: UserProfile | null
}

export type Classroom = {
  id: string
  name: string
  description: string
  created_by: string
  invite_code: string
  created_at: string
  students: string[]
}

export type Task = {
  id: string
  name: string
  created_at: string
  updated_at: string
  end_date: string
  description: string
  full_marks: number
  created_by: string
  classroom: string
  status: string
  mode: string
  task_type: string
}

export type TaskRecord = {
  id: string
  task: string
  student: string
  student_username?: string
  uploaded_file: string | null
  submitted_at: string
  marks_obtained: number | null
  feedback: string
  evaluated_at: string | null
  is_evaluated: boolean
}

export type GradebookData = {
  classroom: { id: string; name: string }
  tasks: { id: string; name: string; full_marks: number }[]
  students: {
    id: string
    username: string
    roll_no: string
    marks: Record<string, number>
    total_obtained: number
    total_full_marks: number
  }[]
}

export type Resource = {
  id: number
  name: string
  file: string
  content_type: string
  object_id: string
  uploaded_by: string
  uploaded_at: string
}
