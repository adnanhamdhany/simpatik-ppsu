'use client'

import { ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline'

export default function LogoutButton() {
    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' })
            window.location.href = '/login'
        } catch (error) {
            console.error('Logout failed', error)
        }
    }

    return (
        <button onClick={handleLogout} className="w-full px-4 py-3 cursor-pointer text-white-off rounded-md hover:bg-white-off/10 transition text-sm font-medium flex items-center gap-3 text-left">
            <ArrowLeftOnRectangleIcon className="w-5 h-5" />
            <span>Logout</span>
        </button>
    )
}
