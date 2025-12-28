
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { uploadAvatar, updateUserAvatar } from '@/supabase/services/user'

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        // Security: Get user from session, not just form data (trust but verify)
        // Or if form data has ID, we need to ensure the logged in user owns that ID.
        // For simplicity in this demo, we'll use the ID from the session cookie as the truth.
        const cookieStore = await cookies()
        const sessionUser = cookieStore.get('session_user')

        if (!sessionUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = JSON.parse(sessionUser.value)

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        // 1. Upload to Storage
        const path = await uploadAvatar(file, user.id)

        // 2. Update DB
        await updateUserAvatar(user.id, path)

        // 3. Update Session Cookie? 
        // Ideally we should update the session cookie too so the new avatar path persists on refresh without re-fetching DB
        // But for now, we'll just return success. Next page load might not show it unless we refetch user or update cookie.
        // Let's try to update the cookie.

        const newUser = { ...user, avatar_path: path }
        // Note: We can't easily resel the cookie here in a clean way without re-serializing. 
        // But let's skip complex cookie update for this step and rely on Client State (previewUrl) for immediate feedback.
        // On next login/refresh, if we fetch from DB, it will be there. 
        // Wait, current logic fetches from Cookie 'session_user'. If we don't update cookie, next refresh -> old avatar.
        // We should update cookie.

        return NextResponse.json({ success: true, path }, {
            status: 200,
            headers: { 'Set-Cookie': `session_user=${JSON.stringify(newUser)}; Path=/; HttpOnly; SameSite=Strict` }
        })

    } catch (error: any) {
        console.error('Avatar upload error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
