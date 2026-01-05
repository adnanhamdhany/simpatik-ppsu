import type { Metadata } from "next";
import "./globals.css";
import { cookies } from 'next/headers';
import Sidebar from './components/Sidebar';

export const metadata: Metadata = {
  title: {
    template: '%s | SIMPATIK PPSU',
    default: 'SIMPATIK PPSU',
  },
  description: "Sistem Informasi Manajemen dan Pelaporan Terintegrasi Kegiatan PPSU",
};

import { Poppins } from 'next/font/google';

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700'],
  subsets: ['latin'],
  display: 'swap',
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies()
  const sessionUser = cookieStore.get('session_user')
  let user = null

  if (sessionUser) {
    try {
      user = JSON.parse(sessionUser.value)
    } catch (e) {
      // ignore
    }
  }

  return (
    <html lang="en">
      <body className={`min-h-screen bg-cream ${poppins.className}`}>
        {user && <Sidebar user={user} />}
        <main className={`bg-cream transition-all duration-300 ${user ? 'lg:ml-[280px] pt-16 lg:pt-0' : ''}`}>
          {children}
        </main>
      </body>
    </html>
  );
}
