'use client'
import FormField from "@/components/formField"
import Button from "@/components/button"
import { useEffect, useState } from "react"
import { getCurrentSession } from "@/context/auth"
import { formatMoney } from "@/util/textUtil"
import BalanceBar from "@/components/balanceBar"
import axios from "axios"
import { useRouter } from "next/navigation"

const CashOut = () => {
    const router = useRouter()
    const [amount, setAmount] = useState('')
    const [balance, setBalance] = useState('')
    const [comment, setComment] = useState('')
    const [isLoading, setIsLoading] = useState(false)


    const getUserDetails = async () => {
        await axios.get('/api/get-user-details')
            .then(response => {
                setBalance(`${response.data?.balance}`)
            })
            .catch((e) => {
                const errorMessages = e.response.data.error
                if (errorMessages) {
                    if (errorMessages['Unauthorized']) {
                        router.push('/login')
                    }
                }
            })
            .finally(() => {
            })
    }

    useEffect(() => {
        getUserDetails()
    }, [])

    return (
        <div className="flex flex-col w-full gap-4">
            <BalanceBar title="Cash-Out" balance={balance} />
            <div className="flex flex-row gap-4">
                <div className="flex w-2/3 bg-white rounded-xl"></div>
                <div className="flex w-1/3 bg-gray13 rounded-xl">
                    <div className="flex flex-col gap-4 p-4 w-full">
                        <FormField name="amount" label="Amount" value={amount} onChange={(e) => { setAmount(e.target.value) }} customLabelClass="text-xs" />
                        <FormField name="comment" label="Comment" value={comment} onChangeTextArea={(e) => { setComment(e.target.value) }} customLabelClass="text-xs" type="textarea" />
                        <Button onClick={() => alert('123123123')} isLoading={isLoading} loadingText="Loading..." type="submit">Submit</Button>
                    </div>
                </div>
            </div>
        </div>

    )
}

export default CashOut