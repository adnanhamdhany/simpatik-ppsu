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
                style={{
                    backgroundColor: '#2563eb',
                    color: 'white',
                    padding: '0.75rem 1.5rem',
                    borderRadius: '0.5rem',
                    fontWeight: '600',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                }}
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
