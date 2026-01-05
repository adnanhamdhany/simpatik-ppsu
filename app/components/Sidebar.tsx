'use client'
import React from 'react'
import Link from 'next/link'
import LogoutButton from './LogoutButton'
import { HomeIcon, UsersIcon, DocumentTextIcon, CameraIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline'
import { UserCircleIcon } from '@heroicons/react/24/solid'

interface User {
    username: string
    name: string
    role: string
    avatar_path?: string
}

export default function Sidebar({ user }: { user: User }) {
    const [isOpen, setIsOpen] = React.useState(false)

    const avatarUrl = user.avatar_path
        ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${user.avatar_path}`
        : null

    return (
        <>
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-gray-dark border-b border-cream/10 flex items-center justify-between px-6 z-40">
                <span className="text-white-off font-black tracking-tight text-lg">SIMPATIK PPSU</span>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 text-white-off hover:bg-white-off/10 rounded-lg transition"
                >
                    {isOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
                </button>
            </div>

            {/* Overlay */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    onClick={() => setIsOpen(false)}
                ></div>
            )}

            <div className={`fixed top-0 left-0 h-screen w-[280px] overflow-y-auto bg-gray-dark border-r border-cream/10 flex flex-col z-50 transition-transform duration-300 lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <div
                    className="relative w-full h-[140px] flex flex-col items-center justify-center text-center bg-cover bg-center border-b border-cream/10"
                    style={{ backgroundImage: "url('/images/sidebar-header-bg.jpg')" }}
                >
                    {/* Dark overlay for text readability */}
                    <div className="absolute inset-0 bg-gray-900/70"></div>

                    <div className="relative z-10 flex flex-col items-center">
                        <div className="w-16 h-16 rounded-full bg-white-off/10 flex items-center justify-center mb-2 overflow-hidden border-2 border-white-off/20 shadow-lg">
                            {avatarUrl ? (
                                <img
                                    src={avatarUrl}
                                    alt={user.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <UserCircleIcon className="w-14 h-14 text-white-off/50" />
                            )}
                        </div>
                        <p className="text-base text-white-off font-bold mt-1 shadow-sm ">{user.name}</p>
                        <div className="text-xs text-orange-light uppercase mt-1 font-bold tracking-wider">
                            {user.role}
                        </div>
                    </div>
                </div>

                <div className="p-6 flex flex-col gap-2">
                    <Link
                        href="/dashboard"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-md text-white-off text-sm font-medium hover:bg-white-off/10 transition no-underline"
                    >
                        <HomeIcon className="w-5 h-5" />
                        <span>Dashboard</span>
                    </Link>

                    {user.role === 'admin' && (
                        <Link
                            href="/datauser"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 w-full px-4 py-3 rounded-md text-white-off text-sm font-medium hover:bg-white-off/10 transition no-underline"
                        >
                            <UsersIcon className="w-5 h-5" />
                            <span>Data User</span>
                        </Link>
                    )}

                    {(user.role === 'admin' || user.role === 'koordinator' || user.role === 'lurah') && (
                        <Link
                            href="/laporan"
                            onClick={() => setIsOpen(false)}
                            className="flex items-center gap-3 w-full px-4 py-3 rounded-md text-white-off text-sm font-medium hover:bg-white-off/10 transition no-underline"
                        >
                            <DocumentTextIcon className="w-5 h-5" />
                            <span>Laporan</span>
                        </Link>
                    )}

                    {/* All roles can see Absensi (Petugas, Koordinator, Admin) */}
                    <Link
                        href="/absensi"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-md text-white-off text-sm font-medium hover:bg-white-off/10 transition no-underline"
                    >
                        <CameraIcon className="w-5 h-5" />
                        <span>Absensi</span>
                    </Link>

                    <LogoutButton />
                </div>
            </div>
        </>
    )
}
