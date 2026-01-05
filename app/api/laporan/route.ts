import { NextResponse } from 'next/server'
import { createLaporan, updateLaporan } from '@/supabase/services/laporan'
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
        const foto_0 = formData.get('foto_0') as File | null
        const foto_50 = formData.get('foto_50') as File | null
        const foto_100 = formData.get('foto_100') as File | null
        const latitude = formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : undefined
        const longitude = formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : undefined
        const location_name = formData.get('location_name') as string | undefined
        const deskripsi = formData.get('deskripsi') as string

        if (!deskripsi) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const files = {
            foto_0: foto_0 || undefined,
            foto_50: foto_50 || undefined,
            foto_100: foto_100 || undefined,
        }

        await createLaporan(files, deskripsi, userId, latitude, longitude, location_name)

        return NextResponse.json({ message: 'Laporan created successfully' }, { status: 201 })
    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    try {
        const cookieStore = await cookies()
        const sessionUser = cookieStore.get('session_user')

        if (!sessionUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        const formData = await request.formData()
        const id = formData.get('id') as string
        const foto_0 = formData.get('foto_0') as File | null
        const foto_50 = formData.get('foto_50') as File | null
        const foto_100 = formData.get('foto_100') as File | null
        const latitude = formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : undefined
        const longitude = formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : undefined
        const location_name = formData.get('location_name') as string | undefined
        const deskripsi = formData.get('deskripsi') as string

        if (!id || !deskripsi) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        const files = {
            foto_0: foto_0 || undefined,
            foto_50: foto_50 || undefined,
            foto_100: foto_100 || undefined,
        }

        await updateLaporan(id, files, deskripsi, latitude, longitude, location_name)

        return NextResponse.json({ message: 'Laporan updated successfully' }, { status: 200 })
    } catch (error: any) {
        console.error('API Error:', error)
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 })
    }
}
