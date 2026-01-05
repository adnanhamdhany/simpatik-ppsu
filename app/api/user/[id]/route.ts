import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params

    // Security check
    const cookieStore = await cookies()
    const sessionUser = cookieStore.get('session_user')
    if (!sessionUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const userRole = JSON.parse(sessionUser.value).role
    if (userRole !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

    // 1. Delete related data first (Manual Cascade)
    await supabase.from('absensi').delete().eq('user_id', id)
    await supabase.from('laporan').delete().eq('koordinator_id', id)

    // 2. Delete user
    const { error } = await supabase
        .from('user')
        .delete()
        .eq('id', id)

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: 'User deleted successfully' })
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    try {
        // Security check
        const cookieStore = await cookies()
        const sessionUser = cookieStore.get('session_user')
        if (!sessionUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        const userRole = JSON.parse(sessionUser.value).role
        if (userRole !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

        const body = await request.json()
        const { username, password, name, role } = body

        const updateData: any = { username, name, role }
        if (password) updateData.password = password

        const { data, error } = await supabase
            .from('user')
            .update(updateData)
            .eq('id', id)
            .select()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ data })
    } catch (err) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
