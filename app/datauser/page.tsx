import { Metadata } from 'next'
import { getAllUsers, getExistingTeams } from '@/supabase/services/user'
import UserListClient from './UserListClient'
import { cookies } from 'next/headers'

export const metadata: Metadata = {
    title: 'Data User',
}

export default async function DataUserPage() {
    const cookieStore = await cookies()
    const sessionUser = cookieStore.get('session_user')
    const user = sessionUser ? JSON.parse(sessionUser.value) : { role: 'guest' }

    const [users, dbTeams] = await Promise.all([
        getAllUsers(),
        getExistingTeams()
    ])

    // "From Database" + "Hardcoded Defaults"
    const requiredTeams = ['wilayah', 'penyapuan', 'crm']
    const teamOptions = Array.from(new Set([...requiredTeams, ...dbTeams])).sort()

    return (
        <div className="p-4 md:p-8 space-y-8">
            <h1 className="text-3xl md:text-4xl font-black text-black-soft tracking-tight">Data User & Kepegawaian</h1>
            <UserListClient initialUsers={users} teamOptions={teamOptions} currentUserRole={user.role} />
        </div>
    )
}
