'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function ApproveButton({ id, isApproved }: { id: string, isApproved: boolean }) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)

    const handleApprove = async () => {
        if (!confirm('Are you sure you want to approve this report?')) return

        setLoading(true)
        try {
            const res = await fetch('/api/laporan/approve', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to approve')
            }

            router.refresh()
        } catch (error: any) {
            alert(error.message)
        } finally {
            setLoading(false)
        }
    }

    if (isApproved) {
        return (
            <span className="block w-full px-3 py-1.5 bg-zinc-100 text-zinc-400 rounded-lg text-[11px] font-black uppercase tracking-widest text-center border border-zinc-200">
                Disetujui
            </span>
        )
    }

    return (
        <button
            onClick={handleApprove}
            disabled={loading}
            className="block w-full px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-[11px] font-black uppercase tracking-widest hover:bg-green-200 transition disabled:opacity-70 disabled:cursor-not-allowed border border-green-200 cursor-pointer"
        >
            {loading ? 'Processing...' : 'Setujui'}
        </button>
    )
}
