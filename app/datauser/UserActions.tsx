'use client'

import { useState } from 'react'

export default function UserActions({ user, onDelete }: { user: any, onDelete: (id: string) => void }) {
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({ ...user })

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this user?')) {
            await fetch(`/api/user/${user.id}`, { method: 'DELETE' })
            onDelete(user.id)
        }
    }

    const handleUpdate = async () => {
        await fetch(`/api/user/${user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        })
        setIsEditing(false)
        window.location.reload()
    }

    if (isEditing) {
        return (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} placeholder="Username" style={inputStyle} />
                <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Name" style={inputStyle} />
                <input value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} placeholder="Role" style={inputStyle} />
                <button onClick={handleUpdate} style={saveBtnStyle}>Save</button>
                <button onClick={() => setIsEditing(false)} style={cancelBtnStyle}>Cancel</button>
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => setIsEditing(true)} style={editBtnStyle}>Edit</button>
            <button onClick={handleDelete} style={deleteBtnStyle}>Delete</button>
        </div>
    )
}

const inputStyle = { padding: '0.2rem', border: '1px solid #ccc', borderRadius: '4px' }
const editBtnStyle = { padding: '0.2rem 0.5rem', backgroundColor: '#eab308', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }
const deleteBtnStyle = { padding: '0.2rem 0.5rem', backgroundColor: '#ef4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }
const saveBtnStyle = { padding: '0.2rem 0.5rem', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }
const cancelBtnStyle = { padding: '0.2rem 0.5rem', backgroundColor: '#64748b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }
