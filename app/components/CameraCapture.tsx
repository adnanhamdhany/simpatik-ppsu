'use client'

import React, { useRef, useState, useCallback } from 'react'
import Webcam from 'react-webcam'

// Constraints for mobile-friendly camera
const videoConstraints = {
    width: 720,
    height: 720,
    facingMode: "user" // or "environment" for back camera
}

interface CameraCaptureProps {
    onCapture: (file: File, latitude?: number, longitude?: number, locationName?: string) => void
    onCancel: () => void
}

export default function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
    const webcamRef = useRef<Webcam>(null)
    const [imgSrc, setImgSrc] = useState<string | null>(null)
    const [location, setLocation] = useState<{ lat: number, lng: number, name?: string } | null>(null)

    // Fetch location as soon as component mounts (camera opens)
    React.useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const lat = position.coords.latitude
                    const lng = position.coords.longitude
                    setLocation({ lat, lng })

                    try {
                        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`)
                        const data = await res.json()
                        const name = data.address.village || data.address.suburb || data.address.road || data.display_name.split(',')[0]
                        setLocation({ lat, lng, name })
                    } catch (err) {
                        console.error("Reverse geocoding error:", err)
                    }
                },
                (error) => {
                    console.error("Error getting location:", error)
                    alert("Gagal mendapatkan lokasi. Pastikan GPS aktif.")
                },
                { enableHighAccuracy: true }
            )
        }
    }, [])

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current?.getScreenshot()
        if (imageSrc) {
            setImgSrc(imageSrc)
        }
    }, [webcamRef])

    const retake = () => {
        setImgSrc(null)
    }

    const confirm = () => {
        if (!imgSrc) return

        // Convert Base64 to File
        fetch(imgSrc)
            .then(res => res.blob())
            .then(blob => {
                const file = new File([blob], "absensi.jpg", { type: "image/jpeg" })
                onCapture(file, location?.lat, location?.lng, location?.name)
            })
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'black',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '500px' }}>
                {imgSrc ? (
                    <img src={imgSrc} alt="Captured" style={{ width: '100%', borderRadius: '8px' }} />
                ) : (
                    <Webcam
                        audio={false}
                        ref={webcamRef}
                        screenshotFormat="image/jpeg"
                        videoConstraints={videoConstraints}
                        style={{ width: '100%', borderRadius: '8px' }}
                    />
                )}

                {/* Location Overlay */}
                <div style={{
                    position: 'absolute', bottom: '10px', left: '10px', right: '10px',
                    backgroundColor: 'rgba(0,0,0,0.6)', color: 'white', padding: '10px',
                    borderRadius: '8px', fontSize: '12px', backdropFilter: 'blur(4px)'
                }}>
                    {location ? (
                        location.name ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                📍 <span style={{ fontWeight: 'bold' }}>{location.name}</span>
                            </div>
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                                ⏳ Mendeteksi nama lokasi...
                            </div>
                        )
                    ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            📡 Mencari koordinat GPS...
                        </div>
                    )}
                </div>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
                {!imgSrc ? (
                    <>
                        <button onClick={capture} style={{ padding: '10px 20px', borderRadius: '50px', border: 'none', backgroundColor: 'white', fontWeight: 'bold' }}>
                            📸 AMBIL FOTO
                        </button>
                        <button onClick={onCancel} style={{ padding: '10px 20px', borderRadius: '50px', border: '1px solid white', backgroundColor: 'transparent', color: 'white' }}>
                            BATAL
                        </button>
                    </>
                ) : (
                    <>
                        <button onClick={confirm} style={{ padding: '10px 20px', borderRadius: '50px', border: 'none', backgroundColor: '#22c55e', color: 'white', fontWeight: 'bold' }}>
                            ✅ KIRIM
                        </button>
                        <button onClick={retake} style={{ padding: '10px 20px', borderRadius: '50px', border: 'none', backgroundColor: '#eab308', color: 'white', fontWeight: 'bold' }}>
                            🔄 ULANG
                        </button>
                    </>
                )}
            </div>
        </div>
    )
}
