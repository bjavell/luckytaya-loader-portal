'use client'
import FormField from "@/components/formField"
import { useEffect, useState } from "react"
import Button from "@/components/button"
import gcashLoad from '@/assets/images/GcashLoad.png'
import Image from "next/image"
import { getCurrentSession } from "@/context/auth"
import { formatDate, formatMoney } from "@/util/textUtil"
import BalanceBar from "@/components/balanceBar"
import Form from "@/components/form"
import { PATTERNS } from "@/classes/constants"
import QrCode from "@/components/qrCode"
import axios from "axios"

const Active = () => {
    const [userId, setUserId] = useState('')
    const [loadTo, setLoadTo] = useState('')
    const [completeName, setCompleteName] = useState('')
    const [amount, setAmount] = useState('')
    const [balance, setBalance] = useState('')
    const [email, setEmail] = useState('')
    const [fee, setFee] = useState('')
    const [comment, setComment] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [qrData, setQrData] = useState('')
    const [showQr, setShowQr] = useState(false)

    useEffect(() => {
        const getSession = async () => {
            const session = await getCurrentSession()

            setBalance(formatMoney(session.balance))

        }
        getSession()
    }, [])


    const onHandleSubmit = async () => {
        setIsLoading(true)
        const date = new Date()
        const expireDate = new Date()
        expireDate.setHours(expireDate.getHours() + 2)

        const data = {
            trxAmount: `${(Number.parseFloat(amount)).toFixed(2)}`.replaceAll(",", "").replace(".", ""),
            timeStart: formatDate(date.toISOString()),
            timeExpire: formatDate(expireDate.toISOString())

        }

        await axios.post('/api/create-qr', data).finally(() => {

            setIsLoading(false)
        })

    }


    return (
        <div className="flex flex-col w-full gap-4">
            <BalanceBar title="Load Station" balance={balance} />
            <div className="flex flex-row gap-4">
                <div className="flex w-1/2 bg-[#005BAA] rounded-xl p-4">
                    {showQr ? <QrCode data={qrData} className='m-auto' /> : <Image src={gcashLoad} alt="gcash load background" className="m-auto" />}
                </div>
                <div className="flex w-1/2 bg-gray13 rounded-xl">
                    <Form className="flex flex-row gap-2 w-full" onSubmit={onHandleSubmit}>
                        <div className="flex flex-col p-4 gap-4 w-full">
                            <FormField name="loadTo" label="Load to" placeholder="Enter Load To" value={loadTo} onChange={(e) => { setLoadTo(e.target.value) }} customLabelClass="text-xs" required />
                            <FormField name="completeName" label="Complete Name" placeholder="Enter complete name" value={completeName} onChange={(e) => { setCompleteName(e.target.value) }} customLabelClass="text-xs" required />
                            <FormField name="amount" label="Amount" placeholder="Enter amount" value={amount} onChange={(e) => { setAmount(e.target.value) }} customLabelClass="text-xs" required />
                            <FormField name="email" label="Email Address" placeholder="example@gmail.com" value={email} onChange={(e) => { setEmail(e.target.value) }} customLabelClass="text-xs" type="email" pattern={PATTERNS.EMAIL} errorMessage='Input a valid email' required />
                        </div>
                        <div className="flex flex-col p-4 gap-4 w-full">
                            <FormField name="fee" label="Fee" placeholder="Enter Fee" value={fee} onChange={(e) => { setFee(e.target.value) }} customLabelClass="text-xs" required />
                            <FormField name="userId" label="User ID" placeholder="Enter User ID" value={userId} onChange={(e) => { setUserId(e.target.value) }} customLabelClass="text-xs" required />
                            <FormField name="comment" label="Comment" placeholder="Type your comment" value={comment} onChangeTextArea={(e) => { setComment(e.target.value) }} customLabelClass="text-xs" type="textarea" />
                            <Button onClick={onHandleSubmit} isLoading={isLoading} loadingText="Loading..." type={'submit'}>Submit</Button>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    )
}

export default Active