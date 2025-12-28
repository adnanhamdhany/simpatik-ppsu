import { NextResponse } from 'next/server'
import { approveLaporan } from '@/supabase/services/laporan'
import { cookies } from 'next/headers'

export async function PUT(request: Request) {
    try {
        const cookieStore = await cookies()
        const sessionUser = cookieStore.get('session_user')

        if (!sessionUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = JSON.parse(sessionUser.value)

        // Only Admin can approve
        if (user.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
        }

        const body = await request.json()
        const { id } = body

        if (!id) {
            return NextResponse.json({ error: 'Missing report ID' }, { status: 400 })
        }

        await approveLaporan(id, user.id)

        return NextResponse.json({ message: 'Laporan approved successfully' }, { status: 200 })
    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
