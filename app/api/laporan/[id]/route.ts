import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getLaporanById, deleteLaporan } from '@/supabase/services/laporan'
import { cookies } from 'next/headers'

type Context = {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: Context) {
  try {
    const cookieStore = cookies()
    const sessionUser = cookieStore.get('session_user')

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const laporan = await getLaporanById(id)

    if (!laporan) {
      return NextResponse.json({ error: 'Laporan not found' }, { status: 404 })
    }

    return NextResponse.json(laporan)
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: Context) {
  try {
    const cookieStore = cookies()
    const sessionUser = cookieStore.get('session_user')

    if (!sessionUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = JSON.parse(sessionUser.value)
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await context.params
    await deleteLaporan(id)

    return NextResponse.json({ message: 'Laporan deleted successfully' })
  } catch (error: any) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
