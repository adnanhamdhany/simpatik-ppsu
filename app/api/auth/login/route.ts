import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { cookies } from 'next/headers'

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { username, password } = body

        if (!username || !password) {
            return NextResponse.json(
                { error: 'Username and password are required' },
                { status: 400 }
            )
        }

        // Query user table
        const { data: user, error } = await supabase
            .from('user')
            .select('*')
            .eq('username', username)
            .eq('password', password) // content is plaintext
            .single()

        if (error || !user) {
            return NextResponse.json(
                { error: 'Invalid credentials' },
                { status: 401 }
            )
        }

        // Set cookie
        const cookieStore = await cookies()
        cookieStore.set('session_user', JSON.stringify({
            id: user.id,
            username: user.username,
            name: user.name,
            role: user.role,
            avatar_path: user.avatar_path,
            role_petugas_team: user.role_petugas_team
        }), {
            httpOnly: true,
            path: '/',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 // 1 day
        })

        // Login successful
        return NextResponse.json({
            message: 'Login successful',
            user: {
                id: user.id,
                username: user.username,
                name: user.name,
                role: user.role
            }
        })

    } catch (err) {
        return NextResponse.json(
            { error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
