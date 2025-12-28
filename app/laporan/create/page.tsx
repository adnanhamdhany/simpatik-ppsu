'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function CreateLaporanPage() {
    const router = useRouter()
    const [deskripsi, setDeskripsi] = useState('')
    const [file, setFile] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file || !deskripsi) {
            alert('Please fill all fields')
            return
        }

        setLoading(true)

        // We need to get the user ID. 
        // In a real client app, we might have it in context or fetch it.
        // For simplicity, we'll parse the cookie client-side or fetch a session endpoint.
        // HACK: For now, let's assume we can rely on a session API or just parse document.cookie if httpOnly is false (it is true though).
        // BETTER: Let's fetch the user from our existing /api/user endpoint? No that returns all users.
        // OPTION: We can pass the cookie value from the server component to this client component if we nested it, 
        // but this is a page. 
        // SOLUTION: We will fetch a new endpoint /api/auth/me to get current user, OR
        // We can just rely on the server to extract userId from the cookie! 
        // WAIT, the API `route.ts` I wrote expects `userId` in FormData. Ideally the SERVER should extract it from the cookie for security.
        // Let's refactor the API to get userId from cookie, it is safer.
        // For now, I will stick to the plan but realize client needs userId. 

        // REFACTOR ON THE FLY: I will modify the API to get userId from cookie. 
        // But for this client code, I will just submit file and deskripsi.

        const formData = new FormData()
        formData.append('file', file)
        formData.append('deskripsi', deskripsi)
        // formData.append('userId', ...) -> Removing this requirement from client

        const res = await fetch('/api/laporan', {
            method: 'POST',
            body: formData
        })

        if (res.ok) {
            router.push('/laporan')
            router.refresh()
        } else {
            const data = await res.json()
            alert(`Failed to create report: ${data.error}`)
        }
        setLoading(false)
    }

    return (
        <div style={{ padding: '2rem', maxWidth: '600px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem' }}>Buat Laporan Baru</h1>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Deskripsi Kegiatan</label>
                    <textarea
                        value={deskripsi}
                        onChange={e => setDeskripsi(e.target.value)}
                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', minHeight: '100px' }}
                        placeholder="Jelaskan kegiatan hari ini..."
                    />
                </div>

                <div>
                    <label style={{ display: 'block', marginBottom: '0.5rem' }}>Dokumentasi (Foto)</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={e => setFile(e.target.files?.[0] || null)}
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        padding: '0.75rem',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        opacity: loading ? 0.7 : 1
                    }}
                >
                    {loading ? 'Mengirim...' : 'Kirim Laporan'}
                </button>
            </form>
        </div>
    )
}
