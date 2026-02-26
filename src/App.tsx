import { Navigate, Route, Routes } from 'react-router-dom'
import { AppLayout } from './components/AppLayout'
import { AuthProvider } from './state/auth'
import { RequireAuth } from './state/RequireAuth'
import { LoginPage } from './views/LoginPage'
import { RegisterPage } from './views/RegisterPage'
import { ForgotPasswordPage } from './views/ForgotPasswordPage'
import { VerifyOTPPage } from './views/VerifyOTPPage'
import { ResetPasswordPage } from './views/ResetPasswordPage'
import { DashboardPage } from './views/DashboardPage'
import { ClassroomsPage } from './views/ClassroomsPage'
import { ClassroomDetailPage } from './views/ClassroomDetailPage'
import { TaskDetailPage } from './views/TaskDetailPage'
import { ProfilePage } from './views/ProfilePage'
import { UserProfilePage } from './views/UserProfilePage'
import { GradebookPage } from './views/GradebookPage'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/verify-otp" element={<VerifyOTPPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <DashboardPage />
              </RequireAuth>
            }
          />
          <Route
            path="/classrooms"
            element={
              <RequireAuth>
                <ClassroomsPage />
              </RequireAuth>
            }
          />
          <Route
            path="/classrooms/:id"
            element={
              <RequireAuth>
                <ClassroomDetailPage />
              </RequireAuth>
            }
          />
          <Route
            path="/classrooms/:id/gradebook"
            element={
              <RequireAuth>
                <GradebookPage />
              </RequireAuth>
            }
          />
          <Route
            path="/tasks/:id"
            element={
              <RequireAuth>
                <TaskDetailPage />
              </RequireAuth>
            }
          />
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <ProfilePage />
              </RequireAuth>
            }
          />
          <Route
            path="/users/:username"
            element={
              <RequireAuth>
                <UserProfilePage />
              </RequireAuth>
            }
          />

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Route>
      </Routes>
    </AuthProvider>
  )
}
