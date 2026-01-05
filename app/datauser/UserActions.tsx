'use client'

import { useState } from 'react'

export default function UserActions({ user, onDelete, currentUserRole }: { user: any, onDelete: (id: string) => void, currentUserRole: string }) {
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({ ...user })

    const handleDelete = async () => {
        if (confirm('Are you sure you want to delete this user?')) {
            const res = await fetch(`/api/user/${user.id}`, { method: 'DELETE' })
            if (res.ok) {
                onDelete(user.id)
            } else {
                const err = await res.json()
                alert(`Error: ${err.error}`)
            }
        }
    }

    const handleUpdate = async () => {
        const res = await fetch(`/api/user/${user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        })
        if (res.ok) {
            setIsEditing(false)
            window.location.reload()
        } else {
            const err = await res.json()
            alert(`Error: ${err.error}`)
        }
    }

    const handleResetPassword = async () => {
        const newPassword = prompt(`Reset password for ${user.username}. Enter new password:`)
        if (newPassword) {
            const res = await fetch(`/api/user/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...user, password: newPassword }),
            })
            if (res.ok) {
                alert('Password reset successfully')
            } else {
                const err = await res.json()
                alert(`Error: ${err.error}`)
            }
        }
    }

    if (isEditing) {
        return (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} placeholder="Username" style={inputStyle} />
                <input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Name" style={inputStyle} />
                <input value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} placeholder="Role" style={inputStyle} />
                <button onClick={handleUpdate} className="px-2 py-1 bg-orange-light text-white rounded hover:bg-orange-deep transition text-sm">Save</button>
                <button onClick={() => setIsEditing(false)} className="px-2 py-1 bg-gray-dark text-white rounded hover:opacity-80 transition text-sm">Cancel</button>
            </div>
        )
    }

    return (
        <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={() => setIsEditing(true)} className="px-2 py-1 bg-orange-light text-white rounded hover:bg-orange-deep transition text-sm">Edit</button>
            {currentUserRole === 'admin' && (
                <button onClick={handleResetPassword} className="px-2 py-1 bg-zinc-900 text-white rounded hover:bg-zinc-800 transition text-sm">Reset Pass</button>
            )}
            <button onClick={handleDelete} className="px-2 py-1 bg-orange-deep text-white rounded hover:opacity-80 transition text-sm">Delete</button>
        </div>
    )
}

const inputStyle = { padding: '0.2rem', border: '1px solid #ccc', borderRadius: '4px' }
