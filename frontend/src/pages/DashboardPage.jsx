import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { CheckCircle2, Clock, AlertTriangle, Layers, FolderOpen, ListTodo, ArrowRight } from 'lucide-react'
import { format, isPast } from 'date-fns'

const PRIORITY_COLOR = { high: 'danger', medium: 'warning', low: 'success' }
const STATUS_DOT     = { todo: 'muted', 'in-progress': 'info', completed: 'success' }

export default function DashboardPage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/tasks/dashboard')
      .then(({ data }) => { setStats(data.stats); setRecent(data.recentTasks) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="page-loading"><div className="spinner" /></div>

  const cards = [
    { label: 'Total Tasks',  value: stats?.total,        icon: Layers,        color: 'primary' },
    { label: 'Completed',    value: stats?.completed,    icon: CheckCircle2,  color: 'success' },
    { label: 'In Progress',  value: stats?.inProgress,   icon: Clock,         color: 'warning' },
    { label: 'To Do',        value: stats?.todo,         icon: ListTodo,      color: 'info'    },
    { label: 'Overdue',      value: stats?.overdue,      icon: AlertTriangle, color: 'danger'  },
    { label: 'Projects',     value: stats?.projectCount, icon: FolderOpen,    color: 'purple'  },
  ]

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, <strong>{user?.name}</strong> 👋</p>
        </div>
      </div>

      <div className="stats-grid">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`stat-card stat-card--${color}`}>
            <div className="stat-icon"><Icon size={21} /></div>
            <div className="stat-info">
              <span className="stat-value">{value ?? 0}</span>
              <span className="stat-label">{label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="section">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h2 className="section-title" style={{ margin: 0 }}>Recent Tasks</h2>
          <button className="btn btn-ghost btn-sm" onClick={() => navigate('/tasks')}>
            View All <ArrowRight size={14}/>
          </button>
        </div>

        {recent.length === 0 ? (
          <div className="empty-state"><CheckCircle2 size={40}/><p>No tasks yet</p></div>
        ) : (
          <div className="task-list">
            {recent.map(task => {
              const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'completed'
              return (
                <div key={task._id} className="task-row">
                  <div className="task-row-left">
                    <span className={`status-dot status-dot--${STATUS_DOT[task.status]}`} />
                    <div>
                      <span className="task-row-title">{task.title}</span>
                      {task.project && <span className="task-row-project" style={{ color: task.project.color }}>{task.project.title}</span>}
                    </div>
                  </div>
                  <div className="task-row-right">
                    <span className={`badge badge--${PRIORITY_COLOR[task.priority]}`}>{task.priority}</span>
                    {task.dueDate && (
                      <span className={`task-due${isOverdue ? ' overdue' : ''}`}>
                        {format(new Date(task.dueDate), 'MMM d')}
                      </span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
