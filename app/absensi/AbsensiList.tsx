'use client'

import { useState } from 'react'

// Hardcoded options to match database ENUM
const TEAM_OPTIONS = ['wilayah', 'penyapuan', 'crm']

export default function AbsensiList({ absensiData, userRole }: { absensiData: any[], userRole: string }) {
    const [list, setList] = useState(absensiData)

    // Filters state
    const [filterTeam, setFilterTeam] = useState('')
    const [filterStatus, setFilterStatus] = useState('')
    const [filterDate, setFilterDate] = useState('')

    const handleApprove = async (id: string) => {
        if (!confirm('Approve absen ini?')) return

        try {
            const res = await fetch('/api/absensi/approve', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id })
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            // Optimistic update
            setList(prev => prev.map(item =>
                item.id === id ? { ...item, status: 'approved' } : item
            ))

            alert('Absen disetujui!')

        } catch (error: any) {
            alert('Approval gagal: ' + error.message)
        }
    }

    // Filter Logic
    const filteredList = list.filter(item => {
        const matchTeam = filterTeam ? item.user?.role_petugas_team === filterTeam : true
        const matchStatus = filterStatus ? item.status === filterStatus : true

        let matchDate = true
        if (filterDate) {
            const itemDate = new Date(item.created_at).toISOString().split('T')[0] // YYYY-MM-DD
            matchDate = itemDate === filterDate
        }

        return matchTeam && matchStatus && matchDate
    })

    if (list.length === 0) {
        return <div style={{ color: '#6b7280', padding: '1rem', fontStyle: 'italic' }}>Belum ada data absensi.</div>
    }

    return (
        <div>
            {/* Admin Filters */}
            {userRole === 'admin' && (
                <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <select
                        value={filterTeam}
                        onChange={(e) => setFilterTeam(e.target.value)}
                        style={filterInputStyle}
                    >
                        <option value="">Semua Tim</option>
                        {TEAM_OPTIONS.map(team => (
                            <option key={team} value={team}>{team}</option>
                        ))}
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        style={filterInputStyle}
                    >
                        <option value="">Semua Status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>

                    <input
                        type="date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        style={filterInputStyle}
                    />

                    {(filterTeam || filterStatus || filterDate) && (
                        <button
                            onClick={() => { setFilterTeam(''); setFilterStatus(''); setFilterDate('') }}
                            style={{ ...filterInputStyle, backgroundColor: '#f3f4f6', cursor: 'pointer' }}
                        >
                            Reset
                        </button>
                    )}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {filteredList.map((item) => (
                    <div key={item.id} style={{
                        backgroundColor: 'white',
                        borderRadius: '8px',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        overflow: 'hidden',
                        border: item.status === 'approved' ? '2px solid #22c55e' : '2px solid #e5e7eb'
                    }}>
                        <div style={{ height: '200px', backgroundColor: '#f3f4f6', position: 'relative' }}>
                            <img
                                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/absensi/${item.image_path}`}
                                alt="Absensi"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{
                                position: 'absolute', top: '10px', right: '10px',
                                backgroundColor: item.status === 'approved' ? '#22c55e' : '#eab308',
                                color: 'white', padding: '4px 10px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold'
                            }}>
                                {item.status.toUpperCase()}
                            </div>
                        </div>
                        <div style={{ padding: '1rem' }}>
                            <p style={{ fontWeight: 'bold', fontSize: '1rem', marginBottom: '0.25rem' }}>
                                {item.user?.name || 'Unknown'}
                            </p>
                            <p style={{ fontSize: '0.8rem', color: '#6b7280', marginBottom: '0.5rem' }}>
                                {item.user?.role} - {item.user?.role_petugas_team || '-'}
                            </p>
                            <p suppressHydrationWarning style={{ fontSize: '0.75rem', color: '#9ca3af' }}>
                                {new Date(item.created_at).toLocaleString()}
                            </p>

                            {userRole === 'admin' && item.status === 'pending' && (
                                <button
                                    onClick={() => handleApprove(item.id)}
                                    style={{
                                        marginTop: '1rem',
                                        width: '100%',
                                        padding: '0.5rem',
                                        backgroundColor: '#22c55e',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '4px',
                                        cursor: 'pointer',
                                        fontWeight: '500'
                                    }}
                                >
                                    ✅ Approve
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

const filterInputStyle = {
    padding: '0.5rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '0.875rem'
}
