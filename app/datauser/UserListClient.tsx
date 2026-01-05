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

    // Separate Filters
    const [pFilterTeam, setPFilterTeam] = useState('')
    const [pFilterNum, setPFilterNum] = useState<string>('')
    const [kFilterTeam, setKFilterTeam] = useState('')

    const handleDelete = (id: string) => {
        setUsers(users.filter(u => u.id !== id))
    }

    const handleAdd = async () => {
        if ((newUser.role === 'petugas' || newUser.role === 'koordinator')) {
            if (!newUser.role_petugas_team) {
                alert('Harap pilih Tim PPSU!')
                return
            }
            if (newUser.role === 'petugas' && newUser.role_petugas_team !== 'penyapuan' && !newUser.team_number) {
                alert('Harap pilih Nomor Tim!')
                return
            }
        }

        const payload = {
            ...newUser,
            role_petugas_team: (newUser.role === 'petugas' || newUser.role === 'koordinator') ? newUser.role_petugas_team : null,
            team_number: (newUser.role === 'petugas') ? newUser.team_number : null
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

    const getTeamCount = (type: string) => {
        if (type === 'crm') return 3
        if (type === 'wilayah') return 11
        if (type === 'penyapuan') return 1
        return 0
    }

    // Role Grouping & Filtering
    const petugasList = users.filter(u => u.role === 'petugas').filter(u => {
        const matchTeam = pFilterTeam ? u.role_petugas_team === pFilterTeam : true
        const matchNum = pFilterNum ? String(u.team_number) === pFilterNum : true
        return matchTeam && matchNum
    })

    const koordinatorList = users.filter(u => u.role === 'koordinator').filter(u => {
        return kFilterTeam ? u.role_petugas_team === kFilterTeam : true
    })

    const lurahList = users.filter(u => u.role === 'lurah')

    const renderTable = (data: any[], role: string) => {
        const isStaff = role === 'petugas' || role === 'koordinator'

        return (
            <div className="mb-12 overflow-hidden shadow-sm rounded-3xl border border-zinc-200 bg-white">
                {/* Unified Header & Title Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-5 gap-4 border-b border-zinc-100 bg-zinc-50/30">
                    <h2 className="text-base font-black text-zinc-900 uppercase tracking-tight flex items-center gap-3">
                        <span className="w-1.5 h-6 bg-orange-light rounded-full"></span>
                        {role}
                        <span className="text-xs font-bold text-zinc-400 normal-case tracking-normal ml-2 bg-white px-2 py-0.5 rounded-full border border-zinc-100 shadow-sm">{data.length} User</span>
                    </h2>

                    {/* Filters per Role */}
                    <div className="flex gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
                        {role === 'petugas' && (
                            <>
                                <select
                                    value={pFilterTeam}
                                    onChange={(e) => { setPFilterTeam(e.target.value); setPFilterNum('') }}
                                    className="p-2.5 border border-zinc-200 rounded-xl text-[11px] font-bold outline-none focus:ring-4 focus:ring-orange-light/10 bg-white shadow-sm transition-all flex-shrink-0"
                                >
                                    <option value="">Semua Tim</option>
                                    {teamOptions.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                                {pFilterTeam && pFilterTeam !== 'penyapuan' && (
                                    <select
                                        value={pFilterNum}
                                        onChange={(e) => setPFilterNum(e.target.value)}
                                        className="p-2.5 border border-zinc-200 rounded-xl text-[11px] font-bold outline-none focus:ring-4 focus:ring-orange-light/10 bg-white shadow-sm transition-all flex-shrink-0"
                                    >
                                        <option value="">Grup</option>
                                        {Array.from({ length: getTeamCount(pFilterTeam) }, (_, i) => i + 1).map(num => (
                                            <option key={num} value={num}>Tim {num}</option>
                                        ))}
                                    </select>
                                )}
                            </>
                        )}
                        {role === 'koordinator' && (
                            <select
                                value={kFilterTeam}
                                onChange={(e) => setKFilterTeam(e.target.value)}
                                className="p-2.5 border border-zinc-200 rounded-xl text-[11px] font-bold outline-none focus:ring-4 focus:ring-orange-light/10 bg-white shadow-sm transition-all flex-shrink-0"
                            >
                                <option value="">Semua Tim</option>
                                {teamOptions.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left text-[13px]">
                        <thead>
                            <tr className="bg-zinc-50/50 border-b border-zinc-200">
                                <th className="pl-8 p-4 font-black text-zinc-400 uppercase tracking-widest">Username</th>
                                <th className="p-4 font-black text-zinc-400 uppercase tracking-widest">Nama Lengkap</th>
                                {isStaff && <th className="p-4 font-black text-zinc-400 uppercase tracking-widest">Jenis Tim</th>}
                                {isStaff && <th className="p-4 font-black text-zinc-400 uppercase tracking-widest text-center">No. Tim</th>}
                                <th className="p-4 font-black text-zinc-400 uppercase tracking-widest">No. HP</th>
                                {currentUserRole !== 'lurah' && <th className="p-4 font-black text-zinc-400 uppercase tracking-widest text-center">Aksi</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {data.map((user) => (
                                <tr key={user.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/50 transition duration-200">
                                    <td className="pl-8 p-4 font-black text-zinc-900 tracking-tight">{user.username}</td>
                                    <td className="p-4">
                                        <div className="font-bold text-zinc-600">{user.name}</div>
                                        <div className="text-[10px] text-zinc-300 font-black uppercase mt-0.5">{role}</div>
                                    </td>
                                    {isStaff && <td className="p-4"><span className="px-2 py-1 bg-zinc-100 text-zinc-500 rounded-md font-black uppercase text-[10px] tracking-wider">{user.role_petugas_team || '-'}</span></td>}
                                    {isStaff && <td className="p-4 text-center font-black text-zinc-400">{user.team_number || '-'}</td>}
                                    <td className="p-4 text-zinc-500 font-mono tracking-tighter">{user.phone_number || '-'}</td>
                                    {currentUserRole !== 'lurah' && (
                                        <td className="p-4 text-center">
                                            <div className="flex justify-center">
                                                <UserActions user={user} onDelete={handleDelete} currentUserRole={currentUserRole} />
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))}
                            {data.length === 0 && (
                                <tr>
                                    <td colSpan={isStaff ? 6 : 4} className="p-16 text-center text-zinc-300 italic font-medium uppercase tracking-widest">Data kosong</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        )
    }

    return (
        <div>
            {/* Add User Section */}
            <div className="mb-8 flex justify-between items-center bg-white p-6 rounded-2xl border border-zinc-100 shadow-sm">
                <div>
                    <h2 className="text-xl font-black text-zinc-900 tracking-tight uppercase">MANAGE USERS</h2>
                    <p className="text-xs text-zinc-400 font-medium uppercase tracking-[0.2em] mt-1">Kelola data petugas, koordinator, dan admin</p>
                </div>
                {currentUserRole !== 'lurah' && (
                    <button
                        onClick={() => setIsAdding(!isAdding)}
                        className={`px-6 py-2.5 rounded-xl font-bold transition flex items-center gap-2 shadow-lg shadow-zinc-100 ${isAdding ? 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200' : 'bg-zinc-900 text-white hover:bg-zinc-800'}`}
                    >
                        {isAdding ? 'Cancel' : (
                            <>
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                                Add User
                            </>
                        )}
                    </button>
                )}
            </div>

            {isAdding && (
                <div className="mb-10 p-8 bg-zinc-50 rounded-3xl border-2 border-dashed border-zinc-200 animate-in fade-in slide-in-from-top-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Username</label>
                            <input placeholder="Username" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} className="w-full p-3 bg-white border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-light/20 font-medium transition" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Password</label>
                            <input placeholder="Password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} className="w-full p-3 bg-white border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-light/20 font-medium transition" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                            <input placeholder="Nama Lengkap" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} className="w-full p-3 bg-white border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-light/20 font-medium transition" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Role</label>
                            <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })} className="w-full p-3 bg-white border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-light/20 font-black uppercase transition">
                                <option value="petugas">Petugas</option>
                                <option value="koordinator">Koordinator</option>
                                <option value="admin">Admin</option>
                                <option value="lurah">Lurah</option>
                            </select>
                        </div>
                    </div>

                    {(newUser.role === 'petugas' || newUser.role === 'koordinator') && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 pt-4 border-t border-zinc-200">
                            <div className="space-y-1">
                                <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Jenis Tim</label>
                                <select
                                    value={newUser.role_petugas_team || ''}
                                    onChange={e => {
                                        const val = e.target.value
                                        setNewUser({
                                            ...newUser,
                                            role_petugas_team: val,
                                            team_number: val === 'penyapuan' ? 1 : undefined
                                        })
                                    }}
                                    className="w-full p-3 bg-white border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-light/20 font-black uppercase transition"
                                >
                                    <option value="">Pilih Tim PPSU...</option>
                                    {teamOptions.map(team => <option key={team} value={team}>{team}</option>)}
                                </select>
                            </div>

                            {newUser.role_petugas_team && newUser.role_petugas_team !== 'penyapuan' && newUser.role !== 'koordinator' && (
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-widest ml-1">Nomor Tim</label>
                                    <select
                                        value={newUser.team_number || ''}
                                        onChange={e => setNewUser({ ...newUser, team_number: parseInt(e.target.value) })}
                                        className="w-full p-3 bg-white border border-zinc-200 rounded-xl outline-none focus:ring-2 focus:ring-orange-light/20 font-black uppercase transition"
                                    >
                                        <option value="">Nomor Tim</option>
                                        {Array.from({ length: getTeamCount(newUser.role_petugas_team) }, (_, i) => i + 1).map(num => (
                                            <option key={num} value={num}>Tim {num}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {newUser.role_petugas_team === 'penyapuan' && (
                                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-zinc-200 self-end h-[50px]">
                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest italic">Tim 1 (Auto)</span>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex justify-end">
                        <button onClick={handleAdd} className="px-10 py-3 bg-orange-light text-white rounded-2xl font-black uppercase tracking-widest hover:bg-orange-deep transition shadow-lg shadow-orange-light/20">SAVE USER</button>
                    </div>
                </div>
            )}

            {/* Role-based Tables */}
            {renderTable(petugasList, 'petugas')}
            {renderTable(koordinatorList, 'koordinator')}
            {renderTable(lurahList, 'lurah')}
        </div>
    )
}

const inputStyle = { padding: '0.4rem', border: '1px solid #ccc', borderRadius: '4px' }
const thStyle = { padding: '0.75rem 1rem', fontWeight: '600', color: '#52525b' }
const tdStyle = { padding: '0.75rem 1rem', color: '#18181b' }
