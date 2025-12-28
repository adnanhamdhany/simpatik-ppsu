'use client'

import { useState } from 'react'
import UserActions from './UserActions'

export default function UserListClient({ initialUsers, teamOptions, currentUserRole }: { initialUsers: any[], teamOptions: string[], currentUserRole: string }) {
    const [users, setUsers] = useState(initialUsers)
    const [isAdding, setIsAdding] = useState(false)
    const [newUser, setNewUser] = useState<{
        username: string,
        password: string,
        name: string,
        role: string,
        role_petugas_team?: string,
        team_number?: number
    }>({
        username: '',
        password: '',
        name: '',
        role: 'petugas',
        role_petugas_team: '',
        team_number: undefined
    })

    // Filters state
    const [filterRole, setFilterRole] = useState('')
    const [filterTeam, setFilterTeam] = useState('')

    const handleDelete = (id: string) => {
        setUsers(users.filter(u => u.id !== id))
    }

    const handleAdd = async () => {
        // Validation: Petugas & Koordinator MUST have a team
        if ((newUser.role === 'petugas' || newUser.role === 'koordinator')) {
            if (!newUser.role_petugas_team) {
                alert('Harap pilih Tim PPSU!')
                return
            }
            if (!newUser.team_number) {
                alert('Harap pilih Nomor Tim!')
                return
            }
        }

        // Prepare payload: Ensure fields meant to be null are null, not empty strings
        const payload = {
            ...newUser,
            role_petugas_team: (newUser.role === 'petugas' || newUser.role === 'koordinator') ? newUser.role_petugas_team : null,
            team_number: (newUser.role === 'petugas' || newUser.role === 'koordinator') ? newUser.team_number : null
        }

        const res = await fetch('/api/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })

        if (res.ok) {
            window.location.reload()
        } else {
            const err = await res.json()
            alert('Failed to add user: ' + (err.error || 'Unknown error'))
        }
    }

    // Filter Logic
    const filteredUsers = users.filter(user => {
        const matchRole = filterRole ? user.role === filterRole : true
        const matchTeam = filterTeam ? user.role_petugas_team === filterTeam : true
        return matchRole && matchTeam
    })

    // Helper to get number of teams based on selected type
    const getTeamCount = (type: string) => {
        if (type === 'crm') return 3
        if (type === 'wilayah') return 11
        if (type === 'penyapuan') return 1
        return 0
    }

    // Effect to auto-select team number if count is 1
    const selectedTeamType = newUser.role_petugas_team
    if (selectedTeamType === 'penyapuan' && newUser.team_number !== 1) {
        // This causes infinite loop if not careful, better handle in UI or onChange
    }

    return (
        <div>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <button onClick={() => setIsAdding(!isAdding)} style={addBtnStyle}>+ Add User</button>

                {/* Admin Filters */}
                {currentUserRole === 'admin' && (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <select
                            value={filterRole}
                            onChange={(e) => setFilterRole(e.target.value)}
                            style={{ ...inputStyle, minWidth: '150px' }}
                        >
                            <option value="">Semua Role</option>
                            <option value="petugas">Petugas</option>
                            <option value="koordinator">Koordinator</option>
                            <option value="admin">Admin</option>
                            <option value="lurah">Lurah</option>
                        </select>

                        <select
                            value={filterTeam}
                            onChange={(e) => setFilterTeam(e.target.value)}
                            style={{ ...inputStyle, minWidth: '150px' }}
                        >
                            <option value="">Semua Tim</option>
                            {teamOptions.map(team => (
                                <option key={team} value={team}>{team}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {isAdding && (
                <div style={{ marginBottom: '1rem', padding: '1rem', border: '1px solid #ddd', borderRadius: '4px', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <input placeholder="Username" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} style={inputStyle} />
                    <input placeholder="Password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} style={inputStyle} />
                    <input placeholder="Name" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} style={inputStyle} />
                    <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} style={inputStyle}>
                        <option value="petugas">Petugas</option>
                        <option value="koordinator">Koordinator</option>
                        <option value="admin">Admin</option>
                        <option value="lurah">Lurah</option>
                    </select>

                    {/* Conditional Team Dropdown for Petugas & Koordinator */}
                    {(newUser.role === 'petugas' || newUser.role === 'koordinator') && (
                        <>
                            <select
                                value={newUser.role_petugas_team || ''}
                                onChange={e => {
                                    const val = e.target.value
                                    setNewUser({
                                        ...newUser,
                                        role_petugas_team: val,
                                        team_number: val === 'penyapuan' ? 1 : undefined // Auto select 1 for penyapuan
                                    })
                                }}
                                style={inputStyle}
                            >
                                <option value="">Pilih Tim PPSU...</option>
                                {/* We use teamOptions passed from props, or hardcode specific ones if user wants exact control */}
                                {teamOptions.map(team => (
                                    <option key={team} value={team}>{team}</option>
                                ))}
                            </select>

                            {/* Team Number Dropdown */}
                            {newUser.role_petugas_team && newUser.role_petugas_team !== 'penyapuan' && (
                                <select
                                    value={newUser.team_number || ''}
                                    onChange={e => setNewUser({ ...newUser, team_number: parseInt(e.target.value) })}
                                    style={inputStyle}
                                >
                                    <option value="">Nomor Tim</option>
                                    {Array.from({ length: getTeamCount(newUser.role_petugas_team) }, (_, i) => i + 1).map(num => (
                                        <option key={num} value={num}>Tim {num}</option>
                                    ))}
                                </select>
                            )}

                            {/* Display auto-selected team for Penyapuan */}
                            {newUser.role_petugas_team === 'penyapuan' && (
                                <span style={{ padding: '0.4rem', color: '#555', fontSize: '0.9rem' }}>Tim 1 (Auto)</span>
                            )}
                        </>
                    )}

                    <button onClick={handleAdd} style={saveBtnStyle}>Save</button>
                </div>
            )}

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f4f4f5', borderBottom: '1px solid #d4d4d8' }}>
                            <th style={thStyle}>ID</th>
                            <th style={thStyle}>Username</th>
                            <th style={thStyle}>Name</th>
                            <th style={thStyle}>Role</th>
                            <th style={thStyle}>Tim</th>
                            <th style={thStyle}>No.</th>
                            <th style={thStyle}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map((user) => (
                            <tr key={user.id} style={{ borderBottom: '1px solid #e4e4e7' }}>
                                <td style={tdStyle}>{user.id}</td>
                                <td style={tdStyle}>{user.username}</td>
                                <td style={tdStyle}>{user.name}</td>
                                <td style={tdStyle}>{user.role}</td>
                                <td style={tdStyle}>{user.role_petugas_team || '-'}</td>
                                <td style={tdStyle}>{user.team_number || '-'}</td>
                                <td style={tdStyle}>
                                    <UserActions user={user} onDelete={handleDelete} />
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && (
                            <tr>
                                <td colSpan={5} style={{ padding: '1rem', textAlign: 'center' }}>No users found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

const inputStyle = { padding: '0.4rem', border: '1px solid #ccc', borderRadius: '4px' }
const addBtnStyle = { padding: '0.5rem 1rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 600 }
const saveBtnStyle = { padding: '0.4rem 1rem', backgroundColor: '#22c55e', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }
const thStyle = { padding: '0.75rem 1rem', fontWeight: '600', color: '#52525b' }
const tdStyle = { padding: '0.75rem 1rem', color: '#18181b' }
