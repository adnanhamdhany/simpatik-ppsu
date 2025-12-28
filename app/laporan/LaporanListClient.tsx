'use client'

import { useState } from 'react'
import ApproveButton from './ApproveButton'

const TEAM_OPTIONS = ['wilayah', 'penyapuan', 'crm']

export default function LaporanListClient({ initialLaporan, userRole }: { initialLaporan: any[], userRole: string }) {
    const [laporan, setLaporan] = useState(initialLaporan)

    // Filters state
    const [filterTeam, setFilterTeam] = useState('')
    const [filterStatus, setFilterStatus] = useState('')
    const [filterDate, setFilterDate] = useState('')

    // Filter Logic
    const filteredLaporan = laporan.filter(item => {
        const matchTeam = filterTeam ? item.koordinator_team === filterTeam : true
        const matchStatus = filterStatus ? (filterStatus === 'approved' ? item.approved : !item.approved) : true

        let matchDate = true
        if (filterDate) {
            const itemDate = new Date(item.created_at).toISOString().split('T')[0]
            matchDate = itemDate === filterDate
        }

        return matchTeam && matchStatus && matchDate
    })

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

            <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                    <thead>
                        <tr style={{ backgroundColor: '#f4f4f5', borderBottom: '1px solid #d4d4d8' }}>
                            <th style={thStyle}>Date</th>
                            <th style={thStyle}>Image</th>
                            <th style={thStyle}>Description</th>
                            <th style={thStyle}>Status</th>
                            {userRole === 'admin' && <th style={thStyle}>Koordinator</th>}
                            {userRole === 'admin' && <th style={thStyle}>Tim</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLaporan.map((item: any) => (
                            <tr key={item.id} style={{ borderBottom: '1px solid #e4e4e7' }}>
                                <td style={tdStyle}>
                                    <span suppressHydrationWarning>
                                        {new Date(item.created_at).toLocaleString()}
                                    </span>
                                </td>
                                <td style={tdStyle}>
                                    {item.image_path ? (
                                        <div style={{ width: '100px', height: '100px', overflow: 'hidden', borderRadius: '4px', backgroundColor: '#eee' }}>
                                            <img
                                                src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/laporan/${item.image_path}`}
                                                alt="Laporan"
                                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                            />
                                        </div>
                                    ) : 'No Image'}
                                </td>
                                <td style={{ ...tdStyle, maxWidth: '300px' }}>{item.deskripsi}</td>
                                <td style={tdStyle}>
                                    {userRole === 'admin' ? (
                                        <ApproveButton id={item.id} isApproved={item.approved} />
                                    ) : (
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: '500',
                                            backgroundColor: item.approved ? '#dcfce7' : '#fef9c3',
                                            color: item.approved ? '#166534' : '#854d0e'
                                        }}>
                                            {item.approved ? 'Approved' : 'Pending'}
                                        </span>
                                    )}
                                </td>
                                {userRole === 'admin' && <td style={tdStyle}>{item.koordinator_name}</td>}
                                {userRole === 'admin' && <td style={tdStyle}>{item.koordinator_team || '-'}</td>}
                            </tr>
                        ))}
                        {filteredLaporan.length === 0 && (
                            <tr>
                                <td colSpan={userRole === 'admin' ? 6 : 4} style={{ padding: '1rem', textAlign: 'center' }}>No reports found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

const thStyle = {
    padding: '0.75rem 1rem',
    fontWeight: '600',
    color: '#52525b'
}

const tdStyle = {
    padding: '0.75rem 1rem',
    color: '#18181b',
    verticalAlign: 'top' as const
}

const filterInputStyle = {
    padding: '0.5rem',
    border: '1px solid #ccc',
    borderRadius: '4px',
    fontSize: '0.875rem'
}
