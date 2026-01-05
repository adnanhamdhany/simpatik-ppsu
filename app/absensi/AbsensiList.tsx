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
            const itemDate = new Date(item.created_at).toISOString().split('T')[0]
            matchDate = itemDate === filterDate
        }

        return matchTeam && matchStatus && matchDate
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    // Grouping Logic
    const groupedData: { [key: string]: any[] } = {}
    filteredList.forEach(item => {
        const date = new Date(item.created_at)
        const day = date.toISOString().split('T')[0]

        const today = new Date().toISOString().split('T')[0]
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

        let label = day
        if (day === today) label = 'Hari Ini'
        else if (day === yesterday) label = 'Kemarin'
        else {
            label = date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
        }

        if (!groupedData[label]) groupedData[label] = []
        groupedData[label].push(item)
    })

    if (list.length === 0) {
        return <div className="text-zinc-400 p-16 text-center italic font-medium uppercase tracking-widest bg-white rounded-3xl border border-zinc-200 shadow-sm">Belum ada data absensi.</div>
    }

    return (
        <div>
            {/* Admin & Lurah Filters */}
            {(userRole === 'admin' || userRole === 'lurah') && (
                <div className="mb-8 flex gap-3 flex-wrap items-center overflow-x-auto pb-2">
                    <select
                        value={filterTeam}
                        onChange={(e) => setFilterTeam(e.target.value)}
                        className="p-2.5 border border-zinc-200 rounded-xl text-[11px] font-bold outline-none focus:ring-4 focus:ring-orange-light/10 bg-white shadow-sm transition-all uppercase tracking-wider flex-shrink-0"
                    >
                        <option value="">Semua Tim</option>
                        {TEAM_OPTIONS.map(team => (
                            <option key={team} value={team}>{team}</option>
                        ))}
                    </select>

                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="p-2.5 border border-zinc-200 rounded-xl text-[11px] font-bold outline-none focus:ring-4 focus:ring-orange-light/10 bg-white shadow-sm transition-all uppercase tracking-wider flex-shrink-0"
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
                        className="p-2.5 border border-zinc-200 rounded-xl text-[11px] font-bold outline-none focus:ring-4 focus:ring-orange-light/10 bg-white shadow-sm transition-all uppercase tracking-wider flex-shrink-0"
                    />

                    {(filterTeam || filterStatus || filterDate) && (
                        <button
                            onClick={() => { setFilterTeam(''); setFilterStatus(''); setFilterDate('') }}
                            className="px-4 py-2.5 bg-zinc-100 text-zinc-500 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all border border-zinc-200 shadow-sm flex-shrink-0"
                        >
                            Reset
                        </button>
                    )}
                </div>
            )}

            <div className="space-y-12">
                {Object.keys(groupedData).map((label) => (
                    <div key={label} className="space-y-6">
                        <div className="flex items-center gap-4">
                            <h3 className="text-[12px] font-black text-zinc-400 uppercase tracking-[0.2em] whitespace-nowrap">
                                {label}
                            </h3>
                            <div className="h-px w-full bg-zinc-200/60"></div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                            {groupedData[label].map((item) => (
                                <div key={item.id} className="group bg-white rounded-[2rem] shadow-sm overflow-hidden border border-zinc-200 hover:shadow-xl hover:shadow-orange-light/5 hover:border-orange-light/30 transition-all duration-300">
                                    <div className="h-[220px] bg-zinc-100 relative overflow-hidden">
                                        <img
                                            src={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/absensi/${item.image_path}`}
                                            alt="Absensi"
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className={`absolute top-4 right-4 text-white px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg ${item.status === 'approved' ? 'bg-green-500' : item.status === 'rejected' ? 'bg-red-500' : 'bg-orange-light'}`}>
                                            {item.status}
                                        </div>
                                    </div>
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-2">
                                            <div>
                                                <p className="font-black text-[18px] text-zinc-900 tracking-tight leading-tight">
                                                    {item.user?.name || 'Unknown'}
                                                </p>
                                                <p className="text-[12px] font-black text-zinc-800 uppercase tracking-widest mt-1">
                                                    {item.user?.role} • {item.user?.role_petugas_team || '-'}
                                                </p>
                                                {item.location_name ? (
                                                    <p className="text-[11px] font-black text-zinc-700 uppercase tracking-wider mt-2 italic bg-zinc-50 py-1 px-2 rounded-md border border-zinc-100 inline-block">
                                                        📍 {item.location_name}
                                                    </p>
                                                ) : item.latitude && item.longitude && (
                                                    <p className="text-[11px] font-black text-zinc-700 uppercase tracking-wider mt-2 italic bg-zinc-50 py-1 px-2 rounded-md border border-zinc-100 inline-block">
                                                        📍 Lokasi: {item.latitude}, {item.longitude}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="mt-4 pt-4 border-t border-zinc-100 flex items-center justify-between">
                                            <p suppressHydrationWarning className="text-[13px] font-black text-zinc-500 uppercase tracking-tighter">
                                                {new Date(item.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                            </p>
                                            {userRole === 'admin' && item.status === 'pending' && (
                                                <button
                                                    onClick={() => handleApprove(item.id)}
                                                    className="px-4 py-2 bg-zinc-900 text-white text-[11px] font-black uppercase tracking-widest rounded-xl hover:bg-orange-deep transition-all shadow-md shadow-zinc-200"
                                                >
                                                    Approve
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
