import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { Users, Shield, User, Trash2 } from 'lucide-react'
import { format } from 'date-fns'

export default function UsersPage() {
  const { isAdmin, user: me } = useAuth()
  const navigate = useNavigate()
  const [users,   setUsers]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAdmin) { navigate('/dashboard'); return }
    api.get('/users').then(({ data }) => setUsers(data.users)).finally(() => setLoading(false))
  }, [isAdmin, navigate])

  const changeRole = async (id, role) => {
    try {
      const { data } = await api.patch(`/users/${id}/role`, { role })
      setUsers(prev => prev.map(u => u._id === id ? data.user : u))
      toast.success('Role updated')
    } catch (err) { toast.error(err.response?.data?.message || 'Error') }
  }

  const deleteUser = async id => {
    if (!confirm('Delete this user?')) return
    await api.delete(`/users/${id}`)
    setUsers(prev => prev.filter(u => u._id !== id))
    toast.success('User deleted')
  }

  if (loading) return <div className="page-loading"><div className="spinner"/></div>

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Team Members</h1>
          <p className="page-subtitle">{users.length} registered user{users.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <div className="user-avatar" style={{ width:34, height:34, fontSize:14 }}>{u.name[0].toUpperCase()}</div>
                    <span style={{ fontWeight:600 }}>{u.name}{u._id === me._id && <span style={{ fontSize:11, color:'var(--text3)', marginLeft:6 }}>(you)</span>}</span>
                  </div>
                </td>
                <td style={{ color:'var(--text2)', fontSize:13 }}>{u.email}</td>
                <td>
                  <span className={`user-role ${u.role}`} style={{ fontSize:12 }}>
                    {u.role === 'admin' ? <><Shield size={10}/> Admin</> : <><User size={10}/> Member</>}
                  </span>
                </td>
                <td style={{ color:'var(--text2)', fontSize:13 }}>{format(new Date(u.createdAt), 'MMM d, yyyy')}</td>
                <td>
                  <div style={{ display:'flex', gap:6, alignItems:'center' }}>
                    {u._id !== me._id && (
                      <>
                        <select
                          className="filter-select"
                          style={{ padding:'5px 8px', fontSize:12 }}
                          value={u.role}
                          onChange={e => changeRole(u._id, e.target.value)}
                        >
                          <option value="member">Member</option>
                          <option value="admin">Admin</option>
                        </select>
                        <button className="btn btn-danger btn-sm btn-icon" style={{ width:30, height:30 }} onClick={() => deleteUser(u._id)}>
                          <Trash2 size={13}/>
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
