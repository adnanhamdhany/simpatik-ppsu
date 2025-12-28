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
    // We could use a join if FK exists, but manual mapping is safe here
    // Optimally we only fetch relevant user IDs, but fetching all for now is fine since we have a user service
    const { data: users, error: usersError } = await supabase
        .from('user')
        .select('id, name, role_petugas_team')

    if (usersError) {
        console.error('Error fetching users for mapping:', usersError)
        return laporan // Return reports even if user mapping fails
    }

    // Create a map of id -> user details
    const userMap = new Map(users.map(u => [String(u.id), { name: u.name, team: u.role_petugas_team }]))

    // Attach name and team to report objects
    return laporan.map(item => {
        const userDetails = userMap.get(String(item.koordinator_id))
        return {
            ...item,
            koordinator_name: userDetails?.name || item.koordinator_id,
            koordinator_team: userDetails?.team
        }
    })
}

export const getLaporanByKoordinatorId = async (userId: string) => {
    const { data, error } = await supabase
        .from('laporan')
        .select('*')
        .eq('koordinator_id', userId)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching koordinator laporan:', error)
        return []
    }

    return data
}

export const createLaporan = async (file: File, deskripsi: string, userId: string) => {
    // 1. Upload Image to Storage
    const fileName = `${Date.now()}-${file.name}`
    const { data: storageData, error: storageError } = await supabase
        .storage
        .from('laporan')
        .upload(fileName, file)

    if (storageError) {
        console.error('Error uploading image:', storageError)
        throw new Error(`Failed to upload image: ${storageError.message}`)
    }

    // 2. Insert Data to Table
    const { data, error } = await supabase
        .from('laporan')
        .insert([
            {
                deskripsi,
                image_path: fileName,
                koordinator_id: userId,
                status: 'pending'
            }
        ])
        .select()

    if (error) {
        console.error('Error creating laporan:', error)
        // Optional: Delete uploaded image if insert fails
        throw new Error('Failed to create laporan record')
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

export const getLaporanStats = async () => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Parallel requests for efficiency
    const [todayReq, pendingReq, allReq] = await Promise.all([
        // 1. Count Today
        supabase
            .from('laporan')
            .select('*', { count: 'exact', head: true })
            .gte('created_at', today.toISOString()),

        // 2. Count Pending (approved = false)
        supabase
            .from('laporan')
            .select('*', { count: 'exact', head: true })
            .eq('approved', false),

        // 3. Get all Created At for Monthly Chart
        supabase
            .from('laporan')
            .select('created_at')
            .order('created_at', { ascending: true })
    ])

    // Process Monthly Data
    const monthlyCounts: Record<string, number> = {}
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    if (allReq.data) {
        allReq.data.forEach((item: any) => {
            const date = new Date(item.created_at)
            const monthName = months[date.getMonth()]
            monthlyCounts[monthName] = (monthlyCounts[monthName] || 0) + 1
        })
    }

    return {
        today: todayReq.count || 0,
        pending: pendingReq.count || 0,
        monthly: monthlyCounts
    }
}
