'use client'

import { useState } from 'react'

export default function UserProfile({ user }: { user: any }) {
    const [uploading, setUploading] = useState(false)
    const [avatarKey, setAvatarKey] = useState(user.avatar_path || null)
    const [previewUrl, setPreviewUrl] = useState(
        user.avatar_path
            ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${user.avatar_path}`
            : null
    )

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) {
            return
        }

        const file = e.target.files[0]
        setUploading(true)

        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('userId', user.id)

            const res = await fetch('/api/user/avatar', {
                method: 'POST',
                body: formData
            })

            const data = await res.json()
            if (!res.ok) throw new Error(data.error)

            setAvatarKey(data.path)
            setPreviewUrl(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${data.path}`)
            alert('Foto profile berhasil diperbarui!')

        } catch (error: any) {
            alert('Upload gagal: ' + error.message)
        } finally {
            setUploading(false)
        }
    }

    return (
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1rem', textTransform: 'capitalize' }}>
                Profile {user.role}
            </h2>

            {/* Avatar Section */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '2rem' }}>
                <div style={{
                    width: '120px',
                    height: '120px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    backgroundColor: '#e4e4e7',
                    marginBottom: '1rem',
                    position: 'relative',
                    border: '4px solid #f4f4f5'
                }}>
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt="Profile"
                            style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                        />
                    ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a1a1aa', fontSize: '3rem' }}>
                            👤
                        </div>
                    )}
                </div>

                <label style={{ cursor: 'pointer', display: 'inline-block' }}>
                    <span style={{
                        padding: '0.5rem 1rem',
                        backgroundColor: '#2563eb',
                        color: 'white',
                        borderRadius: '0.375rem',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        opacity: uploading ? 0.7 : 1
                    }}>
                        {uploading ? 'Mengupload...' : 'Ganti Foto'}
                    </span>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                        style={{ display: 'none' }}
                    />
                </label>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <tbody>
                    <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '1rem 0', fontWeight: '600', width: '40%', color: '#374151' }}>Nama Lengkap</td>
                        <td style={{ padding: '1rem 0', color: '#111827' }}>{user.name}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '1rem 0', fontWeight: '600', color: '#374151' }}>Username</td>
                        <td style={{ padding: '1rem 0', color: '#111827' }}>{user.username}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '1rem 0', fontWeight: '600', color: '#374151' }}>Role</td>
                        <td style={{ padding: '1rem 0', color: '#111827', textTransform: 'capitalize' }}>{user.role}</td>
                    </tr>
                    <tr style={{ borderBottom: '1px solid #f3f4f6' }}>
                        <td style={{ padding: '1rem 0', fontWeight: '600', color: '#374151' }}>Tim Petugas</td>
                        <td style={{ padding: '1rem 0', color: '#111827' }}>{user.role_petugas_team || '-'}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    )
}
