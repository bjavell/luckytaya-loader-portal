'use client'

import Link from "next/link"

const Home = () => {
    return (
        <div className="flex flex-col gap-4">
            <div className="text-bold text-2xl text-lightGreen">GOOD DAY, <br />E-BILLIARD ADMIN</div>


            <div className="text-bold text-2xl text-white gap-4 flex">
                <span>
                    Pending KYC:
                </span>
                <Link href={"/admin/user/manage/players?accountStatus=PENDING"} className="underline">0</Link>
            </div>
        </div>
    )
}

export default Home