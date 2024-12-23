'use client'

import LoadingSpinner from "@/components/loadingSpinner"
import { localAxios } from "@/util/localAxiosUtil"
import { formatNumber } from "@/util/textUtil"
import axios from "axios"
import Link from "next/link"
import router from "next/router"
import { useEffect, useState } from "react"

const Home = () => {

    const [pendingKyc, setPendingKyc] = useState(0)
    const [isLoading, setIsLoading] = useState(false)

    const getRekycCount = async () => {
        try {
            setIsLoading(true)

            const response = await localAxios.get('/api/get-pending-kyc')
            setPendingKyc(response.data.count)

        } catch (e: any) {
            const errorMessages = e?.response?.data?.error
            if (errorMessages) {
                if (errorMessages['Unauthorized']) {
                    router.push('/login')
                }
            }

        } finally {
            setIsLoading(false)
        }

    }

    useEffect(() => {
        getRekycCount()
    }, [])

    return (
        <div className="flex flex-col gap-4">
            {isLoading ? <LoadingSpinner /> : null}
            <div className="text-bold text-2xl text-lightGreen">GOOD DAY, <br />E-BILLIARD ADMIN</div>


            <div className="text-bold text-2xl text-white gap-4 flex">
                <span>
                    Pending KYC:
                </span>
                <Link href={"/admin/user/manage/players?accountStatus=PENDING"} className="underline">{formatNumber(pendingKyc)}</Link>
            </div>
        </div>
    )
}

export default Home