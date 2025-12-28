
import { cookies } from 'next/headers'
import Link from 'next/link'
import { getAbsensiList } from '@/supabase/services/absensi'
import AbsensiList from './AbsensiList'
import TambahAbsenButton from './TambahAbsenButton'

export default async function AbsensiPage() {
    const cookieStore = await cookies()
    const sessionUser = cookieStore.get('session_user')

    if (!sessionUser) {
        return <div>Please login.</div>
    }

    const user = JSON.parse(sessionUser.value)

    // Fetch Data
    const absensiData = await getAbsensiList(user.role, user.id)

    return (
        <div style={{ padding: '2rem', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Data Absensi</h1>

                {/* Only Koordinator & Petugas can add */}
                {user.role !== 'admin' && (
                    <TambahAbsenButton />
                )}
            </div>

            <AbsensiList absensiData={absensiData || []} userRole={user.role} />
        </div>
    )
}
