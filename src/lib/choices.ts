// Mirrored from backend constants to keep values compatible.

export const SEMESTER_CHOICES = [
  { value: 1, label: 'Semester 1' },
  { value: 2, label: 'Semester 2' },
  { value: 3, label: 'Semester 3' },
  { value: 4, label: 'Semester 4' },
  { value: 5, label: 'Semester 5' },
  { value: 6, label: 'Semester 6' },
  { value: 7, label: 'Semester 7' },
  { value: 8, label: 'Semester 8' },
] as const

export const DEPARTMENT_CHOICES = [
  { value: 'EC', label: 'Electronics and Computer Engineering' },
  { value: 'MA', label: 'Mechanical and Automobile Engineering' },
  { value: 'CA', label: 'Civil and Architecture Engineering' },
  { value: 'IN', label: 'Industrial Engineering' },
] as const

export const SECTION_CHOICES = [
  { value: 'A', label: 'Group A' },
  { value: 'B', label: 'Group B' },
  { value: 'C', label: 'Group C' },
  { value: 'D', label: 'Group D' },
] as const

export const DESIGNATION_CHOICES = [
  { value: 'HOD', label: 'Head of Department' },
  { value: 'PROF', label: 'Professor' },
  { value: 'ASSOC', label: 'Associate Professor' },
  { value: 'ASST', label: 'Assistant Professor' },
  { value: 'LECT', label: 'Lecturer' },
  { value: 'ADJ', label: 'Adjunct Faculty' },
  { value: 'VISIT', label: 'Visiting Faculty' },
  { value: 'TA', label: 'Teaching Assistant' },
  { value: 'LAB', label: 'Lab Instructor' },
] as const

// Task-related choices (from backend/tasks/constants.py)
export const TASK_STATUS_CHOICES = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
] as const

export const TASK_MODE_CHOICES = [
  { value: 'online', label: 'Online' },
  { value: 'offline', label: 'Offline' },
] as const

export const TASK_TYPE_CHOICES = [
  { value: 'assignment', label: 'Assignment' },
  { value: 'assessment', label: 'Assessment' },
  { value: 'lab_report', label: 'Lab Report' },
  { value: 'quiz', label: 'Quiz' },
] as const
