import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: Request) {
    try {
        const { token, password } = await request.json()

        if (!token || !password) {
            return NextResponse.json({ error: 'Token and password are required' }, { status: 400 })
        }

        // 1. Find user with this token and check expiry
        const { data: user, error: userError } = await supabase
            .from('user')
            .select('id, reset_token_expiry')
            .eq('reset_token', token)
            .single()

        if (userError || !user) {
            return NextResponse.json({ error: 'Token tidak valid' }, { status: 400 })
        }

        // 2. Check if token has expired
        const expiry = new Date(user.reset_token_expiry)
        if (expiry < new Date()) {
            return NextResponse.json({ error: 'Token telah kedaluwarsa' }, { status: 400 })
        }

        // 3. Update password and clear token
        const { error: updateError } = await supabase
            .from('user')
            .update({
                password: password, // Still using plaintext as per existing login logic
                reset_token: null,
                reset_token_expiry: null
            })
            .eq('id', user.id)

        if (updateError) {
            console.error('Error updating password:', updateError)
            return NextResponse.json({ error: 'Gagal memperbarui kata sandi' }, { status: 500 })
        }

        return NextResponse.json({ message: 'Kata sandi berhasil diperbarui' })

    } catch (err) {
        console.error('Reset password error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
