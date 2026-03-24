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
  teachers: string[]
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
  assessment_component: 'theory' | 'lab'
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
  active_component_filter?: 'theory' | 'lab' | null
  tasks: {
    id: string
    name: string
    full_marks: number
    task_type: string
    assessment_component: 'theory' | 'lab'
  }[]
  weightage_config: {
    assessment_component: 'theory' | 'lab'
    task_type: string
    include_in_final: boolean
    weightage: number
  }[]
  total_configured_weightage: number
  total_configured_weightage_by_component?: {
    theory: number
    lab: number
  }
  students: {
    id: string
    username: string
    roll_no: string
    marks: Record<string, number>
    total_obtained: number
    total_full_marks: number
    final_marks: number
    component_totals: {
      theory: { obtained: number; full_marks: number }
      lab: { obtained: number; full_marks: number }
    }
  }[]
}

export type ClassroomWeightageConfig = {
  classroom: { id: string; name: string }
  weightages: {
    assessment_component: 'theory' | 'lab'
    task_type: string
    include_in_final: boolean
    weightage: number
  }[]
  total_configured_weightage: number
  total_configured_weightage_by_component?: {
    theory: number
    lab: number
  }
}

export type ClassroomWeightageConfigPayload = {
  weightages: {
    assessment_component: 'theory' | 'lab'
    task_type: string
    include_in_final: boolean
    weightage: number
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
