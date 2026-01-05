import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { Resend } from 'resend'
import crypto from 'crypto'

export async function POST(request: Request) {
    try {
        const apiKey = process.env.RESEND_API_KEY
        if (!apiKey) {
            console.error('RESEND_API_KEY is missing in .env')
            return NextResponse.json({ error: 'Sistem email belum dikonfigurasi. Hubungi Admin.' }, { status: 500 })
        }

        const resend = new Resend(apiKey)
        const body = await request.json()
        const { email } = body
        console.log('Forgot Password request for:', email)

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 })
        }

        // 1. Check if user exists with this email
        const { data: user, error: userError } = await supabase
            .from('user')
            .select('id, name, email')
            .eq('email', email)
            .single()

        if (userError || !user) {
            // For security, don't reveal if user exists or not
            return NextResponse.json({ message: 'If an account exists, a reset link has been sent.' })
        }

        // 2. Generate secure token
        const token = crypto.randomBytes(32).toString('hex')
        const expiry = new Date(Date.now() + 3600000) // 1 hour expiry

        // 3. Save token to database
        const { error: updateError } = await supabase
            .from('user')
            .update({
                reset_token: token,
                reset_token_expiry: expiry.toISOString()
            })
            .eq('id', user.id)

        if (updateError) {
            console.error('Error saving reset token:', updateError)
            return NextResponse.json({ error: 'Failed to generate reset link' }, { status: 500 })
        }

        // 4. Send Email via Resend
        const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/login/reset-password?token=${token}`

        const { error: sendError } = await resend.emails.send({
            from: 'PPSU SIMPATIK <onboarding@resend.dev>', // Resend default for unverified domains
            to: [email],
            subject: 'Reset Kata Sandi - PPSU SIMPATIK',
            html: `
                <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #ff6113;">Halo, ${user.name}</h2>
                    <p>Anda menerima email ini karena kami menerima permintaan untuk mereset kata sandi akun Anda.</p>
                    <p>Silakan klik tombol di bawah ini untuk mereset kata sandi Anda. Link ini akan kedaluwarsa dalam 1 jam.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" style="background-color: #ff6113; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Reset Kata Sandi</a>
                    </div>
                    <p>Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini.</p>
                    <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="font-size: 12px; color: #888;">
                        Jika tombol di atas tidak berfungsi, salin dan tempel link berikut ke browser Anda:<br>
                        <a href="${resetLink}">${resetLink}</a>
                    </p>
                </div>
            `
        })

        if (sendError) {
            console.error('Error sending email:', sendError)
            return NextResponse.json({ error: 'Failed to send reset email' }, { status: 500 })
        }

        return NextResponse.json({ message: 'Reset link sent successfully' })

    } catch (err) {
        console.error('Forgot password error:', err)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
