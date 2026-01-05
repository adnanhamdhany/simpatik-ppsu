import { Metadata } from 'next'
import { cookies } from 'next/headers'
import Link from 'next/link'
import { getAbsensiList } from '@/supabase/services/absensi'
import AbsensiList from './AbsensiList'
import TambahAbsenButton from './TambahAbsenButton'

export const metadata: Metadata = {
    title: 'Absensi',
}

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
        <div className="p-4 md:p-8 bg-cream min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <h1 className="text-3xl md:text-4xl font-black text-black-soft tracking-tight">Data Absensi Petugas</h1>

                {/* Only Koordinator & Petugas can add */}
                {user.role !== 'admin' && user.role !== 'lurah' && (
                    <TambahAbsenButton />
                )}
            </div>

            <AbsensiList absensiData={absensiData || []} userRole={user.role} />
        </div>
    )
}
