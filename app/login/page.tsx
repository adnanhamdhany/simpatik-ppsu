'use client'

import { useState } from 'react'

export default function LoginPage() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            })

            const data = await res.json()

            if (res.ok) {
                // If we want dynamic redirect based on role, we can do it here or let the home page handle it.
                // Since home page now handles admin redirect, sending to '/' is fine, 
                // BUT user explicitly asked "halaman pertama yang terbuka itu adalah dashboard".
                // Safest is to let Home page handle routing logic so we don't duplicate logic in client.
                window.location.href = '/dashboard'
            } else {
                alert('Login failed: ' + data.error)
            }
        } catch (error) {
            alert('An error occurred during login.')
        }
    }


    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            backgroundColor: '#f4f4f5',
            fontFamily: 'sans-serif'
        }}>
            <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '0.5rem',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                width: '100%',
                maxWidth: '400px'
            }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1.5rem', textAlign: 'center', color: '#18181b' }}>PPSU Login</h1>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label htmlFor="username" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#3f3f46', marginBottom: '0.25rem' }}>Username</label>
                        <input
                            type="text"
                            id="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            style={inputStyle}
                            placeholder="e.g., adnanhmd"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#3f3f46', marginBottom: '0.25rem' }}>Password</label>
                        <input
                            type="password"
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            style={inputStyle}
                            placeholder="••••••••"
                        />
                    </div>
                    <button type="submit" style={buttonStyle}>Sign In</button>
                    <p style={{ fontSize: '0.75rem', color: '#71717a', textAlign: 'center', marginTop: '1rem' }}>
                        If you don't have an account, please contact Admin.
                    </p>
                </form>
            </div>
        </div>
    )
}

const inputStyle = {
    display: 'block',
    width: '100%',
    padding: '0.75rem',
    borderRadius: '0.375rem',
    border: '1px solid #d4d4d8',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'border-color 0.15s ease-in-out',
    color: '#18181b'
}

const buttonStyle = {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '0.375rem',
    border: 'none',
    backgroundColor: '#18181b',
    color: 'white',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '0.5rem',
    transition: 'background-color 0.15s ease-in-out'
}

