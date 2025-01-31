'use client'

import CashinHistory from "@/components/cashinHistory"
import TransactionHistory from "@/components/transactionHistory"
import { useParams } from "next/navigation"

const Reports = () => {
    const params = useParams()
    const type = params?.type

    if (type === 'all')
        return <TransactionHistory reportType="finance" />
    else
        return <CashinHistory />
}

export default Reports
