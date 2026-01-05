import { supabase } from '@/lib/supabase'

export const getAllLaporan = async () => {
    // Fetch reports
    const { data: laporan, error: laporanError } = await supabase
        .from('laporan')
        .select('*')
        .order('created_at', { ascending: false })

    if (laporanError) {
        console.error('Error fetching all laporan:', laporanError)
        return []
    }

    // Fetch users for mapping names
    const { data: users, error: usersError } = await supabase
        .from('user')
        .select('id, name, role_petugas_team, team_number')

    if (usersError) {
        console.error('Error fetching users for mapping:', usersError)
        return laporan // Return reports even if user mapping fails
    }

    // Create a map of id -> user details
    const userMap = new Map(users.map(u => [String(u.id), { name: u.name, team: u.role_petugas_team, team_number: u.team_number }]))

    // Attach name and team to report objects
    return laporan.map(item => {
        const userDetails = userMap.get(String(item.koordinator_id))
        return {
            ...item,
            koordinator_name: userDetails?.name || item.koordinator_id,
            koordinator_team: userDetails?.team,
            team_number: userDetails?.team_number
        }
    })
}

export const getLaporanByKoordinatorId = async (userId: string) => {
    const { data: laporan, error: laporanError } = await supabase
        .from('laporan')
        .select('*')
        .eq('koordinator_id', userId)
        .order('created_at', { ascending: false })

    if (laporanError) {
        console.error('Error fetching koordinator laporan:', laporanError)
        return []
    }

    // Fetch user details for this coordinator
    const { data: user, error: userError } = await supabase
        .from('user')
        .select('name, role_petugas_team, team_number')
        .eq('id', userId)
        .single()

    if (userError) {
        console.error('Error fetching coordinator details:', userError)
        return laporan
    }

    return laporan.map(item => ({
        ...item,
        koordinator_name: user.name,
        koordinator_team: user.role_petugas_team,
        team_number: user.team_number
    }))
}

export const createLaporan = async (files: { foto_0?: File, foto_50?: File, foto_100?: File }, deskripsi: string, userId: string, latitude?: number, longitude?: number, location_name?: string) => {
    const filePaths: Record<string, string> = {}

    // 1. Upload Images to Storage
    for (const [key, file] of Object.entries(files)) {
        if (file) {
            const fileName = `${Date.now()}-${key}-${file.name}`
            const { data: storageData, error: storageError } = await supabase
                .storage
                .from('laporan')
                .upload(fileName, file)

            if (storageError) {
                console.error(`Error uploading image ${key}:`, storageError)
                throw new Error(`Failed to upload image ${key}: ${storageError.message}`)
            }
            filePaths[key] = fileName
        }
    }

    // 2. Insert Data to Table
    const { data, error } = await supabase
        .from('laporan')
        .insert([
            {
                deskripsi,
                foto_0: filePaths.foto_0 || null,
                foto_50: filePaths.foto_50 || null,
                foto_100: filePaths.foto_100 || null,
                koordinator_id: userId,
                status: 'pending',
                latitude,
                longitude,
                location_name
            }
        ])
        .select()

    if (error) {
        console.error('Error creating laporan:', error)
        throw new Error('Failed to create laporan record')
    }

    return data
}

export const updateLaporan = async (id: string, files: { foto_0?: File, foto_50?: File, foto_100?: File }, deskripsi: string, latitude?: number, longitude?: number, location_name?: string) => {
    const filePaths: Record<string, string> = {}

    // 1. Upload Images to Storage
    for (const [key, file] of Object.entries(files)) {
        if (file) {
            const fileName = `${Date.now()}-${key}-${file.name}`
            const { data: storageData, error: storageError } = await supabase
                .storage
                .from('laporan')
                .upload(fileName, file)

            if (storageError) {
                console.error(`Error uploading image ${key}:`, storageError)
                throw new Error(`Failed to upload image ${key}: ${storageError.message}`)
            }
            filePaths[key] = fileName
        }
    }

    // 2. Update Data in Table
    const updateData: any = { deskripsi }
    if (filePaths.foto_0) updateData.foto_0 = filePaths.foto_0
    if (filePaths.foto_50) updateData.foto_50 = filePaths.foto_50
    if (filePaths.foto_100) updateData.foto_100 = filePaths.foto_100
    if (latitude) updateData.latitude = latitude
    if (longitude) updateData.longitude = longitude
    if (location_name) updateData.location_name = location_name

    const { data, error } = await supabase
        .from('laporan')
        .update(updateData)
        .eq('id', id)
        .select()

    if (error) {
        console.error('Error updating laporan:', error)
        throw new Error('Failed to update laporan record')
    }

    return data
}

