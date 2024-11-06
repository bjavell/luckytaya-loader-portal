'use client'
import FormField from "@/components/formField"
import Button from "@/components/button"
import { useEffect, useState } from "react"
import { getCurrentSession } from "@/context/auth"
import { formatMoney } from "@/util/textUtil"
import BalanceBar from "@/components/balanceBar"

const Active = () => {
    const [userInput, setUserInput] = useState('')
    const [balance, setBalance] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const getSession = async () => {
            const session = await getCurrentSession()

            setBalance(formatMoney(session.balance))

        }
        getSession()
    }, [])

    return (
        <div className="flex flex-col w-full gap-4">
            <BalanceBar title="Cash-Out" balance={balance} />
            <div className="flex flex-row gap-4">
                <div className="flex w-1/2 bg-white rounded-xl"></div>
                <div className="flex w-1/2 bg-gray13 rounded-xl">
                    <div className="flex flex-col gap-4 p-4 w-full">
                        <FormField name="userId" label="User ID" placeholder="Enter User ID" value={userInput} onChange={(e) => { setUserInput(e.target.value) }} customLabelClass="text-xs" />
                        <FormField name="userId" label="User ID" placeholder="Enter User ID" value={userInput} onChange={(e) => { setUserInput(e.target.value) }} customLabelClass="text-xs" />
                        <Button onClick={() => alert('123123123')} isLoading={isLoading} loadingText="Loading..." type="submit">Submit</Button>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default Active