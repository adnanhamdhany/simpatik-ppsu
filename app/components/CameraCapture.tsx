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
    onCapture: (file: File) => void
    onCancel: () => void
}

export default function CameraCapture({ onCapture, onCancel }: CameraCaptureProps) {
    const webcamRef = useRef<Webcam>(null)
    const [imgSrc, setImgSrc] = useState<string | null>(null)

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
                onCapture(file)
            })
    }

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 50, backgroundColor: 'black',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
        }}>
            {imgSrc ? (
                <img src={imgSrc} alt="Captured" style={{ width: '100%', maxWidth: '500px', borderRadius: '8px' }} />
            ) : (
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    style={{ width: '100%', maxWidth: '500px', borderRadius: '8px' }}
                />
            )}

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
