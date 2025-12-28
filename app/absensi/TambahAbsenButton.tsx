'use client'

import { useState } from 'react'
import CameraCapture from '../components/CameraCapture'
import { useRouter } from 'next/navigation'

export default function TambahAbsenButton() {
    const [showCamera, setShowCamera] = useState(false)
    const router = useRouter()

    const handleCapture = async (file: File) => {
        // Upload
        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await fetch('/api/absensi', {
                method: 'POST',
                body: formData
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error)
            }

            alert('Absen berhasil dikirim!')
            setShowCamera(false)
            router.refresh() // Refresh page to show new item

        } catch (error: any) {
            alert('Gagal: ' + error.message)
            setShowCamera(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setShowCamera(true)}
                className="bg-orange-light text-white px-6 py-3 rounded-lg font-semibold border-none cursor-pointer flex items-center gap-2 hover:bg-orange-deep transition"
            >
                📸 Tambah Absen
            </button>

            {showCamera && (
                <CameraCapture
                    onCapture={handleCapture}
                    onCancel={() => setShowCamera(false)}
                />
            )}
        </>
    )
}
