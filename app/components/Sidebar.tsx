import React from 'react'
import Link from 'next/link'

interface User {
    username: string
    name: string
    role: string
}

export default function Sidebar({ user }: { user: User }) {
    return (
        <div style={{
            width: '250px',
            height: '100vh',
            backgroundColor: '#f4f4f5',
            borderRight: '1px solid #e4e4e7',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
        }}>
            <div style={{ marginBottom: '1rem', borderBottom: '1px solid #d4d4d8', paddingBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>PPSU App</h2>
                <p style={{ fontSize: '0.875rem', color: '#52525b' }}>{user.name}</p>
                <div style={{ fontSize: '0.75rem', color: '#71717a', textTransform: 'uppercase', marginTop: '0.2rem' }}>
                    {user.role}
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link href="/dashboard" style={unifiedStyle}>
                    <span>📊</span>
                    <span>Dashboard</span>
                </Link>

                {user.role === 'admin' && (
                    <Link href="/datauser" style={unifiedStyle}>
                        <span>👥</span>
                        <span>Data User</span>
                    </Link>
                )}

                {(user.role === 'admin' || user.role === 'koordinator') && (
                    <Link href="/laporan" style={unifiedStyle}>
                        <span>📄</span>
                        <span>Laporan</span>
                    </Link>
                )}

                {/* All roles can see Absensi (Petugas, Koordinator, Admin) */}
                <Link href="/absensi" style={unifiedStyle}>
                    <span>📸</span>
                    <span>Absensi</span>
                </Link>
            </div>
        </div>
    )
}

const unifiedStyle = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    width: '100%',
    padding: '0.75rem 1rem',
    backgroundColor: 'white',
    border: '1px solid #d4d4d8',
    borderRadius: '0.375rem',
    color: '#18181b', // Dark text matches buttons
    textDecoration: 'none',
    transition: 'background-color 0.15s ease',
    fontWeight: '500',
    fontSize: '0.875rem',
    cursor: 'pointer'
}

