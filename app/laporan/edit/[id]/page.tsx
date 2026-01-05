'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function EditLaporanPage() {
    const router = useRouter()
    const params = useParams()
    const id = params.id as string

    const [deskripsi, setDeskripsi] = useState('')
    const [foto0, setFoto0] = useState<File | null>(null)
    const [foto50, setFoto50] = useState<File | null>(null)
    const [foto100, setFoto100] = useState<File | null>(null)
    const [existingPhotos, setExistingPhotos] = useState<{ foto_0?: string, foto_50?: string, foto_100?: string }>({})
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)

    useEffect(() => {
        const fetchLaporan = async () => {
            try {
                const res = await fetch(`/api/laporan/${id}`)
                if (res.ok) {
                    const data = await res.json()
                    setDeskripsi(data.deskripsi || '')
                    setExistingPhotos({
                        foto_0: data.foto_0,
                        foto_50: data.foto_50,
                        foto_100: data.foto_100
                    })
                }
            } catch (error) {
                console.error('Error fetching laporan:', error)
            } finally {
                setFetching(false)
            }
        }
        if (id) fetchLaporan()
    }, [id])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!deskripsi) {
            alert('Deskripsi harus diisi')
            return
        }

        setLoading(true)

        const formData = new FormData()
        formData.append('id', id)
        formData.append('deskripsi', deskripsi)
        if (foto0) formData.append('foto_0', foto0)
        if (foto50) formData.append('foto_50', foto50)
        if (foto100) formData.append('foto_100', foto100)

        const res = await fetch('/api/laporan', {
            method: 'PATCH',
            body: formData
        })

        if (res.ok) {
            router.push('/laporan')
            router.refresh()
        } else {
            const data = await res.json()
            alert(`Gagal memperbarui laporan: ${data.error}`)
        }
        setLoading(false)
    }

    if (fetching) return <div className="p-8 text-center">Memuat data...</div>

    const getPhotoUrl = (path: string) => `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/laporan/${path}`

    return (
        <div className="p-8 max-w-[600px] mx-auto">
            <h1 className="text-2xl font-bold mb-6">Edit Laporan</h1>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <div>
                    <label className="block mb-2 font-medium">Deskripsi Kegiatan</label>
                    <textarea
                        value={deskripsi}
                        onChange={e => setDeskripsi(e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded min-h-[100px] outline-none focus:border-blue-500"
                        placeholder="Jelaskan kegiatan hari ini..."
                    />
                </div>

                <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 border border-zinc-200 rounded-lg bg-zinc-50">
                        <label className="block mb-2 font-semibold text-zinc-700">Foto Progress 0%</label>
                        {existingPhotos.foto_0 && (
                            <div className="mb-2 w-full h-32 overflow-hidden rounded bg-gray-200">
                                <img src={getPhotoUrl(existingPhotos.foto_0)} alt="0%" className="w-full h-full object-cover" />
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={e => setFoto0(e.target.files?.[0] || null)}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>

                    <div className="p-4 border border-zinc-200 rounded-lg bg-zinc-50">
                        <label className="block mb-2 font-semibold text-zinc-700">Foto Progress 50%</label>
                        {existingPhotos.foto_50 && (
                            <div className="mb-2 w-full h-32 overflow-hidden rounded bg-gray-200">
                                <img src={getPhotoUrl(existingPhotos.foto_50)} alt="50%" className="w-full h-full object-cover" />
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={e => setFoto50(e.target.files?.[0] || null)}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>

                    <div className="p-4 border border-zinc-200 rounded-lg bg-zinc-50">
                        <label className="block mb-2 font-semibold text-zinc-700">Foto Progress 100%</label>
                        {existingPhotos.foto_100 && (
                            <div className="mb-2 w-full h-32 overflow-hidden rounded bg-gray-200">
                                <img src={getPhotoUrl(existingPhotos.foto_100)} alt="100%" className="w-full h-full object-cover" />
                            </div>
                        )}
                        <input
                            type="file"
                            accept="image/*"
                            onChange={e => setFoto100(e.target.files?.[0] || null)}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                        />
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex-1 p-3 bg-gray-200 text-gray-800 rounded font-medium hover:bg-gray-300 transition"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`flex-2 p-3 bg-orange-light text-white border-none rounded cursor-pointer font-medium hover:bg-orange-deep transition ${loading ? 'opacity-70 cursor-not-allowed' : 'opacity-100'}`}
                    >
                        {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                </div>
            </form>
        </div>
    )
}
