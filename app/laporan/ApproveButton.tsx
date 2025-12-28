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
            <span style={{
                padding: '0.25rem 0.5rem',
                backgroundColor: '#dcfce7',
                color: '#166534',
                borderRadius: '0.25rem',
                fontSize: '0.75rem',
                fontWeight: 'bold',
                display: 'inline-block'
            }}>
                Approved
            </span>
        )
    }

    return (
        <button
            onClick={handleApprove}
            disabled={loading}
            style={{
                padding: '0.25rem 0.75rem',
                backgroundColor: '#2563eb',
                color: 'white',
                border: 'none',
                borderRadius: '0.25rem',
                fontSize: '0.75rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
            }}
        >
            {loading ? 'Processing...' : 'Approve'}
        </button>
    )
}
