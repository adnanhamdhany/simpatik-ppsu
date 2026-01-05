
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { submitAbsensi } from '@/supabase/services/absensi'

export async function POST(request: Request) {
    try {
        const formData = await request.formData()
        const file = formData.get('file') as File

        const cookieStore = await cookies()
        const sessionUser = cookieStore.get('session_user')

        if (!sessionUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const user = JSON.parse(sessionUser.value)
        const latitude = formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : undefined
        const longitude = formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : undefined
        const location_name = formData.get('location_name') as string | undefined

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
        }

        const data = await submitAbsensi(file, user.id, latitude, longitude, location_name)

        return NextResponse.json({ success: true, data }, { status: 200 })

    } catch (error: any) {
        console.error('Absensi upload error:', error)
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
}
