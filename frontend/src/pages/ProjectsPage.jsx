import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import Modal from '../components/Modal'
import toast from 'react-hot-toast'
import { Plus, FolderKanban, Pencil, Trash2, ChevronRight, CheckCircle2 } from 'lucide-react'

const COLORS = ['#6366f1','#ec4899','#f59e0b','#10b981','#06b6d4','#8b5cf6','#f97316','#ef4444']
const STATUS_OPTS = ['active','completed','on-hold']

export default function ProjectsPage() {
  const { isAdmin } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)
  const [modal, setModal]       = useState(false)
  const [editing, setEditing]   = useState(null)
  const [saving, setSaving]     = useState(false)
  const [form, setForm] = useState({ title:'', description:'', color:'#6366f1', status:'active' })

  const load = () => api.get('/projects').then(({ data }) => setProjects(data.projects)).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  const openCreate = () => { setEditing(null); setForm({ title:'', description:'', color:'#6366f1', status:'active' }); setModal(true) }
  const openEdit = (e, p) => { e.stopPropagation(); setEditing(p); setForm({ title: p.title, description: p.description, color: p.color, status: p.status }); setModal(true) }

  const handleSubmit = async e => {
    e.preventDefault(); setSaving(true)
    try {
      if (editing) {
        const { data } = await api.put(`/projects/${editing._id}`, form)
        setProjects(prev => prev.map(p => p._id === editing._id ? { ...data.project, taskCount: p.taskCount, completedCount: p.completedCount } : p))
        toast.success('Project updated!')
      } else {
        const { data } = await api.post('/projects', form)
        setProjects(prev => [{ ...data.project, taskCount: 0, completedCount: 0 }, ...prev])
        toast.success('Project created!')
      }
      setModal(false)
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
    finally { setSaving(false) }
  }

  const del = async (e, id) => {
    e.stopPropagation()
    if (!confirm('Delete project and all its tasks?')) return
    await api.delete(`/projects/${id}`)
    setProjects(prev => prev.filter(p => p._id !== id))
    toast.success('Deleted')
  }

  if (loading) return <div className="page-loading"><div className="spinner"/></div>

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Projects</h1>
          <p className="page-subtitle">{projects.length} project{projects.length !== 1 ? 's' : ''}</p>
        </div>
        {isAdmin && <button className="btn btn-primary" onClick={openCreate}><Plus size={15}/> New Project</button>}
      </div>

      {projects.length === 0 ? (
        <div className="empty-state"><FolderKanban size={48}/><h3>No projects yet</h3>{isAdmin && <p>Create your first project</p>}</div>
      ) : (
        <div className="project-grid">
          {projects.map(p => {
            const pct = p.taskCount ? Math.round((p.completedCount / p.taskCount) * 100) : 0
            return (
              <div key={p._id} className="project-card" onClick={() => navigate(`/projects/${p._id}`)}>
                <div className="project-card-top" style={{ background: p.color }} />
                <div className="project-card-body">
                  <div className="project-card-header">
                    <h3 className="project-card-title">{p.title}</h3>
                    {isAdmin && (
                      <div className="project-card-actions">
                        <button className="btn btn-ghost btn-sm btn-icon" onClick={e => openEdit(e, p)}><Pencil size={13}/></button>
                        <button className="btn btn-danger btn-sm btn-icon" onClick={e => del(e, p._id)}><Trash2 size={13}/></button>
                      </div>
                    )}
                  </div>
                  <p className="project-card-desc">{p.description || 'No description'}</p>
                  <div className="project-card-meta">
                    <span className="project-card-stat"><CheckCircle2 size={13}/>{p.completedCount}/{p.taskCount} tasks</span>
                    <span className={`badge badge--${p.status === 'active' ? 'success' : p.status === 'on-hold' ? 'warning' : 'info'}`}>{p.status}</span>
                  </div>
                  <div className="progress-bar"><div className="progress-fill" style={{ width: `${pct}%` }}/></div>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:8 }}>
                    <div className="project-members">
                      {p.members?.slice(0,4).map(m => (
                        <div key={m._id} className="member-chip" title={m.name}>{m.name[0].toUpperCase()}</div>
                      ))}
                    </div>
                    <ChevronRight size={16} style={{ color:'var(--text3)' }}/>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {modal && (
        <Modal title={editing ? 'Edit Project' : 'New Project'} onClose={() => setModal(false)}>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title *</label>
              <input value={form.title} onChange={e => setForm(p=>({...p,title:e.target.value}))} required minLength={2} placeholder="Project name"/>
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows={3} value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))} placeholder="What is this project about?"/>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={form.status} onChange={e => setForm(p=>({...p,status:e.target.value}))}>
                {STATUS_OPTS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Color</label>
              <div className="color-picker">
                {COLORS.map(c => (
                  <div key={c} className={`color-dot${form.color===c?' selected':''}`} style={{background:c}} onClick={()=>setForm(p=>({...p,color:c}))}/>
                ))}
              </div>
            </div>
            <div style={{display:'flex',gap:8,justifyContent:'flex-end',marginTop:8}}>
              <button type="button" className="btn btn-ghost" onClick={()=>setModal(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving?<div className="btn-spinner"/>:(editing?'Save Changes':'Create')}</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  )
}
