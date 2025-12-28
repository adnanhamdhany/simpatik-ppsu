
import { supabase } from '@/lib/supabase'

export const getAllUsers = async () => {
    const { data, error } = await supabase
        .from('user')
        .select('*')
        .order('id', { ascending: true })

    if (error) {
        console.error('Error fetching users:', error)
        return []
    }

    return data
}


export const uploadAvatar = async (file: File, userId: string) => {
    // 1. Upload to Storage
    // Use timestamp to prevent caching issues or name collisions, though userId folder structure is better
    // File structure: avatars/{userId}-{timestamp}-{filename}
    const fileExt = file.name.split('.').pop()
    const fileName = `${userId}-${Date.now()}.${fileExt}`

    // Upload - Upsert true to overwrite if same name exists
    const { data, error } = await supabase
        .storage
        .from('avatars')
        .upload(fileName, file, {
            upsert: true
        })

    if (error) {
        throw error
    }

    return fileName
}

export const updateUserAvatar = async (userId: string, avatarPath: string) => {
    const { data, error } = await supabase
        .from('user')
        .update({ avatar_path: avatarPath })
        .eq('id', userId)
        .select()

    if (error) {
        throw error
    }

    return data
}

export const countPetugas = async () => {
    const { count, error } = await supabase
        .from('user')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'petugas')

    if (error) {
        console.error('Error counting petugas:', error)
        return 0
    }

    return count || 0
}

export const getExistingTeams = async () => {
    const { data, error } = await supabase
        .from('user')
        .select('role_petugas_team')
        .not('role_petugas_team', 'is', null) // Only get non-null

    if (error) {
        console.error('Error fetching teams:', error)
        return []
    }

    // Extract unique values
    const teams = Array.from(new Set(data.map((item: any) => item.role_petugas_team).filter(Boolean)))
    return teams.sort()
}
