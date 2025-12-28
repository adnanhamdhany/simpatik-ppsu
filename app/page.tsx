import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'
import LogoutButton from './components/LogoutButton'

export default async function Home() {
  const cookieStore = await cookies()
  const sessionUser = cookieStore.get('session_user')
  let user = null

  if (sessionUser) {
    try {
      user = JSON.parse(sessionUser.value)
    } catch (e) {
      console.error('Failed to parse user session', e)
    }
  }

  // Redirect All Logged In Users to Dashboard
  if (user) {
    redirect('/dashboard')
  }

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Selamat datang {user?.name || 'User'}</h1>

      {user && (
        <div style={{ margin: '1rem 0', padding: '1rem', border: '1px solid #ccc', borderRadius: '8px' }}>
          <p><strong>Username:</strong> {user.username}</p>
          <p><strong>Nama:</strong> {user.name}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </div>
      )}

      <LogoutButton />
    </div>
  )
}
