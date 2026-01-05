'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            })

            const data = await res.json()

            if (res.ok) {
                // If we want dynamic redirect based on role, we can do it here or let the home page handle it.
                // Since home page now handles admin redirect, sending to '/' is fine, 
                // BUT user explicitly asked "halaman pertama yang terbuka itu adalah dashboard".
                // Safest is to let Home page handle routing logic so we don't duplicate logic in client.
                window.location.href = '/dashboard'
            } else {
                alert('Login failed: ' + data.error)
            }
        } catch (error) {
            alert('An error occurred during login.')
        }
    }


    return (
        <div className="flex justify-center items-center min-h-screen bg-cream font-sans p-4">
            <div className="bg-white p-10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] w-full max-w-[440px] border border-orange-light/10">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-orange-deep rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-orange-deep/30">
                        <span className="text-white text-2xl font-bold italic">P</span>
                    </div>
                    <h1 className="text-3xl font-extrabold text-black-soft tracking-tight">PPSU SIMPATIK</h1>
                    <p className="text-zinc-500 mt-2 text-sm">Silakan masuk ke akun Anda</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div>
                        <label htmlFor="username" className="block text-sm font-semibold text-gray-dark mb-1.5 ml-1">Nama Pengguna</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="block w-full p-4 rounded-xl border border-zinc-200 text-sm outline-none focus:border-orange-deep focus:ring-2 focus:ring-orange-deep/10 transition-all text-black-soft bg-zinc-50/50"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-semibold text-gray-dark mb-1.5 ml-1">Kata Sandi</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="block w-full p-4 rounded-xl border border-zinc-200 text-sm outline-none focus:border-orange-deep focus:ring-2 focus:ring-orange-deep/10 transition-all text-black-soft bg-zinc-50/50"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full p-4 rounded-xl border-none bg-orange-deep text-white text-sm font-bold cursor-pointer mt-4 hover:bg-orange-light hover:shadow-xl hover:shadow-orange-deep/20 transition-all transform active:scale-[0.98]"
                    >
                        Masuk
                    </button>

                    <div className="flex flex-col items-center gap-2 mt-6">
                        <p className="text-xs text-zinc-400 text-center">
                            Dengan masuk, Anda menyetujui syarat dan ketentuan kami.
                        </p>
                        <Link href="/login/forgot-password" title="forgot password" className="text-xs text-orange-deep font-semibold cursor-pointer hover:underline">
                            Lupa Kata Sandi?
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}

