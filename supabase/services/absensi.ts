
import { supabase } from '@/lib/supabase'

export const submitAbsensi = async (file: File, userId: string) => {
    // 1. Upload Image
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`

    const { error: storageError } = await supabase
        .storage
        .from('absensi')
        .upload(fileName, file)

    if (storageError) throw new Error(`Upload failed: ${storageError.message}`)

    // 2. Insert Record
    const { data, error } = await supabase
        .from('absensi')
        .insert([{
            user_id: userId,
            image_path: fileName,
            status: 'pending'
        }])
        .select()

    if (error) throw new Error(`Database insert failed: ${error.message}`)

    return data
}

export const getAbsensiList = async (userRole: string, userId: string) => {
    let query = supabase
        .from('absensi')
        .select(`
            *,
            user:user_id (name, role, role_petugas_team)
        `)
        .order('created_at', { ascending: false })

    // If not admin, only show own data
    if (userRole !== 'admin') {
        query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) {
        console.error('Error fetching absensi:', error)
        return []
    }

    return data
}

export const approveAbsensi = async (id: string, adminId: string) => {
    const { data, error } = await supabase
        .from('absensi')
        .update({ status: 'approved', approved_by: adminId })
        .eq('id', id)
        .select()

    if (error) throw new Error(`Approval failed: ${error.message}`)

    return data
}
