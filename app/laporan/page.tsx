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
        <div style={{ padding: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Laporan Kegiatan</h1>
                {user.role === 'koordinator' && (
                    <a href="/laporan/create" style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem'
                    }}>
                        + Buat Laporan
                    </a>
                )}
            </div>

            <LaporanListClient initialLaporan={laporan} userRole={user.role} />
        </div>
    )
}
