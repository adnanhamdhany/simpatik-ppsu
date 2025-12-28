'use client'

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
        <button onClick={handleLogout} style={{ marginTop: '1rem', padding: '0.5rem 1rem', cursor: 'pointer' }}>
            Logout
        </button>
    )
}
