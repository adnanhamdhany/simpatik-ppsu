import { NextResponse } from 'next/server'
import { createLaporan } from '@/supabase/services/laporan'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
    try {
        const cookieStore = await cookies()
        const sessionUser = cookieStore.get('session_user')

        if (!sessionUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = JSON.parse(sessionUser.value)
        const userId = user.id

        const formData = await request.formData()
        const file = formData.get('file') as File
        const deskripsi = formData.get('deskripsi') as string

        if (!file || !deskripsi) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        await createLaporan(file, deskripsi, userId)

        return NextResponse.json({ message: 'Laporan created successfully' }, { status: 201 })
    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
