import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, FolderKanban, CheckSquare, Users, LogOut, Zap, Shield, User } from 'lucide-react'
import toast from 'react-hot-toast'

const links = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/projects',  icon: FolderKanban,    label: 'Projects'  },
  { to: '/tasks',     icon: CheckSquare,     label: 'Tasks'     },
]

export default function Sidebar() {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    toast.success('Logged out')
    navigate('/login')
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="logo-icon"><Zap size={18} /></div>
        <span>ProjectPilot</span>
      </div>

      <nav className="sidebar-nav">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <Icon size={17} /><span>{label}</span>
          </NavLink>
        ))}
        {isAdmin && (
          <NavLink to="/users" className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}>
            <Users size={17} /><span>Team</span>
          </NavLink>
        )}
      </nav>

      <div className="sidebar-footer">
        <div className="user-info">
          <div className="user-avatar">{user?.name?.[0]?.toUpperCase()}</div>
          <div className="user-details">
            <span className="user-name">{user?.name}</span>
            <span className={`user-role ${isAdmin ? 'admin' : 'member'}`}>
              {isAdmin ? <><Shield size={9}/> Admin</> : <><User size={9}/> Member</>}
            </span>
          </div>
        </div>
        <button className="logout-btn" onClick={handleLogout}>
          <LogOut size={15}/> Sign Out
        </button>
      </div>
    </aside>
  )
}
