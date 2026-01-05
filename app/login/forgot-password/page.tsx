'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')
        setError('')

        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })

            const contentType = res.headers.get('content-type')
            let data
            if (contentType && contentType.includes('application/json')) {
                data = await res.json()
            } else {
                const text = await res.text()
                console.error('Server returned non-JSON response:', text)
                throw new Error('Server error: Response is not JSON. Pastikan API key sudah diatur.')
            }

            if (res.ok) {
                setMessage('Link reset password telah dikirim ke email Anda.')
            } else {
                setError(data.error || 'Terjadi kesalahan.')
            }
        } catch (err: any) {
            setError('Gagal mengirim permintaan: ' + (err.message || 'Network error'));
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-cream font-sans p-4">
            <div className="bg-white p-10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] w-full max-w-[440px] border border-orange-light/10">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-orange-deep rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-orange-deep/30">
                        <span className="text-white text-2xl font-bold italic">P</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-black-soft tracking-tight text-center uppercase">Lupa Kata Sandi</h1>
                    <p className="text-zinc-500 mt-2 text-sm text-center">Masukkan email Anda untuk menerima link reset</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div>
                        <label htmlFor="email" className="block text-sm font-semibold text-gray-dark mb-1.5 ml-1">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            placeholder="nama@email.com"
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

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full p-4 rounded-xl border-none bg-orange-deep text-white text-sm font-bold cursor-pointer mt-4 hover:bg-orange-light hover:shadow-xl hover:shadow-orange-deep/20 transition-all transform active:scale-[0.98] disabled:opacity-70"
                    >
                        {loading ? 'Mengirim...' : 'Kirim Link Reset'}
                    </button>

                    <div className="flex flex-col items-center gap-2 mt-6">
                        <Link href="/login" className="text-xs text-orange-deep font-semibold hover:underline">
                            Kembali ke Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
