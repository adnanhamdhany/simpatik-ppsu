import { NextResponse } from 'next/server'
import { getAllLaporan } from '@/supabase/services/laporan'

export async function GET() {
    console.log('DEBUG: Triggering getAllLaporan from debug route')
    const data = await getAllLaporan()
    return NextResponse.json(data)
}
