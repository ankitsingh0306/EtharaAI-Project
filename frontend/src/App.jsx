import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import LoginPage         from './pages/LoginPage'
import DashboardPage     from './pages/DashboardPage'
import ProjectsPage      from './pages/ProjectsPage'
import ProjectDetailPage from './pages/ProjectDetailPage'
import TasksPage         from './pages/TasksPage'
import UsersPage         from './pages/UsersPage'
import Layout            from './components/Layout'
import ProtectedRoute    from './components/ProtectedRoute'

export default function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="splash">
        <div className="splash-logo">⚡</div>
        <div className="spinner" />
      </div>
    )
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />}
      />
      <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route path="/dashboard"       element={<DashboardPage />} />
        <Route path="/projects"        element={<ProjectsPage />} />
        <Route path="/projects/:id"    element={<ProjectDetailPage />} />
        <Route path="/tasks"           element={<TasksPage />} />
        <Route path="/users"           element={<UsersPage />} />
      </Route>
      <Route path="*" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
    </Routes>
  )
}
