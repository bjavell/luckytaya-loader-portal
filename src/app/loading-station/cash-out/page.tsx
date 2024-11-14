'use client'
import FormField from "@/components/formField"
import Button from "@/components/button"
import { useEffect, useState } from "react"
import { formatDate, removeDecimalPlaces } from "@/util/textUtil"
import BalanceBar from "@/components/balanceBar"
import axios from "axios"
import { useRouter } from "next/navigation"
import { useApiData } from "@/app/context/apiContext"
import Form from "@/components/form"
import { TRAN_TYPE } from "@/classes/constants"
import QrCode from "@/components/qrCode"
import Image from "next/image"

const CashOut = () => {
    const router = useRouter()
    const [amount, setAmount] = useState('')
    const [balance, setBalance] = useState('')
    const [comment, setComment] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [qrData, setQrData] = useState('')
    const [showQr, setShowQr] = useState(false)

    const { data, loading, error } = useApiData();

    useEffect(() => {
        if (data) {
            setBalance(data.balance)
        }
    }, [data])


    const onHandleSubmit = async () => {
        setIsLoading(true)
        const date = new Date()
        const expireDate = new Date()
        expireDate.setHours(expireDate.getHours() + 2)

        const data = {
            trxAmount: removeDecimalPlaces(amount),
            timeStart: formatDate(date.toISOString()),
            timeExpire: formatDate(expireDate.toISOString()),
            type: TRAN_TYPE.CASHOUT,
            comment
        }

        await axios.post('/api/create-qr', data)
            .then((response) => {
                setQrData(response.data.codeUrl)
                setShowQr(true)
            })
            .catch((e) => {
                const errorMessages = e.response.data.error
                if (errorMessages) {
                    if (errorMessages['Unauthorized']) {
                        router.push('/login')
                    }
                }
                setShowQr(false)
                setQrData('')
            })
            .finally(() => {
                setIsLoading(false)
            })
        setIsLoading(false)

    }

    return (
        <div className="flex flex-col w-full gap-4">
            <BalanceBar title="Cash-Out" balance={balance} />
            <div className="flex flex-row gap-4">
                <div className="flex w-2/3 bg-cursedBlack rounded-xl">
                    {showQr ? <QrCode data={qrData} className='m-auto' /> : ''}
                </div>
                <div className="flex w-1/3 bg-gray13 rounded-xl">
                    <Form className="flex flex-col gap-4 p-4 w-full" onSubmit={onHandleSubmit}>
                        <FormField name="amount" label="Amount" value={amount} onChange={(e) => { setAmount(e.target.value) }} customLabelClass="text-xs" />
                        <FormField name="comment" label="Comment" value={comment} onChangeTextArea={(e) => { setComment(e.target.value) }} customLabelClass="text-xs" type="textarea" />
                        <Button onClick={onHandleSubmit} isLoading={isLoading} loadingText="Loading..." type="submit">Submit</Button>
                    </Form>
                </div>
            </div>
        </div>

    )
}

export default CashOut