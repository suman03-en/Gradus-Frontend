import { useNavigate } from 'react-router-dom'

export function AboutPage() {
  const navigate = useNavigate()

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div>
        <button onClick={() => navigate(-1)} className="text-sm font-medium text-brand-600 hover:underline mb-4">
          ← Back
        </button>
        <div className="card p-8 bg-gradient-to-br from-brand-50 to-indigo-50 border border-brand-100">
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
            Gradus
          </h1>
          <p className="mt-3 text-xl text-slate-600">
            Internal Mark Evaluation System
          </p>
          <p className="mt-4 text-sm text-slate-500 max-w-2xl leading-relaxed">
            A comprehensive platform designed for educational institutions to seamlessly manage classrooms, assign tasks, evaluate student work, and generate detailed performance analytics—all in one unified system.
          </p>
        </div>
      </div>

      {/* Core Features */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100">
              <span className="text-xl">📚</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Classroom Management</h3>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Create and organize virtual classrooms, manage student enrollment, and collaborate with multiple educators in a single space.
          </p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
              <span className="text-xl">📋</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Task Management</h3>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Publish assignments with flexible deadlines, choose between online (file submission) and offline (direct grading) modes, and track completion status.
          </p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
              <span className="text-xl">✏️</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Flexible Evaluation</h3>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            Evaluate submissions individually, bulk grade using CSV uploads, or assign marks directly for offline tasks—choose what works best.
          </p>
        </div>

        <div className="card p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-100">
              <span className="text-xl">📊</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Analytics & Grades</h3>
          </div>
          <p className="mt-3 text-sm text-slate-600">
            View comprehensive gradebooks with theory/lab breakdowns, weighted grades, and exportable reports for individual tracking or institutional records.
          </p>
        </div>
      </div>

      {/* Student Capabilities */}
      <div className="card p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">What Students Can Do</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-brand-500 pl-4">
            <h4 className="font-semibold text-slate-900">📖 Browse & Enroll in Classrooms</h4>
            <p className="mt-1 text-sm text-slate-600">
              Use invitation codes to join classrooms managed by your teachers. View all enrolled classrooms and their details on your dashboard.
            </p>
          </div>

          <div className="border-l-4 border-brand-500 pl-4">
            <h4 className="font-semibold text-slate-900">📝 View Assigned Tasks</h4>
            <p className="mt-1 text-sm text-slate-600">
              See all published tasks for each classroom, including task descriptions, deadlines, full marks, and task type (assignment, quiz, project). Tasks are categorized by theory or lab components.
            </p>
          </div>

          <div className="border-l-4 border-brand-500 pl-4">
            <h4 className="font-semibold text-slate-900">📤 Submit Work Online</h4>
            <p className="mt-1 text-sm text-slate-600">
              For online tasks, upload file submissions before the deadline. Supported formats: PDF, Word, Images (JPG/PNG), TXT, ZIP, PowerPoint, and more. Update submissions before the deadline if needed.
            </p>
          </div>

          <div className="border-l-4 border-brand-500 pl-4">
            <h4 className="font-semibold text-slate-900">📊 Track Your Grades</h4>
            <p className="mt-1 text-sm text-slate-600">
              View your performance in "My Grades" gradebook showing: marks obtained vs. full marks, percentage scores, component-wise breakdown (theory/lab), and weighted final grades. See detailed feedback on each evaluated task.
            </p>
          </div>

          <div className="border-l-4 border-brand-500 pl-4">
            <h4 className="font-semibold text-slate-900">👥 View Classmate Profiles</h4>
            <p className="mt-1 text-sm text-slate-600">
              Click on any classmate's name in the students list to view their profile including their roll number and contact information.
            </p>
          </div>

          <div className="border-l-4 border-brand-500 pl-4">
            <h4 className="font-semibold text-slate-900">📱 Access Resources</h4>
            <p className="mt-1 text-sm text-slate-600">
              Download class materials (lecture notes, readings, reference documents) shared by your teacher in each classroom and task.
            </p>
          </div>

          <div className="border-l-4 border-brand-500 pl-4">
            <h4 className="font-semibold text-slate-900">👤 Manage Profile</h4>
            <p className="mt-1 text-sm text-slate-600">
              Update your profile information (name, email) and change your password to keep your account secure.
            </p>
          </div>
        </div>
      </div>

      {/* Teacher Capabilities */}
      <div className="card p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">What Teachers Can Do</h2>
        <div className="space-y-4">
          <div className="border-l-4 border-emerald-500 pl-4">
            <h4 className="font-semibold text-slate-900">🎓 Create & Manage Classrooms</h4>
            <p className="mt-1 text-sm text-slate-600">
              Create new classrooms, set names and descriptions, generate unique 6-character invite codes for student enrollment, modify classroom details, and delete classrooms when no longer needed.
            </p>
          </div>

          <div className="border-l-4 border-emerald-500 pl-4">
            <h4 className="font-semibold text-slate-900">👥 Manage Student Enrollment</h4>
            <p className="mt-1 text-sm text-slate-600">
              Add students manually to classrooms using their roll numbers. Remove students if needed. View complete student lists with roll numbers, usernames, and quick access to individual profiles.
            </p>
          </div>

          <div className="border-l-4 border-emerald-500 pl-4">
            <h4 className="font-semibold text-slate-900">➕ Create & Publish Tasks</h4>
            <p className="mt-1 text-sm text-slate-600">
              Design tasks with name, description, full marks, deadline, task type (assignment/quiz/project), mode (online/offline), and component classification (theory/lab). Save as draft or publish immediately. Edit and update tasks before publication.
            </p>
          </div>

          <div className="border-l-4 border-emerald-500 pl-4">
            <h4 className="font-semibold text-slate-900">📁 Attach Learning Resources</h4>
            <p className="mt-1 text-sm text-slate-600">
              Upload supporting materials (PDFs, documents, presentations) to classrooms and individual tasks. Students can view and download these resources to aid their learning.
            </p>
          </div>

          <div className="border-l-4 border-emerald-500 pl-4">
            <h4 className="font-semibold text-slate-900">✅ Evaluate Online Submissions</h4>
            <p className="mt-1 text-sm text-slate-600">
              For online tasks: view student submissions, download files for review, provide marks (0 to full marks) and detailed feedback to each student. Access submission timestamps to verify deadline compliance.
            </p>
          </div>

          <div className="border-l-4 border-emerald-500 pl-4">
            <h4 className="font-semibold text-slate-900">📋 Direct Student Evaluation</h4>
            <p className="mt-1 text-sm text-slate-600">
              For offline tasks only: manually enter marks and feedback for any student by their roll number, even if no submission exists. Useful for practical exams, oral presentations, or manual assessments.
            </p>
          </div>

          <div className="border-l-4 border-emerald-500 pl-4">
            <h4 className="font-semibold text-slate-900">📊 Bulk CSV Grading</h4>
            <p className="mt-1 text-sm text-slate-600">
              For offline tasks: upload a CSV file with multiple students' marks and feedback at once. Format required: Roll No, Marks, Feedback. System validates all entries and provides success/error summary.
            </p>
          </div>

          <div className="border-l-4 border-emerald-500 pl-4">
            <h4 className="font-semibold text-slate-900">📈 View Comprehensive Gradebooks</h4>
            <p className="mt-1 text-sm text-slate-600">
              Access interactive gradebooks showing all students, all tasks, individual marks, and performance analytics. Filter by component (theory/lab). See raw marks vs. weighted final grades. View student totals and percentages.
            </p>
          </div>

          <div className="border-l-4 border-emerald-500 pl-4">
            <h4 className="font-semibold text-slate-900">⚖️ Manage Weightage</h4>
            <p className="mt-1 text-sm text-slate-600">
              Set custom weights for theory and lab components in the gradebook (e.g., 60% theory, 40% lab). Final grades are calculated using your defined weightages. Adjust weights anytime to recalculate all student grades.
            </p>
          </div>

          <div className="border-l-4 border-emerald-500 pl-4">
            <h4 className="font-semibold text-slate-900">💾 Export Grades</h4>
            <p className="mt-1 text-sm text-slate-600">
              Download gradebooks as Excel files (XLSX) for a specific component (theory/lab) or combined view. Use exports for institutional records, reports, or sharing with administration. Filtered by currently selected component in gradebook.
            </p>
          </div>

          <div className="border-l-4 border-emerald-500 pl-4">
            <h4 className="font-semibold text-slate-900">👤 Manage Account</h4>
            <p className="mt-1 text-sm text-slate-600">
              Update profile information, change password, and maintain account security. Your classroom and task data is safely stored and associated with your account.
            </p>
          </div>
        </div>
      </div>

      {/* How Features Work */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-slate-900">How Key Features Work</h2>

        <div className="card p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">🔄 Online Task Workflow</h3>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs">1</span>
              <div>
                <span className="font-semibold text-slate-900">Teacher creates online task</span> with deadline and full marks
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs">2</span>
              <div>
                <span className="font-semibold text-slate-900">Student sees task</span> and uploads file before deadline
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs">3</span>
              <div>
                <span className="font-semibold text-slate-900">Teacher evaluates submission</span> by viewing the uploaded file and providing marks + feedback
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-700 font-bold text-xs">4</span>
              <div>
                <span className="font-semibold text-slate-900">Student sees grade</span> in "My Grades" with feedback
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">📝 Offline Task Workflow</h3>
          <div className="space-y-3 text-sm">
            <div className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-700 font-bold text-xs">1</span>
              <div>
                <span className="font-semibold text-slate-900">Teacher creates offline task</span> (e.g., for practical exam, oral presentation, manual assessment)
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-700 font-bold text-xs">2</span>
              <div>
                <span className="font-semibold text-slate-900">Teacher evaluates using one of three methods:</span>
                <ul className="mt-1 ml-2 space-y-1 text-slate-600">
                  <li>• <span className="font-medium">Direct Evaluation:</span> Enter marks + feedback for one student by roll number</li>
                  <li>• <span className="font-medium">Bulk CSV Upload:</span> Upload CSV file with multiple students' marks and feedback</li>
                  <li>• <span className="font-medium">Manual Entry on Gradebook:</span> Edit individual entries directly in the gradebook view</li>
                </ul>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-700 font-bold text-xs">3</span>
              <div>
                <span className="font-semibold text-slate-900">Student sees grade</span> in "My Grades" with feedback
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">📊 Weighted Grade Calculation</h3>
          <div className="space-y-3 text-sm text-slate-600">
            <p>
              <span className="font-semibold text-slate-900">Raw Score Calculation:</span> Sum of all marks obtained across all tasks divided by total full marks, multiplied by 100
            </p>
            <p>
              <span className="font-semibold text-slate-900">Component Filtering:</span> When viewing theory-only or lab-only grades, only tasks marked with that component are included
            </p>
            <p>
              <span className="font-semibold text-slate-900">Weighted Formula:</span> Final Grade = (Theory Raw % × Theory Weight) + (Lab Raw % × Lab Weight)
            </p>
            <p className="bg-blue-50 border border-blue-200 rounded p-3 mt-2">
              <span className="font-semibold text-blue-900">Example:</span> If theory weight is 60% and lab weight is 40%, a student with 80% in theory and 90% in lab gets: (80 × 0.6) + (90 × 0.4) = 48 + 36 = <span className="font-bold">84% final grade</span>
            </p>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-bold text-slate-900 mb-4">💾 CSV Bulk Upload Format</h3>
          <div className="space-y-3 text-sm">
            <p className="text-slate-600">
              For bulk grading of offline tasks, upload a CSV file with the following columns:
            </p>
            <div className="bg-slate-50 p-3 rounded border border-slate-200 font-mono text-xs overflow-x-auto">
              <div>Roll No,Marks,Feedback</div>
              <div>THA079BEI042,85,Excellent work</div>
              <div>THA079BEI043,72,Good effort</div>
              <div>THA079BEI044,90,Outstanding performance</div>
            </div>
            <ul className="text-slate-600 space-y-1 mt-2">
              <li><span className="font-semibold">Roll No:</span> Student's exact roll number (case-insensitive)</li>
              <li><span className="font-semibold">Marks:</span> Numeric value (0 to task full marks)</li>
              <li><span className="font-semibold">Feedback:</span> Any text (can include spaces and special characters)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Technical Details */}
      <div className="card p-8 bg-slate-50">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">System Information</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">🔒 Security & Privacy</h4>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• All data is encrypted in transit and at rest</li>
              <li>• Role-based access control (teachers vs. students)</li>
              <li>• Password security with industry-standard hashing</li>
              <li>• Students can only view their own grades and classmates in enrolled classrooms</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">📲 Accessibility</h4>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Fully responsive design (desktop, tablet, mobile)</li>
              <li>• Accessible color schemes and typography</li>
              <li>• Support for multiple file formats (PDF, Word, Images, ZIP)</li>
              <li>• Downloadable reports (Excel format)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">⚡ Performance</h4>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Real-time grade calculations</li>
              <li>• Bulk operations optimized for large classes</li>
              <li>• Fast file downloads and uploads</li>
              <li>• Responsive UI for smooth user experience</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-slate-900 mb-2">🎯 Data Management</h4>
            <ul className="text-sm text-slate-600 space-y-1">
              <li>• Permanent record keeping for compliance</li>
              <li>• Audit trail for grade changes</li>
              <li>• Export functionality for institutional records</li>
              <li>• Centralized database for reliability</li>
            </ul>
          </div>
        </div>
      </div>

      {/* FAQ / Getting Started */}
      <div className="card p-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Getting Started</h2>
        <div className="space-y-4">
          <details className="group cursor-pointer">
            <summary className="flex items-center gap-2 font-semibold text-slate-900 hover:text-brand-600 transition">
              <span className="inline-block w-5 text-center group-open:rotate-180 transition">▶</span>
              How do I join a classroom as a student?
            </summary>
            <p className="mt-2 ml-7 text-sm text-slate-600">
              Ask your teacher for the classroom invite code (a 6-character code). Go to your dashboard and click "Join Classroom," then enter the code. You'll immediately be added to the classroom and can see all tasks and resources.
            </p>
          </details>

          <details className="group cursor-pointer">
            <summary className="flex items-center gap-2 font-semibold text-slate-900 hover:text-brand-600 transition">
              <span className="inline-block w-5 text-center group-open:rotate-180 transition">▶</span>
              How do I create a classroom as a teacher?
            </summary>
            <p className="mt-2 ml-7 text-sm text-slate-600">
              Go to your Classrooms page and click "Create Classroom." Enter a name, description, and click Create. You'll get a unique invite code to share with students. You can manage all classroom settings and students from the classroom detail page.
            </p>
          </details>

          <details className="group cursor-pointer">
            <summary className="flex items-center gap-2 font-semibold text-slate-900 hover:text-brand-600 transition">
              <span className="inline-block w-5 text-center group-open:rotate-180 transition">▶</span>
              What's the difference between online and offline tasks?
            </summary>
            <p className="mt-2 ml-7 text-sm text-slate-600">
              <span className="font-semibold">Online tasks:</span> Students must upload files as submissions. <span className="font-semibold">Offline tasks:</span> No file submission required. Teachers directly enter marks and feedback. Use offline for practicums, viva, or oral exams.
            </p>
          </details>

          <details className="group cursor-pointer">
            <summary className="flex items-center gap-2 font-semibold text-slate-900 hover:text-brand-600 transition">
              <span className="inline-block w-5 text-center group-open:rotate-180 transition">▶</span>
              Can students update submissions after uploading?
            </summary>
            <p className="mt-2 ml-7 text-sm text-slate-600">
              Yes, students can update their submission file anytime before the deadline. After the deadline, submissions are locked and cannot be modified. Teachers can still evaluate and provide feedback after the deadline.
            </p>
          </details>

          <details className="group cursor-pointer">
            <summary className="flex items-center gap-2 font-semibold text-slate-900 hover:text-brand-600 transition">
              <span className="inline-block w-5 text-center group-open:rotate-180 transition">▶</span>
              How are final grades calculated with weightage?
            </summary>
            <p className="mt-2 ml-7 text-sm text-slate-600">
              Teachers can set weights for theory and lab components in the gradebook (e.g., 60% theory, 40% lab). The system calculates a weighted final grade combining both components according to these weights. This allows fair assessment across different types of evaluations.
            </p>
          </details>

          <details className="group cursor-pointer">
            <summary className="flex items-center gap-2 font-semibold text-slate-900 hover:text-brand-600 transition">
              <span className="inline-block w-5 text-center group-open:rotate-180 transition">▶</span>
              Where can I download my grades?
            </summary>
            <p className="mt-2 ml-7 text-sm text-slate-600">
              Students: View your grades in the "My Grades" section within each classroom—no export needed. Teachers: Export full gradebooks as Excel files from the gradebook page. Choose to export a specific component (theory/lab) or all grades.
            </p>
          </details>
        </div>
      </div>

      {/* Footer */}
      <div className="pt-8 border-t border-slate-200 text-center text-sm text-slate-500">
        <p>Gradus © 2024-2025 • Internal Mark Evaluation System for Educational Excellence</p>
      </div>
    </div>
  )
}
