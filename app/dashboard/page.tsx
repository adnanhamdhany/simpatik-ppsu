
import { cookies } from 'next/headers'
import { countPetugas } from '@/supabase/services/user'
import { getLaporanStats } from '@/supabase/services/laporan'
import { UserGroupIcon, DocumentTextIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/outline'

import UserProfile from './UserProfile'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export default async function DashboardPage() {
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
    let stats = { today: 0, pending: 0, monthly: {} as Record<string, number> }

    // Only fetch stats if Admin
    if (user.role === 'admin') {
        const [tp, st] = await Promise.all([
            countPetugas(),
            getLaporanStats()
        ])
        totalPetugas = tp
        stats = st
    }

    return (
        <div className="p-12 bg-cream min-h-screen">
            <div className="max-w-5xl mx-auto space-y-8">
                {/* Welcome Section */}
                <div className="text-left">
                    <h1 className="text-5xl font-bold text-orange-deep mb-3">Selamat Datang di SIMPATIK PPSU</h1>
                    <h2 className="text-xl font-semibold text-black-soft mb-4">Sistem Informasi Manajemen dan Pelaporan Terintegrasi Kegiatan PPSU</h2>
                    <p className="text-gray-dark">
                        SIMPATIK PPSU adalah platform berbasis web yang mendukung pelaporan, pemantauan, dan pengelolaan kegiatan harian PPSU secara terstruktur, transparan, dan efisien.
                    </p>
                </div>

                {/* ADMIN VIEW */}
                {user.role === 'admin' && (
                    <>
                        <UserProfile user={user} variant="wide" />

                        <div className="grid grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-6">
                            <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center border border-orange-light/20">
                                <div>
                                    <p className="text-gray-dark text-sm">Total Petugas</p>
                                    <p className="text-4xl font-bold leading-none mt-2 text-black-soft">{totalPetugas}</p>
                                </div>
                                <UserGroupIcon className="w-12 h-12 text-orange-light opacity-80" />
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center border border-orange-light/20">
                                <div>
                                    <p className="text-gray-dark text-sm">Laporan Masuk Hari Ini</p>
                                    <p className="text-4xl font-bold leading-none mt-2 text-black-soft">{stats.today}</p>
                                </div>
                                <DocumentTextIcon className="w-12 h-12 text-orange-light opacity-80" />
                            </div>

                            <div className="bg-white p-6 rounded-lg shadow-sm flex justify-between items-center border border-orange-light/20">
                                <div>
                                    <p className="text-gray-dark text-sm">Laporan Belum Di Verifikasi</p>
                                    <p className="text-4xl font-bold leading-none mt-2 text-black-soft">{stats.pending}</p>
                                </div>
                                <ClipboardDocumentCheckIcon className="w-12 h-12 text-orange-light opacity-80" />
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow-sm border border-orange-light/20">
                            <h2 className="text-base font-semibold mb-6 text-black-soft">Grafik Total Laporan Petugas Perbulan</h2>
                            <div className="flex items-end h-[300px] gap-4 pb-4 border-b border-orange-light/20">
                                {Object.keys(stats.monthly).length > 0 ? (
                                    Object.entries(stats.monthly).map(([month, count]) => (
                                        <div key={month} className="flex flex-col items-center flex-1">
                                            <div
                                                className="w-full max-w-[50px] bg-orange-deep rounded-t transition-all duration-300 hover:bg-orange-light relative group"
                                                style={{ height: `${Math.min(count * 20, 250)}px` }}
                                            >
                                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black-soft text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition">
                                                    {count}
                                                </div>
                                            </div>
                                            <span className="mt-2 text-sm text-gray-dark">{month}</span>
                                        </div>
                                    ))
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        No data available for chart
                                    </div>
                                )}
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
