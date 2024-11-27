'use client'

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import BalanceBar from "@/components/balanceBar"
import { useApiData } from "@/app/context/apiContext"
import Image from "next/image"
import axios from "axios"
import UserIco from '@/assets/images/UserIco.svg'
import AgentIco from '@/assets/images/AgentIco.svg'

const Home = () => {
    const router = useRouter()
    const [balance, setBalance] = useState('')
    const { data, setReload } = useApiData();
    const [directMember, setDirectMember] = useState([])
    const [indirectMember, setIndirectMember] = useState([])


    const getMembers = async () => {
        await axios.get('/api/get-user-members')
            .then(response => {
                const responseData = response.data
                setDirectMember(responseData.direct)
                setIndirectMember(responseData.indirect)
            })
            .catch((e) => {
            })
            .finally(() => {
            })
    }
    useEffect(() => {
        if (data) {
            setBalance(data.balance)
        }
        getMembers()
    }, [data])


    const rightElement = () => {

        return <div className="flex gap-4 flex-row">
            <div className="flex bg-codGray p-4 rounded text-neutralGray gap-2 items-center">
                <Image src={AgentIco} alt="" /> <span className="text-semiYellow font-semibold text-2xl">{directMember.length}</span> Total Agents
            </div>
            <div className="flex bg-codGray p-4 rounded text-neutralGray gap-2 items-center">
                <Image src={UserIco} alt="" /> <span className="text-semiYellow font-semibold text-2xl">{indirectMember.length }</span>Total Players
            </div>
        </div>
    }

    return (
        <div className="flex flex-col w-full gap-4">
            <BalanceBar rigthElement={rightElement()} balance={balance} />
            <div className="text-bold text-2xl text-lightGreen">GOOD DAY, <br />E-BILLIARD AGENTS</div>
        </div>
    )
}

export default Home