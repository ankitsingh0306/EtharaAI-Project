import { useState, useEffect } from 'react'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { CheckSquare, Calendar, Tag } from 'lucide-react'
import { format, isPast } from 'date-fns'

const PRIORITY_COLOR = { high:'danger', medium:'warning', low:'success' }

export default function TasksPage() {
  const { isAdmin } = useAuth()
  const [tasks,    setTasks]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [status,   setStatus]   = useState('')
  const [priority, setPriority] = useState('')

  const load = () => {
    const params = new URLSearchParams()
    if (status)   params.set('status',   status)
    if (priority) params.set('priority', priority)
    api.get(`/tasks?${params}`).then(({ data }) => setTasks(data.tasks)).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [status, priority]) // eslint-disable-line

  const updateStatus = async (id, newStatus) => {
    try {
      const { data } = await api.patch(`/tasks/${id}/status`, { status: newStatus })
      setTasks(prev => prev.map(t => t._id === id ? data.task : t))
      toast.success('Status updated')
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const deleteTask = async id => {
    if (!confirm('Delete task?')) return
    await api.delete(`/tasks/${id}`)
    setTasks(prev => prev.filter(t => t._id !== id))
    toast.success('Deleted')
  }

  if (loading) return <div className="page-loading"><div className="spinner"/></div>

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Tasks</h1>
          <p className="page-subtitle">{tasks.length} task{tasks.length !== 1 ? 's' : ''} {!isAdmin ? '(assigned to you)' : ''}</p>
        </div>
      </div>

      <div className="filters">
        <select className="filter-select" value={status} onChange={e=>{setStatus(e.target.value);setLoading(true)}}>
          <option value="">All Status</option>
          <option value="todo">To Do</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select className="filter-select" value={priority} onChange={e=>{setPriority(e.target.value);setLoading(true)}}>
          <option value="">All Priority</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {tasks.length === 0 ? (
        <div className="empty-state"><CheckSquare size={48}/><h3>No tasks found</h3><p>Try clearing filters</p></div>
      ) : (
        <div className="task-list">
          {tasks.map(task => {
            const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'completed'
            return (
              <div key={task._id} className="task-row" style={{ flexWrap:'wrap', gap:10 }}>
                <div className="task-row-left" style={{ flex:'1 1 auto', minWidth:200 }}>
                  <span className={`status-dot status-dot--${task.status==='completed'?'success':task.status==='in-progress'?'info':'muted'}`}/>
                  <div>
                    <span className="task-row-title">{task.title}</span>
                    {task.project && <span className="task-row-project" style={{ color:task.project.color }}>{task.project.title}</span>}
                    {task.tags?.length > 0 && (
                      <div className="task-card-tags" style={{ marginTop:4 }}>
                        {task.tags.map(t=><span key={t} className="tag"><Tag size={9}/>{t}</span>)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="task-row-right" style={{ flexWrap:'wrap', gap:8 }}>
                  {task.assignedTo && (
                    <span style={{ fontSize:12, color:'var(--text2)', display:'flex', alignItems:'center', gap:4 }}>
                      <div className="assignee-avatar" style={{width:20,height:20,fontSize:9}}>{task.assignedTo.name[0].toUpperCase()}</div>
                      {task.assignedTo.name}
                    </span>
                  )}
                  <span className={`badge badge--${PRIORITY_COLOR[task.priority]}`}>{task.priority}</span>
                  {task.dueDate && (
                    <span className={`task-due${isOverdue?' overdue':''}`} style={{ display:'flex', alignItems:'center', gap:3 }}>
                      <Calendar size={11}/>{format(new Date(task.dueDate), 'MMM d, yyyy')}
                    </span>
                  )}
                  <select
                    className="filter-select"
                    style={{ padding:'4px 8px', fontSize:12, borderRadius:6 }}
                    value={task.status}
                    onChange={e => updateStatus(task._id, e.target.value)}
                  >
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                  {isAdmin && (
                    <button className="btn btn-danger btn-sm btn-icon" onClick={() => deleteTask(task._id)} style={{width:28,height:28}}>
                      ✕
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
