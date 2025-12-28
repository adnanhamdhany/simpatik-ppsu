import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
    // Replace 'user' with your actual table name if different
    const { data, error } = await supabase.from('user').select('*')

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ data })
}

export async function POST(request: Request) {
    try {
        const body = await request.json()

        const { username, password, name, role, role_petugas_team, team_number } = body

        if (!username || !password || !name || !role) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
        }

        // --- VALIDATION LOGIC START ---
        if (role === 'petugas' || role === 'koordinator') {
            if (!role_petugas_team) {
                return NextResponse.json({ error: 'Tim PPSU wajib dipilih' }, { status: 400 })
            }

            // Rules Configuration
            const limits = {
                crm: { petugasPerTeam: 3, koordinatorTotal: 1 },
                wilayah: { petugasPerTeam: 5, koordinatorPerTeam: 1 },
                penyapuan: { petugasPerTeam: 18, koordinatorTotal: 1 }
            }

            const rule = limits[role_petugas_team as keyof typeof limits]
            if (!rule) {
                return NextResponse.json({ error: 'Tim PPSU tidak valid' }, { status: 400 })
            }

            if (role === 'petugas') {
                if (!team_number) return NextResponse.json({ error: 'Nomor Tim wajib diisi' }, { status: 400 })

                const { count, error: countError } = await supabase
                    .from('user')
                    .select('*', { count: 'exact', head: true })
                    .eq('role', 'petugas')
                    .eq('role_petugas_team', role_petugas_team)
                    .eq('team_number', team_number)

                if (countError) return NextResponse.json({ error: countError.message }, { status: 500 })

                if (count !== null && count >= rule.petugasPerTeam) {
                    return NextResponse.json({ error: `Tim ${team_number} ${role_petugas_team} sudah penuh (Max ${rule.petugasPerTeam} petugas)` }, { status: 400 })
                }
            }

            if (role === 'koordinator') {
                // CRM & Penyapuan: Global limit. Wilayah: Per Team limit.
                let query = supabase
                    .from('user')
                    .select('*', { count: 'exact', head: true })
                    .eq('role', 'koordinator')
                    .eq('role_petugas_team', role_petugas_team)

                // For Wilayah, coordinator is one per team
                if (role_petugas_team === 'wilayah') {
                    if (!team_number) return NextResponse.json({ error: 'Nomor Tim wajib diisi untuk Koordinator Wilayah' }, { status: 400 })
                    query = query.eq('team_number', team_number)
                }
                // For CRM & Penyapuan, it's global for the team type, so we don't filter by team_number for the COUNT check

                const { count, error: countError } = await query

                if (countError) return NextResponse.json({ error: countError.message }, { status: 500 })

                const maxKoor = role_petugas_team === 'wilayah' ? 1 : 1 // Logic is simple: always 1 max per scope (scope differs)
                if (count !== null && count >= maxKoor) {
                    const scopeMsg = role_petugas_team === 'wilayah' ? `Tim ${team_number}` : `Divisi ${role_petugas_team}`
                    return NextResponse.json({ error: `Koordinator untuk ${scopeMsg} sudah terisi` }, { status: 400 })
                }
            }
        }
        // --- VALIDATION LOGIC END ---

        // Clean up data: explicit null for empty strings if needed
        const payload = {
            username,
            password,
            name,
            role,
            role_petugas_team: role_petugas_team || null,
            team_number: team_number || null // Save team number for everyone if provided, though validation ensures correctness
        }

        const { data, error } = await supabase
            .from('user')
            .insert([payload])
            .select()

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 })
        }

        return NextResponse.json({ data }, { status: 201 })
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
