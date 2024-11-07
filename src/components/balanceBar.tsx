import { NextPage } from "next"
import balanceSvg from '@/assets/images/Balance.svg'
import Image from "next/image"

const BalanceBar: NextPage<{ title: string, balance: string }> = (props) => {

    const { title, balance } = props
    return (
        <div className="flex justify-between bg-[#1F1F1F] rounded-xl p-3 text-[#C3C3C3] text-base items-center ">
            <div className="flex">{title}</div>
            <div className="flex gap-4 items-center">
                <span className="text-xs">
                    CURRENT BALANCE:
                </span>
                <Image src={balanceSvg} alt="balance" className="h-5 w-6" />
                <span className="flex text-semiYellow text-xl">{balance}</span></div>
        </div>
    )
}


export default BalanceBar