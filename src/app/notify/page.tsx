'use client'
import { FormEvent, useEffect, useState } from "react"
import gcashLoad from '@/assets/images/GcashLoad.png'
import Image from "next/image"
import { formatMoney } from "@/util/textUtil"
import BalanceBar from "@/components/balanceBar"
import axios from "axios"
import { useRouter } from "next/navigation"
import { useApiData } from "@/app/context/apiContext"
import LoadForm from "@/components/loadForm"
import FormField from "@/components/formField"

const Notify = () => {

    const [messageType, setMessageType] = useState('')

    return (
        <div className="flex flex-col w-1/3 gap-4">
            <div className="gap-2 flex flex-col">
                <label htmlFor="status" className="flex items-center">Message Type</label>
                <select id="status" className="rounded-xlg py-4 px-4 bg-semiBlack font-sans font-light text-[13px] tacking-[5%] text-white" value={messageType} onChange={(e) => setMessageType(e.target.value)}>
                    <option value="">Select Message Type</option>
                    <option value="0">Local Message</option>
                    <option value="1">Global Message</option>
                </select>
            </div>
            <FormField name={"message"} customLabelClass="text-xs" label="Message" required />
        </div>
    )
}

export default Notify