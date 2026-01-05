'use client'

import { useState } from 'react'
import ApproveButton from './ApproveButton'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const TEAM_OPTIONS = ['wilayah', 'penyapuan', 'crm']

export default function LaporanListClient({ initialLaporan, userRole, currentUserId }: { initialLaporan: any[], userRole: string, currentUserId?: string }) {
    const [laporan, setLaporan] = useState(initialLaporan)
    const [selectedLaporan, setSelectedLaporan] = useState<any | null>(null)


    const [filterTeam, setFilterTeam] = useState('')
    const [filterStatus, setFilterStatus] = useState('')
    const [filterDate, setFilterDate] = useState('')

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

    const getPhotoUrl = (path: string) => `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/laporan/${path}`

    const calculateProgress = (item: any) => {
        if (item.foto_100) return '100%'
        if (item.foto_50) return '50%'
        return '0%'
    }

    const exportToPDF = () => {
        const doc = new jsPDF('l', 'mm', 'a4') // Set landscape orientation for more columns

        doc.setFontSize(16)
        doc.text('LAPORAN KEGIATAN PPSU', 14, 15)
        doc.setFontSize(10)
        doc.text(`Tanggal Cetak: ${new Date().toLocaleString('id-ID')}`, 14, 22)

        const getTeamDisplay = (team: string) => {
            if (!team) return '-'
            return team.charAt(0).toUpperCase() + team.slice(1).toLowerCase()
        }

        const tableData = filteredLaporan.map(item => {
            const dateObj = new Date(item.created_at)
            const tanggal = dateObj.toLocaleDateString('id-ID')
            const jam = dateObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })

            // Progress Photos logic
            const photos = []
            if (item.foto_0) photos.push('0%')
            if (item.foto_50) photos.push('50%')
            if (item.foto_100) photos.push('100%')
            const photoStatus = photos.length > 0 ? photos.join(', ') : 'Tidak ada foto'

            return [
                getTeamDisplay(item.koordinator_team),
                item.team_number ? `Tim ${item.team_number}` : '-',
                item.koordinator_name,
                tanggal,
                jam,
                '-', // Lokasi placeholder
                item.deskripsi,
                photoStatus,
                item.approved ? 'Approved' : 'Pending'
            ]
        })

        autoTable(doc, {
            head: [['Jenis Tim', 'Nama Tim', 'Koordinator', 'Tanggal', 'Jam', 'Lokasi', 'Deskripsi', 'Foto Progress', 'Status']],
            body: tableData,
            startY: 30,
            styles: { fontSize: 8, cellPadding: 2 },
            headStyles: { fillColor: [249, 115, 22] }, // orange-light color
            columnStyles: {
                6: { cellWidth: 50 } // Give more width to Deskripsi
            }
        })

        doc.save(`Laporan_PPSU_${new Date().toISOString().split('T')[0]}.pdf`)
    }

    const getTeamDisplay = (team: string, num?: number) => {
        if (!team) return '-'
        const t = team.toLowerCase()
        if (t === 'wilayah') return `Wilayah tim ${num || '-'}`
        return team.charAt(0).toUpperCase() + team.slice(1).toLowerCase()
    }

    return (
        <div>
            <div className="mb-6 flex flex-col lg:flex-row gap-4 lg:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
                    {/* Admin & Lurah Filters */}
                    {(userRole === 'admin' || userRole === 'lurah') && (
                        <>
                            <select
                                value={filterTeam}
                                onChange={(e) => setFilterTeam(e.target.value)}
                                className="p-2.5 border border-zinc-200 rounded-xl text-[11px] font-bold outline-none focus:ring-4 focus:ring-orange-light/10 bg-white shadow-sm transition-all uppercase tracking-wider"
                            >
                                <option value="">Semua Tim</option>
                                {TEAM_OPTIONS.map(team => (
                                    <option key={team} value={team}>{team}</option>
                                ))}
                            </select>

                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="p-2.5 border border-zinc-200 rounded-xl text-[11px] font-bold outline-none focus:ring-4 focus:ring-orange-light/10 bg-white shadow-sm transition-all uppercase tracking-wider"
                            >
                                <option value="">Semua Status</option>
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                            </select>

                            <input
                                type="date"
                                value={filterDate}
                                onChange={(e) => setFilterDate(e.target.value)}
                                className="p-2.5 border border-zinc-200 rounded-xl text-[11px] font-bold outline-none focus:ring-4 focus:ring-orange-light/10 bg-white shadow-sm transition-all uppercase tracking-wider"
                            />

                            {(filterTeam || filterStatus || filterDate) && (
                                <button
                                    onClick={() => { setFilterTeam(''); setFilterStatus(''); setFilterDate('') }}
                                    className="px-4 py-2 bg-zinc-100 text-zinc-500 rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-zinc-200 transition-all border border-zinc-200 shadow-sm"
                                >
                                    Reset
                                </button>
                            )}
                        </>
                    )}
                </div>

                {userRole === 'admin' && (
                    <button
                        onClick={exportToPDF}
                        className="w-full sm:w-auto px-4 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-bold hover:bg-zinc-800 transition flex items-center justify-center gap-2 shadow-lg shadow-zinc-200"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                        </svg>
                        Cetak PDF
                    </button>
                )}
            </div>

            <div className="overflow-x-auto shadow-sm rounded-3xl border border-zinc-200 bg-white">
                <table className="w-full border-collapse text-left text-[14px]">
                    <thead>
                        <tr className="bg-zinc-50/50 border-b border-zinc-200">
                            <th className="pl-8 p-4 font-black text-zinc-400 uppercase tracking-widest whitespace-nowrap">Tanggal</th>
                            <th className="p-4 font-black text-zinc-400 uppercase tracking-widest">Koordinator</th>
                            <th className="p-4 font-black text-zinc-400 uppercase tracking-widest">Tim</th>
                            <th className="p-4 font-black text-zinc-400 uppercase tracking-widest">Deskripsi</th>
                            <th className="p-4 font-black text-zinc-400 uppercase tracking-widest text-center">Progress</th>
                            <th className="p-4 font-black text-zinc-400 uppercase tracking-widest text-center">Detail</th>
                            {userRole === 'admin' && <th className="p-4 font-black text-zinc-400 uppercase tracking-widest text-center">Aksi Admin</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {filteredLaporan.map((item: any) => (
                            <tr key={item.id} className="border-b border-zinc-100 last:border-0 hover:bg-zinc-50/50 transition duration-200">
                                <td className="pl-8 p-4 font-black text-zinc-900 tracking-tight whitespace-nowrap" suppressHydrationWarning>
                                    {new Date(item.created_at).toLocaleDateString()}
                                </td>
                                <td className="p-4">
                                    <div className="font-bold text-zinc-600">{item.koordinator_name}</div>
                                </td>
                                <td className="p-4 text-zinc-900">
                                    <span className="px-2 py-1 bg-zinc-100 text-zinc-500 rounded-md font-black uppercase text-[10px] tracking-wider">
                                        {getTeamDisplay(item.koordinator_team, item.team_number)}
                                    </span>
                                </td>
                                <td className="p-4 text-zinc-900 max-w-[200px]">
                                    <p className="line-clamp-2 text-[14px] leading-relaxed text-zinc-600 font-medium" title={item.deskripsi}>
                                        {item.deskripsi}
                                    </p>
                                </td>
                                <td className="p-4 text-zinc-900 text-center">
                                    <span className={`px-2 py-1 rounded-full text-[11px] font-bold inline-block min-w-[60px] ${calculateProgress(item) === '100%' ? 'bg-green-100 text-green-700' : calculateProgress(item) === '50%' ? 'bg-blue-100 text-blue-700' : 'bg-zinc-100 text-zinc-600'}`}>
                                        {calculateProgress(item)} Done
                                    </span>
                                </td>
                                <td className="p-4 text-zinc-900 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <button
                                            onClick={() => setSelectedLaporan(item)}
                                            className="w-full inline-flex justify-center items-center px-3 py-1.5 bg-gray-dark text-white text-[11px] font-black uppercase tracking-widest rounded-lg hover:opacity-90 transition shadow-sm"
                                        >
                                            Lihat
                                        </button>
                                        {userRole === 'koordinator' && String(item.koordinator_id) === String(currentUserId) && (
                                            <button
                                                onClick={() => window.location.href = `/laporan/edit/${item.id}`}
                                                className="w-full px-3 py-1.5 bg-orange-light/10 text-orange-deep text-[11px] font-black uppercase tracking-widest rounded-lg hover:bg-orange-light hover:text-white transition"
                                            >
                                                Edit
                                            </button>
                                        )}
                                    </div>
                                </td>
                                {userRole === 'admin' && (
                                    <td className="p-4 text-zinc-900 text-center space-y-2">
                                        <div className="flex flex-col items-center gap-2">
                                            <ApproveButton id={item.id} isApproved={item.approved} />
                                            <button
                                                onClick={async () => {
                                                    if (confirm('Apakah Anda yakin ingin menghapus laporan ini? Seluruh data dan foto akan dihapus permanen.')) {
                                                        const res = await fetch(`/api/laporan/${item.id}`, { method: 'DELETE' })
                                                        if (res.ok) {
                                                            setLaporan(prev => prev.filter(l => l.id !== item.id))
                                                        } else {
                                                            const err = await res.json()
                                                            alert(`Gagal menghapus: ${err.error}`)
                                                        }
                                                    }
                                                }}
                                                className="w-full px-3 py-1.5 bg-red-50 text-red-600 text-[11px] font-black uppercase tracking-widest rounded-lg hover:bg-red-100 transition border border-red-100"
                                            >
                                                Hapus
                                            </button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                        {filteredLaporan.length === 0 && (
                            <tr>
                                <td colSpan={7} className="p-16 text-center text-zinc-300 italic font-medium uppercase tracking-widest">Tidak ada laporan yang ditemukan</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Modal Detail */}
            {
                selectedLaporan && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto transform transition-all">
                            <div className="sticky top-0 bg-white/80 backdrop-blur-md p-6 border-b border-zinc-100 flex justify-between items-center z-10">
                                <div>
                                    <h2 className="text-xl font-black text-zinc-900 tracking-tight">PROGRESS PEKERJAAN</h2>
                                    <p className="text-xs text-zinc-500 font-medium uppercase tracking-widest mt-1">
                                        {new Date(selectedLaporan.created_at).toLocaleDateString('id-ID', { dateStyle: 'full' })} • {selectedLaporan.koordinator_name}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedLaporan(null)}
                                    className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400 hover:text-zinc-600"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="p-8">
                                <div className="mb-10">
                                    <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-3">Deskripsi Kegiatan</h3>
                                    <div className="text-zinc-700 bg-zinc-50 p-6 rounded-2xl border border-zinc-100 text-sm leading-relaxed shadow-inner">
                                        {selectedLaporan.deskripsi}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <ProgressCard title="0% Baseline" path={selectedLaporan.foto_0} url={getPhotoUrl(selectedLaporan.foto_0)} />
                                    <ProgressCard title="50% Ongoing" path={selectedLaporan.foto_50} url={getPhotoUrl(selectedLaporan.foto_50)} />
                                    <ProgressCard title="100% Completed" path={selectedLaporan.foto_100} url={getPhotoUrl(selectedLaporan.foto_100)} />
                                </div>
                            </div>

                            <div className="p-6 border-t border-zinc-100 bg-zinc-50/50 flex justify-end">
                                <button
                                    onClick={() => setSelectedLaporan(null)}
                                    className="px-8 py-2.5 bg-zinc-900 text-white font-bold rounded-xl hover:bg-zinc-800 transition shadow-lg shadow-zinc-200"
                                >
                                    Selesai
                                </button>
                            </div>
                        </div>
                    </div>
                )}
        </div>
    )
}

function ProgressCard({ title, path, url }: { title: string, path: string, url: string }) {
    return (
        <div className="space-y-4">
            <h3 className="text-center text-xs font-black text-zinc-500 uppercase tracking-widest">{title}</h3>
            <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-zinc-100 border-2 border-zinc-100 flex items-center justify-center relative group shadow-sm bg-gradient-to-br from-zinc-50 to-zinc-100">
                {path ? (
                    <img src={url} alt={title} className="w-full h-full object-cover transition duration-500 group-hover:scale-110" />
                ) : (
                    <div className="flex flex-col items-center gap-2">
                        <svg className="w-8 h-8 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider italic">Belum Ada Foto</span>
                    </div>
                )}
            </div>
        </div>
    )
}
