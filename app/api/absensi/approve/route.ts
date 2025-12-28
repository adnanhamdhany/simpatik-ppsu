
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { approveAbsensi } from '@/supabase/services/absensi'

export async function PUT(request: Request) {
    try {
        const body = await request.json()
        const { id } = body

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 })
        }

        const cookieStore = await cookies()
        const sessionUser = cookieStore.get('session_user')

        if (!sessionUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = JSON.parse(sessionUser.value)

        // Ensure Admin
        if (user.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const data = await approveAbsensi(id, user.id)

        return NextResponse.json({ success: true, data }, { status: 200 })

    } catch (error: any) {
        console.error('Absensi approval error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
