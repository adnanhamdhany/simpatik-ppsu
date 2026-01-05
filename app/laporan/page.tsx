import { Metadata } from 'next'
import { getAllLaporan, getLaporanByKoordinatorId } from '@/supabase/services/laporan'
import { cookies } from 'next/headers'
import LaporanListClient from './LaporanListClient'

export const metadata: Metadata = {
    title: 'Laporan',
}

export default async function LaporanPage() {
    const cookieStore = await cookies()
    const sessionUser = cookieStore.get('session_user')
    let user = null

    if (sessionUser) {
        try {
            user = JSON.parse(sessionUser.value)
        } catch (e) {
            // ignore
        }
    }

    if (!user) {
        return <div>Access Denied</div>
    }

    let laporan = []
    if (user.role === 'admin' || user.role === 'lurah') {
        laporan = await getAllLaporan()
    } else if (user.role === 'koordinator') {
        laporan = await getLaporanByKoordinatorId(user.id)
    }

    return (
        <div className="p-4 md:p-8 space-y-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h1 className="text-3xl md:text-4xl font-black text-black-soft tracking-tight">Laporan Kegiatan Kerja</h1>
                {user.role === 'koordinator' && (
                    <a href="/laporan/create" className="px-4 py-2 bg-orange-light text-white no-underline rounded-md text-sm hover:bg-orange-deep transition">
                        + Buat Laporan
                    </a>
                )}
            </div>

            <LaporanListClient initialLaporan={laporan} userRole={user.role} currentUserId={user.id} />
        </div>
    )
}
