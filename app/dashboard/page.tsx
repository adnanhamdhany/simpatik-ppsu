
import { cookies } from 'next/headers'
import { countPetugas } from '@/supabase/services/user'
import { getLaporanStats } from '@/supabase/services/laporan'
import LogoutButton from '../components/LogoutButton'
import UserProfile from './UserProfile'

export default async function DashboardPage() {
    const cookieStore = await cookies()
    const sessionUser = cookieStore.get('session_user')
    let user: any = null

    if (sessionUser) {
        try {
            user = JSON.parse(sessionUser.value)
        } catch (e) {
            // ignore
        }
    }

    if (!user) {
        // Should allow middleware to handle, but just in case
        return <div style={{ padding: '2rem' }}>Please login.</div>
    }

    // Initialize data variables
    let totalPetugas = 0
    let stats = { today: 0, pending: 0, monthly: {} as Record<string, number> }

    // Only fetch stats if Admin
    if (user.role === 'admin') {
        const [tp, st] = await Promise.all([
            countPetugas(),
            getLaporanStats()
        ])
        totalPetugas = tp
        stats = st
    }

    return (
        <div style={{ padding: '2rem', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Dashboard</h1>
                <LogoutButton />
            </div>

            {/* ADMIN VIEW */}
            {user.role === 'admin' && (
                <>
                    {/* Cards Container */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

                        {/* Card 1: Total Petugas */}
                        <div style={cardStyle}>
                            <div>
                                <p style={{ color: '#52525b', fontSize: '0.875rem' }}>Total Petugas</p>
                                <p style={{ fontSize: '2rem', fontWeight: 'bold', lineHeight: '1' }}>{totalPetugas}</p>
                            </div>
                            <div style={{ fontSize: '2rem' }}>👤</div>
                        </div>

                        {/* Card 2: Laporan Masuk Hari Ini */}
                        <div style={cardStyle}>
                            <div>
                                <p style={{ color: '#52525b', fontSize: '0.875rem' }}>Laporan Masuk Hari Ini</p>
                                <p style={{ fontSize: '2rem', fontWeight: 'bold', lineHeight: '1' }}>{stats.today}</p>
                            </div>
                            <div style={{ fontSize: '2rem' }}>📄</div>
                        </div>

                        {/* Card 3: Laporan Belum Di Verifikasi */}
                        <div style={cardStyle}>
                            <div>
                                <p style={{ color: '#52525b', fontSize: '0.875rem' }}>Laporan Belum Di Verifikasi</p>
                                <p style={{ fontSize: '2rem', fontWeight: 'bold', lineHeight: '1' }}>{stats.pending}</p>
                            </div>
                            <div style={{ fontSize: '2rem' }}>☑️</div>
                        </div>

                    </div>

                    {/* Chart Section */}
                    <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '0.5rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                        <h2 style={{ fontSize: '1rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1f2937' }}>Grafik Total Laporan Petugas Perbulan</h2>

                        {/* Simple CSS Bar Chart Visualization */}
                        <div style={{ display: 'flex', alignItems: 'flex-end', height: '300px', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid #e5e7eb' }}>
                            {Object.keys(stats.monthly).length > 0 ? (
                                Object.entries(stats.monthly).map(([month, count]) => (
                                    <div key={month} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                                        <div style={{
                                            width: '100%',
                                            maxWidth: '50px',
                                            height: `${Math.min(count * 20, 250)}px`, // Dynamic height scale
                                            backgroundColor: '#ef4444',
                                            borderRadius: '4px 4px 0 0',
                                            transition: 'height 0.3s ease'
                                        }}></div>
                                        <span style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#6b7280' }}>{month}</span>
                                        <span style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>{count}</span>
                                    </div>
                                ))
                            ) : (
                                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#9ca3af' }}>
                                    No data available for chart
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}

            {/* USER PROFILE VIEW (Koordinator & Petugas) */}
            {(user.role === 'koordinator' || user.role === 'petugas') && (
                <UserProfile user={user} />
            )}
        </div>
    )
}

const cardStyle = {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
}
