import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/Modal'
import toast from 'react-hot-toast'
import { ArrowLeft, Plus, Trash2, Pencil, UserPlus, UserMinus, Calendar, Tag } from 'lucide-react'
import { format, isPast } from 'date-fns'

const PRIORITY_COLOR = { high:'danger', medium:'warning', low:'success' }
const COLS = [
  { key: 'todo',        label: 'To Do',       dot:'muted'   },
  { key: 'in-progress', label: 'In Progress',  dot:'info'    },
  { key: 'completed',   label: 'Completed',    dot:'success' },
]

export default function ProjectDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin, user } = useAuth()

  const [project, setProject] = useState(null)
  const [tasks, setTasks]     = useState([])
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)

  const [taskModal,   setTaskModal]   = useState(false)
  const [memberModal, setMemberModal] = useState(false)
  const [editTask,    setEditTask]    = useState(null)
  const [saving,      setSaving]      = useState(false)

  const [taskForm, setTaskForm] = useState({ title:'', description:'', assignedTo:'', status:'todo', priority:'medium', dueDate:'', tags:'' })
  const [memberUserId, setMemberUserId] = useState('')

  const load = useCallback(async () => {
    try {
      const [pRes, tRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks?projectId=${id}`),
      ])
      setProject(pRes.data.project)
      setTasks(tRes.data.tasks)
      if (isAdmin) {
        const uRes = await api.get('/users')
        setUsers(uRes.data.users)
      }
    } catch { toast.error('Failed to load project'); navigate('/projects') }
    finally { setLoading(false) }
  }, [id, isAdmin, navigate])

  useEffect(() => { load() }, [load])

  const openCreate = () => { setEditTask(null); setTaskForm({ title:'',description:'',assignedTo:'',status:'todo',priority:'medium',dueDate:'',tags:'' }); setTaskModal(true) }
  const openEdit   = t => { setEditTask(t); setTaskForm({ title:t.title, description:t.description||'', assignedTo:t.assignedTo?._id||'', status:t.status, priority:t.priority, dueDate:t.dueDate?t.dueDate.split('T')[0]:'', tags:(t.tags||[]).join(',') }); setTaskModal(true) }

  const submitTask = async e => {
    e.preventDefault(); setSaving(true)
    try {
      const payload = { ...taskForm, project: id, tags: taskForm.tags ? taskForm.tags.split(',').map(s=>s.trim()).filter(Boolean) : [], assignedTo: taskForm.assignedTo||null, dueDate: taskForm.dueDate||null }
      if (editTask) {
        const { data } = await api.put(`/tasks/${editTask._id}`, payload)
        setTasks(prev => prev.map(t => t._id === editTask._id ? data.task : t))
        toast.success('Task updated!')
      } else {
        const { data } = await api.post('/tasks', payload)
        setTasks(prev => [data.task, ...prev])
        toast.success('Task created!')
      }
      setTaskModal(false)
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const deleteTask = async tid => {
    if (!confirm('Delete this task?')) return
    await api.delete(`/tasks/${tid}`)
    setTasks(prev => prev.filter(t => t._id !== tid))
    toast.success('Task deleted')
  }

  const updateStatus = async (tid, status) => {
    try {
      const { data } = await api.patch(`/tasks/${tid}/status`, { status })
      setTasks(prev => prev.map(t => t._id === tid ? data.task : t))
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const addMember = async e => {
    e.preventDefault()
    try {
      await api.post(`/projects/${id}/members`, { userId: memberUserId })
      toast.success('Member added')
      setMemberModal(false)
      load()
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const removeMember = async uid => {
    if (!confirm('Remove this member?')) return
    await api.delete(`/projects/${id}/members/${uid}`)
    toast.success('Member removed')
    load()
  }

  if (loading) return <div className="page-loading"><div className="spinner"/></div>
  if (!project) return null

  const nonMembers = users.filter(u => !project.members.some(m => m._id === u._id))

  return (
    <div className="page">
      <div className="page-header">
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <button className="btn btn-ghost btn-icon" onClick={() => navigate('/projects')}><ArrowLeft size={16}/></button>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <span style={{ width:12, height:12, borderRadius:'50%', background:project.color, display:'inline-block' }}/>
              <h1 className="page-title">{project.title}</h1>
            </div>
            {project.description && <p className="page-subtitle">{project.description}</p>}
          </div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {isAdmin && <button className="btn btn-ghost btn-sm" onClick={() => setMemberModal(true)}><UserPlus size={14}/> Members</button>}
          {isAdmin && <button className="btn btn-primary btn-sm" onClick={openCreate}><Plus size={14}/> New Task</button>}
        </div>
      </div>

      {/* Members */}
      <div className="section">
        <h2 className="section-title">Team Members</h2>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          {project.members.map(m => (
            <div key={m._id} style={{ display:'flex', alignItems:'center', gap:8, background:'var(--surface)', border:'1px solid var(--border)', borderRadius:8, padding:'6px 12px' }}>
              <div className="user-avatar" style={{ width:28, height:28, fontSize:12 }}>{m.name[0].toUpperCase()}</div>
              <div>
                <div style={{ fontSize:13, fontWeight:600 }}>{m.name}</div>
                <div style={{ fontSize:11, color:'var(--text3)' }}>{m.role}</div>
              </div>
              {isAdmin && m._id !== project.owner._id && (
                <button className="btn btn-danger btn-icon btn-sm" style={{ width:24, height:24 }} onClick={() => removeMember(m._id)}><UserMinus size={11}/></button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Kanban */}
      <div className="kanban">
        {COLS.map(col => {
          const colTasks = tasks.filter(t => t.status === col.key)
          return (
            <div key={col.key} className="kanban-col">
              <div className="kanban-col-header">
                <span className="kanban-col-title">
                  <span className={`status-dot status-dot--${col.dot}`}/>
                  {col.label}
                </span>
                <span className="kanban-col-count">{colTasks.length}</span>
              </div>
              <div className="kanban-col-body">
                {colTasks.length === 0 && <div style={{ color:'var(--text3)', fontSize:13, textAlign:'center', padding:'20px 0' }}>No tasks</div>}
                {colTasks.map(task => {
                  const canEdit = isAdmin || task.assignedTo?._id === user._id
                  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'completed'
                  return (
                    <div key={task._id} className="task-card">
                      <div className="task-card-header">
                        <span className="task-card-title">{task.title}</span>
                        <span className={`badge badge--${PRIORITY_COLOR[task.priority]}`}>{task.priority}</span>
                      </div>
                      {task.description && <p className="task-card-desc">{task.description}</p>}
                      <div className="task-card-footer">
                        {task.assignedTo && (
                          <div className="task-card-assignee">
                            <div className="assignee-avatar">{task.assignedTo.name[0].toUpperCase()}</div>
                            <span>{task.assignedTo.name}</span>
                          </div>
                        )}
                        {task.dueDate && (
                          <span className={`task-due${isOverdue?' overdue':''}`} style={{ display:'flex', alignItems:'center', gap:3 }}>
                            <Calendar size={11}/>{format(new Date(task.dueDate), 'MMM d')}
                          </span>
                        )}
                      </div>
                      {task.tags?.length > 0 && (
                        <div className="task-card-tags" style={{ marginTop:8 }}>
                          {task.tags.map(tag => <span key={tag} className="tag"><Tag size={9}/> {tag}</span>)}
                        </div>
                      )}
                      {canEdit && (
                        <div style={{ display:'flex', gap:4, marginTop:10 }}>
                          <select className="filter-select" style={{ flex:1, fontSize:12, padding:'4px 8px' }} value={task.status} onChange={e => updateStatus(task._id, e.target.value)}>
                            <option value="todo">To Do</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                          </select>
                          {isAdmin && (
                            <>
                              <button className="btn btn-ghost btn-icon btn-sm" onClick={() => openEdit(task)}><Pencil size={12}/></button>
                              <button className="btn btn-danger btn-icon btn-sm" onClick={() => deleteTask(task._id)}><Trash2 size={12}/></button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Task Modal */}
      {taskModal && (
        <Modal title={editTask ? 'Edit Task' : 'New Task'} onClose={() => setTaskModal(false)}>
          <form onSubmit={submitTask}>
            <div className="form-group">
              <label>Title *</label>
              <input value={taskForm.title} onChange={e=>setTaskForm(p=>({...p,title:e.target.value}))} required minLength={2} placeholder="Task title"/>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows={2} value={taskForm.description} onChange={e=>setTaskForm(p=>({...p,description:e.target.value}))} placeholder="Details..."/>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Status</label>
                <select value={taskForm.status} onChange={e=>setTaskForm(p=>({...p,status:e.target.value}))}>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select value={taskForm.priority} onChange={e=>setTaskForm(p=>({...p,priority:e.target.value}))}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Assign To</label>
                <select value={taskForm.assignedTo} onChange={e=>setTaskForm(p=>({...p,assignedTo:e.target.value}))}>
                  <option value="">Unassigned</option>
                  {project.members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" value={taskForm.dueDate} onChange={e=>setTaskForm(p=>({...p,dueDate:e.target.value}))}/>
              </div>
            </div>
            <div className="form-group">
              <label>Tags (comma separated)</label>
              <input value={taskForm.tags} onChange={e=>setTaskForm(p=>({...p,tags:e.target.value}))} placeholder="design, frontend, bug"/>
            </div>
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={()=>setTaskModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving?<div className="btn-spinner"/>:(editTask?'Save':'Create Task')}</button>
            </div>
          </form>
        </Modal>
      )}

      {/* Member Modal */}
      {memberModal && (
        <Modal title="Add Member" onClose={() => setMemberModal(false)}>
          <form onSubmit={addMember}>
            <div className="form-group">
              <label>Select User</label>
              <select value={memberUserId} onChange={e=>setMemberUserId(e.target.value)} required>
                <option value="">-- Choose user --</option>
                {nonMembers.map(u => <option key={u._id} value={u._id}>{u.name} ({u.email})</option>)}
              </select>
            </div>
            <div style={{ display:'flex', gap:8, justifyContent:'flex-end' }}>
              <button type="button" className="btn btn-ghost" onClick={()=>setMemberModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">Add Member</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
