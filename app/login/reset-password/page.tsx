'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

function ResetPasswordForm() {
    const searchParams = useSearchParams()
    const token = searchParams.get('token')

    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (password !== confirmPassword) {
            setError('Kata sandi tidak cocok.')
            return
        }

        if (password.length < 6) {
            setError('Kata sandi minimal 6 karakter.')
            return
        }

        setLoading(true)
        setMessage('')
        setError('')

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password }),
            })

            const data = await res.json()

            if (res.ok) {
                setMessage('Kata sandi berhasil diperbarui. Silakan login kembali.')
            } else {
                setError(data.error || 'Terjadi kesalahan.')
            }
        } catch (err) {
            setError('Gagal mereset kata sandi.')
        } finally {
            setLoading(false)
        }
    }

    if (!token) {
        return (
            <div className="text-center">
                <p className="text-red-500 font-bold mb-4">Token reset tidak valid atau hilang.</p>
                <Link href="/login" className="text-orange-deep hover:underline font-bold">Kembali ke Login</Link>
            </div>
        )
    }

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
                <label htmlFor="password" title="password" className="block text-sm font-semibold text-gray-dark mb-1.5 ml-1">Kata Sandi Baru</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full p-4 rounded-xl border border-zinc-200 text-sm outline-none focus:border-orange-deep focus:ring-2 focus:ring-orange-deep/10 transition-all text-black-soft bg-zinc-50/50"
                />
            </div>
            <div>
                <label htmlFor="confirmPassword" title="confirmPassword" className="block text-sm font-semibold text-gray-dark mb-1.5 ml-1">Konfirmasi Kata Sandi Baru</label>
                <input
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="block w-full p-4 rounded-xl border border-zinc-200 text-sm outline-none focus:border-orange-deep focus:ring-2 focus:ring-orange-deep/10 transition-all text-black-soft bg-zinc-50/50"
                />
            </div>

            {message && (
                <div className="p-4 bg-green-50 border border-green-100 text-green-700 text-xs font-bold rounded-xl text-center">
                    {message}
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 border border-red-100 text-red-600 text-xs font-bold rounded-xl text-center">
                    {error}
                </div>
            )}

            {!message && (
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full p-4 rounded-xl border-none bg-orange-deep text-white text-sm font-bold cursor-pointer mt-4 hover:bg-orange-light hover:shadow-xl hover:shadow-orange-deep/20 transition-all transform active:scale-[0.98] disabled:opacity-70"
                >
                    {loading ? 'Memproses...' : 'Perbarui Kata Sandi'}
                </button>
            )}

            <div className="flex flex-col items-center gap-2 mt-6">
                <Link href="/login" className="text-xs text-orange-deep font-semibold hover:underline">
                    Kembali ke Login
                </Link>
            </div>
        </form>
    )
}

export default function ResetPasswordPage() {
    return (
        <div className="flex justify-center items-center min-h-screen bg-cream font-sans p-4">
            <div className="bg-white p-10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] w-full max-w-[440px] border border-orange-light/10">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-orange-deep rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-orange-deep/30">
                        <span className="text-white text-2xl font-bold italic">P</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-black-soft tracking-tight text-center uppercase">Reset Kata Sandi</h1>
                    <p className="text-zinc-500 mt-2 text-sm text-center">Silakan masukkan kata sandi baru Anda</p>
                </div>

                <Suspense fallback={<div className="text-center">Loading...</div>}>
                    <ResetPasswordForm />
                </Suspense>
            </div>
        </div>
    )
}
