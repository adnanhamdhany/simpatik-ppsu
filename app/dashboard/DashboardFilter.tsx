'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function DashboardFilter() {
    const router = useRouter()
    const searchParams = useSearchParams()

    const [month, setMonth] = useState(searchParams.get('month') || (new Date().getMonth() + 1).toString())
    const [week, setWeek] = useState(searchParams.get('week') || '')
    const [year, setYear] = useState(searchParams.get('year') || new Date().getFullYear().toString())

    const months = [
        { val: '1', label: 'Januari' },
        { val: '2', label: 'Februari' },
        { val: '3', label: 'Maret' },
        { val: '4', label: 'April' },
        { val: '5', label: 'Mei' },
        { val: '6', label: 'Juni' },
        { val: '7', label: 'Juli' },
        { val: '8', label: 'Agustus' },
        { val: '9', label: 'September' },
        { val: '10', label: 'Oktober' },
        { val: '11', label: 'November' },
        { val: '12', label: 'Desember' },
    ]

    const weeks = ['1', '2', '3', '4', '5']
    const years = [
        new Date().getFullYear().toString(),
        (new Date().getFullYear() - 1).toString(),
        (new Date().getFullYear() - 2).toString(),
    ]

    const handleApply = () => {
        const params = new URLSearchParams()
        if (month) params.set('month', month)
        if (week) params.set('week', week)
        if (year) params.set('year', year)

        router.push(`/dashboard?${params.toString()}`)
    }

    return (
        <div className="flex flex-col sm:flex-row items-center gap-2 flex-wrap">
            <select
                value={month}
                onChange={(e) => setMonth(e.target.value)}
                className="p-2.5 border border-zinc-200 rounded-xl text-[11px] font-bold outline-none focus:ring-4 focus:ring-orange-light/10 bg-white shadow-sm transition-all uppercase tracking-wider"
            >
                {months.map(m => <option key={m.val} value={m.val}>{m.label}</option>)}
            </select>

            <select
                value={week}
                onChange={(e) => setWeek(e.target.value)}
                className="p-2.5 border border-zinc-200 rounded-xl text-[11px] font-bold outline-none focus:ring-4 focus:ring-orange-light/10 bg-white shadow-sm transition-all uppercase tracking-wider"
            >
                <option value="">Semua Minggu</option>
                {weeks.map(w => <option key={w} value={w}>Minggu {w}</option>)}
            </select>

            <select
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="p-2.5 border border-zinc-200 rounded-xl text-[11px] font-bold outline-none focus:ring-4 focus:ring-orange-light/10 bg-white shadow-sm transition-all uppercase tracking-wider"
            >
                {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>

            <button
                onClick={handleApply}
                className="px-4 py-2.5 bg-zinc-900 text-white rounded-xl text-[11px] font-black uppercase tracking-widest hover:bg-zinc-800 transition shadow-lg shadow-zinc-200 flex-shrink-0"
            >
                Filter
            </button>
        </div>
    )
}
