'use client'

import { useState } from 'react'

export default function UserProfile({ user, variant = 'default' }: { user: any, variant?: 'default' | 'wide' }) {
    const [uploading, setUploading] = useState(false)
    const [avatarKey, setAvatarKey] = useState(user.avatar_path || null)
    const [previewUrl, setPreviewUrl] = useState(
        user.avatar_path
            ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${user.avatar_path}`
            : null
    )

    const isWide = variant === 'wide'

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
        <div className={isWide
            ? "bg-white p-4 rounded-lg shadow-sm w-full mb-6 flex flex-row items-center gap-4 border border-orange-light/20"
            : "bg-white p-8 rounded-lg shadow-sm max-w-[600px] mx-auto border border-orange-light/20"
        }>
            {!isWide && (
                <h2 className="text-xl font-bold mb-6 border-b border-orange-light/20 pb-4 capitalize text-black-soft">
                    Profile {user.role}
                </h2>
            )}

            {/* Avatar Section */}
            <div className={`flex flex-col items-center ${isWide ? 'min-w-[150px] mb-0' : 'mb-8'}`}>
                <div className={`${isWide ? 'w-24 h-24' : 'w-[120px] h-[120px]'} rounded-full overflow-hidden bg-orange-light/10 mb-3 relative`}>
                    {previewUrl ? (
                        <img
                            src={previewUrl}
                            alt="Profile"
                            className="object-cover w-full h-full"
                        />
                    ) : (
                        <div className={`w-full h-full flex items-center justify-center text-orange-light/50 ${isWide ? 'text-4xl' : 'text-5xl'}`}>
                            👤
                        </div>
                    )}
                </div>

                <label className="cursor-pointer inline-block">
                    <span className={`px-3 py-1.5 bg-orange-deep text-white rounded-md text-xs font-medium ${uploading ? 'opacity-70' : 'opacity-100'} hover:bg-orange-light transition`}>
                        {uploading ? 'Mengupload...' : 'Ganti Foto'}
                    </span>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="hidden"
                    />
                </label>
            </div>

            <div className={isWide ? 'flex-1 w-auto' : 'flex-1 w-full'}>
                {isWide && (
                    <h2 className="text-xl font-bold mb-3 border-b border-orange-light/20 pb-2 capitalize text-black-soft">
                        Profile {user.role}
                    </h2>
                )}
                <table className="w-full border-collapse">
                    <tbody>
                        <tr className="border-b border-orange-light/10">
                            <td className={`py-1.5 font-semibold text-gray-dark text-sm ${isWide ? 'w-[30%]' : 'w-[40%]'}`}>Nama Lengkap</td>
                            <td className="py-1.5 text-black-soft text-sm">{user.name}</td>
                        </tr>
                        <tr className="border-b border-orange-light/10">
                            <td className="py-1.5 font-semibold text-gray-dark text-sm">Username</td>
                            <td className="py-1.5 text-black-soft text-sm">{user.username}</td>
                        </tr>
                        <tr className="border-b border-orange-light/10">
                            <td className="py-1.5 font-semibold text-gray-dark text-sm">Role</td>
                            <td className="py-1.5 text-black-soft capitalize text-sm">{user.role}</td>
                        </tr>
                        {user.role !== 'admin' && (
                            <>
                                <tr className="border-b border-orange-light/10">
                                    <td className="py-1.5 font-semibold text-gray-dark text-sm">Unit Kerja</td>
                                    <td className="py-1.5 text-black-soft text-sm">{user.role_petugas_team || '-'}</td>
                                </tr>
                                <tr className="border-b border-orange-light/10">
                                    <td className="py-1.5 font-semibold text-gray-dark text-sm">Nomor Tim</td>
                                    <td className="py-1.5 text-black-soft text-sm">Tim {user.team_number || '-'}</td>
                                </tr>
                            </>
                        )}
                        {user.role !== 'admin' && (
                            <tr className="border-b border-orange-light/10">
                                <td className="py-1.5 font-semibold text-gray-dark text-sm">No. Handphone</td>
                                <td className="py-1.5 text-black-soft text-sm">{user.phone_number || '-'}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