export const getLaporanById = async (id: string) => {
    const { data, error } = await supabase
        .from('laporan')
        .select('*')
        .eq('id', id)
        .single()

    if (error) {
        console.error('Error fetching laporan by id:', error)
        return null
    }

    return data
}

export const approveLaporan = async (id: string, userId: string) => {
    const { data, error } = await supabase
        .from('laporan')
        .update({ approved: true, status: 'approved' })
        .eq('id', id)
        .select()

    if (error) {
        console.error('Error approving laporan:', error)
        throw new Error('Failed to approve laporan')
    }

    return data
}

export const getLaporanStats = async (filter?: { month: number, year: number, week?: number }) => {
    const now = new Date()
    let startDate: Date
    let endDate: Date

    if (filter) {
        // Calculate based on month, year, week
        startDate = new Date(filter.year, filter.month - 1, 1)
        endDate = new Date(filter.year, filter.month, 0) // End of month

        if (filter.week) {
            // week 1: 1-7, week 2: 8-14, etc.
            const startDay = (filter.week - 1) * 7 + 1
            const endDay = Math.min(filter.week * 7, endDate.getDate())
            startDate = new Date(filter.year, filter.month - 1, startDay)
            endDate = new Date(filter.year, filter.month - 1, endDay)
        }
    } else {
        // DEFAULT: Last 7 days
        startDate = new Date(now)
        startDate.setHours(0, 0, 0, 0)
        startDate.setDate(startDate.getDate() - 6)
        endDate = new Date(now)
    }

    const today = new Date(now)
    today.setHours(0, 0, 0, 0)

    // Parallel requests for efficiency
    const [todayReq, pendingReq, rangeReq, usersReq] = await Promise.all([
        supabase.from('laporan').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
        supabase.from('laporan').select('*', { count: 'exact', head: true }).eq('approved', false),
        supabase.from('laporan').select('created_at, koordinator_id').gte('created_at', startDate.toISOString()).lte('created_at', endDate.toISOString()).order('created_at', { ascending: true }),
        supabase.from('user').select('id, role_petugas_team')
    ])

    const userTeamMap = new Map(usersReq.data?.map(u => [String(u.id), u.role_petugas_team]) || [])

    // Initialize Daily Stats for 3 types
    const types = ['crm', 'wilayah', 'penyapuan']
    const dailyStats: Record<string, Record<string, number>> = {
        crm: {},
        wilayah: {},
        penyapuan: {}
    }

    // Fill days for the selected range handle gaps
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1

    for (let i = 0; i < diffDays; i++) {
        const d = new Date(startDate)
        d.setDate(d.getDate() + i)
        // Only add if still within month if week is not specified
        if (filter && !filter.week && d.getMonth() !== filter.month - 1) break;

        const dateStr = d.toISOString().split('T')[0]
        types.forEach(type => {
            dailyStats[type][dateStr] = 0
        })
    }

    if (rangeReq.data) {
        rangeReq.data.forEach((item: any) => {
            const dateStr = item.created_at.split('T')[0]
            const teamType = userTeamMap.get(String(item.koordinator_id))
            if (teamType && dailyStats[teamType]) {
                dailyStats[teamType][dateStr] = (dailyStats[teamType][dateStr] || 0) + 1
            }
        })
    }

    return {
        today: todayReq.count || 0,
        pending: pendingReq.count || 0,
        daily: dailyStats
    }
}

export const deleteLaporan = async (id: string) => {
    // 1. Get report to find photo paths
    const { data: laporan, error: fetchError } = await supabase
        .from('laporan')
        .select('foto_0, foto_50, foto_100')
        .eq('id', id)
        .single()

    if (fetchError) {
        throw new Error(`Failed to fetch report for deletion: ${fetchError.message}`)
    }

    // 2. Delete images from storage
    const photosToDelete = [laporan.foto_0, laporan.foto_50, laporan.foto_100].filter(Boolean)
    if (photosToDelete.length > 0) {
        const { error: storageError } = await supabase
            .storage
            .from('laporan')
            .remove(photosToDelete)

        if (storageError) {
            console.error('Error deleting images from storage:', storageError)
        }
    }

    // 3. Delete record from table
    const { error: deleteError } = await supabase
        .from('laporan')
        .delete()
        .eq('id', id)

    if (deleteError) {
        throw new Error(`Failed to delete report record: ${deleteError.message}`)
    }

    return { success: true }
}
