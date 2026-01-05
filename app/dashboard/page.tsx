import { Metadata } from 'next'
import { cookies } from 'next/headers'
import { countPetugas } from '@/supabase/services/user'
import { getLaporanStats } from '@/supabase/services/laporan'
import { UserGroupIcon, DocumentTextIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline'
import UserProfile from './UserProfile'
import DashboardFilter from './DashboardFilter'

export const metadata: Metadata = {
    title: 'Dashboard',
}

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    const params = await searchParams
    const month = params.month ? parseInt(params.month as string) : undefined
    const year = params.year ? parseInt(params.year as string) : new Date().getFullYear()
    const week = params.week ? parseInt(params.week as string) : undefined

    const cookieStore = await cookies()
    const sessionUser = cookieStore.get('session_user')
    let user: any = null

    if (sessionUser) {
        try {
            user = JSON.parse(sessionUser.value)
        } catch (e) {
            // ignore
        }
    }

    if (!user) {
        // Should allow middleware to handle, but just in case
        return <div style={{ padding: '2rem' }}>Please login.</div>
    }

    // Initialize data variables
    let totalPetugas = 0
    let stats = { today: 0, pending: 0, daily: {} as Record<string, Record<string, number>> }

    // Only fetch stats if Admin or Lurah
    if (user.role === 'admin' || user.role === 'lurah') {
        const filter = month ? { month, year, week } : undefined
        const [tp, st] = await Promise.all([
            countPetugas(),
            getLaporanStats(filter)
        ])
        totalPetugas = tp
        stats = st
    }

    return (
        <div className="p-4 md:p-8 lg:p-12 bg-cream min-h-screen">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Welcome Section */}
                <div className="text-left">
                    <h1 className="text-3xl md:text-5xl font-bold text-orange-deep mb-3">Selamat Datang di SIMPATIK PPSU</h1>
                    <h2 className="text-lg md:text-xl font-semibold text-black-soft mb-4">Sistem Informasi Manajemen dan Pelaporan Terintegrasi Kegiatan PPSU</h2>
                    <p className="text-gray-dark">
                        SIMPATIK PPSU adalah platform berbasis web yang mendukung pelaporan, pemantauan, dan pengelolaan kegiatan harian PPSU secara terstruktur, transparan, dan efisien.
                    </p>
                </div>

                {/* ADMIN & LURAH VIEW */}
                {(user.role === 'admin' || user.role === 'lurah') && (
                    <>
                        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm flex justify-between items-center border border-zinc-100">
                                <div>
                                    <p className="text-red-400 text-[10px] font-black uppercase tracking-widest">Total Petugas</p>
                                    <p className="text-4xl font-black mt-1 text-zinc-900">{totalPetugas}</p>
                                </div>
                                <div className="p-3 bg-red-50 rounded-xl">
                                    <UserGroupIcon className="w-8 h-8 text-red-400" />
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm flex justify-between items-center border border-zinc-100">
                                <div>
                                    <p className="text-red-400 text-[10px] font-black uppercase tracking-widest">Laporan Hari Ini</p>
                                    <p className="text-4xl font-black mt-1 text-zinc-900">{stats.today}</p>
                                </div>
                                <div className="p-3 bg-red-50 rounded-xl">
                                    <DocumentTextIcon className="w-8 h-8 text-red-400" />
                                </div>
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm flex justify-between items-center border border-zinc-100">
                                <div>
                                    <p className="text-red-400 text-[10px] font-black uppercase tracking-widest">Belum Verifikasi</p>
                                    <p className="text-4xl font-black mt-1 text-zinc-900">{stats.pending}</p>
                                </div>
                                <div className="p-3 bg-red-50 rounded-xl">
                                    <ClipboardDocumentCheckIcon className="w-8 h-8 text-red-400" />
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-zinc-100 flex flex-col gap-6">

                            {/* Filter Section - Moved here to only affect charts below */}
                            <DashboardFilter />

                            {/* 3 Team Charts */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {(['crm', 'wilayah', 'penyapuan'] as const).map((type) => {
                                    const dailyData = (stats as any).daily?.[type] || {}
                                    const entries = Object.entries(dailyData)
                                    const maxVal = Math.max(...Object.values(dailyData) as number[], 5)

                                    const firstDate = entries[0]?.[0]
                                    const lastDate = entries[entries.length - 1]?.[0]

                                    const formatDate = (dateStr: string) => {
                                        if (!dateStr) return '-'
                                        const d = new Date(dateStr)
                                        return d.toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })
                                    }

                                    return (
                                        <div key={type} className="bg-white p-6 rounded-[2rem] shadow-sm border border-zinc-100 flex flex-col h-[380px]">
                                            <div className="flex justify-between items-start mb-6">
                                                <div>
                                                    <h3 className="text-zinc-900 text-lg font-black uppercase tracking-widest flex items-center gap-2">
                                                        <span className="w-2.5 h-2.5 rounded-full bg-orange-light"></span>
                                                        {type}
                                                    </h3>
                                                    <p className="text-zinc-400 text-xs font-black mt-1 uppercase tracking-tight">Laporan Produk PPSU</p>
                                                </div>
                                                <span className="text-2xl font-black text-zinc-900">{(Object.values(dailyData) as number[]).reduce((a, b) => a + b, 0)}</span>
                                            </div>

                                            <div className="flex-1 flex items-end gap-1.5 px-2">
                                                {entries.map(([date, count]) => (
                                                    <div key={date} className="flex-1 group relative">
                                                        <div
                                                            className="w-full bg-orange-light rounded-sm transition-all duration-300 hover:bg-orange-deep cursor-pointer relative"
                                                            style={{ height: `${((count as number) / maxVal) * 180}px`, minHeight: (count as number) > 0 ? '4px' : '0' }}
                                                        >
                                                            <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-zinc-900 text-white text-[10px] font-black px-2 py-1 rounded shadow-lg opacity-0 group-hover:opacity-100 transition whitespace-nowrap z-10">
                                                                {count as number} Lap
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            <div className="flex justify-between mt-6 pt-4 border-t border-zinc-50">
                                                <span className="text-[10px] font-black text-zinc-300 uppercase">{formatDate(firstDate)}</span>
                                                <span className="text-[10px] font-black text-zinc-300 uppercase">{formatDate(lastDate)}</span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </>
                )}

                {/* USER VIEW (Koordinator & Petugas) */}
                {(user.role === 'koordinator' || user.role === 'petugas') && (
                    <UserProfile user={user} variant="wide" />
                )}
            </div>
        </div>
    )
}
