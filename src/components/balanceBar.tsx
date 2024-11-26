import { NextPage } from "next"
import balanceSvg from '@/assets/images/Balance.svg'
import Image from "next/image"
import { formatMoney } from "@/util/textUtil"
import { ReactNode } from "react"



const BalanceBar: NextPage<{ rigthElement: ReactNode, balance: string }> = (props) => {

    const { rigthElement: title, balance } = props
    return (
        <div className="grid grid-cols-12 gap-4 bg-[#1F1F1F] rounded-xl p-3 text-[#C3C3C3] text-base items-center text-sm lg:text-base ">
            <div className="flex col-span-12 lg:col-span-10">{title}</div>
            <div className="flex gap-4 items-center lg:justify-end col-span-12 lg:col-span-2">
                <span className="text-xs">
                    CURRENT BALANCE:
                </span>
                <Image src={balanceSvg} alt="balance" className="h-5 w-6 hidden lg:block" />
                <span className="flex text-semiYellow text-sm lg:text-xl">{formatMoney(balance)}</span></div>
        </div>
    )
}


export default BalanceBar