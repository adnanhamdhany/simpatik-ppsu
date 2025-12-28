
import { getAllUsers, getExistingTeams } from '@/supabase/services/user'
import UserListClient from './UserListClient'
import { cookies } from 'next/headers'

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
        <div style={{ padding: '2rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Data User</h1>
            <UserListClient initialUsers={users} teamOptions={teamOptions} currentUserRole={user.role} />
        </div>
    )
}


