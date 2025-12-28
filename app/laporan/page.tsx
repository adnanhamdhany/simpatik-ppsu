import { getAllLaporan, getLaporanByKoordinatorId } from '@/supabase/services/laporan'
import { cookies } from 'next/headers'
import LaporanListClient from './LaporanListClient'

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
    if (user.role === 'admin') {
        laporan = await getAllLaporan()
    } else if (user.role === 'koordinator') {
        laporan = await getLaporanByKoordinatorId(user.id)
    }

    return (
        <div className="p-8 max-w-6xl mx-auto space-y-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-black-soft">Laporan Kegiatan</h1>
                {user.role === 'koordinator' && (
                    <a href="/laporan/create" className="px-4 py-2 bg-orange-light text-white no-underline rounded-md text-sm hover:bg-orange-deep transition">
                        + Buat Laporan
                    </a>
                )}
            </div>

            <LaporanListClient initialLaporan={laporan} userRole={user.role} />
        </div>
    )
}
