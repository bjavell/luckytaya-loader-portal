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
import { BANK_DETAILS, PATTERNS, TRAN_TYPE } from "@/classes/constants"
import QrCode from "@/components/qrCode"

const CashOut = () => {
    const router = useRouter()
    const [amount, setAmount] = useState('')
    const [balance, setBalance] = useState('')
    const [comment, setComment] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [qrData, setQrData] = useState('')
    const [showQr, setShowQr] = useState(false)
    const [bank, setBank] = useState('')
    const [accountName, setAccountName] = useState('')
    const [accountNumber, setAccountNumber] = useState('')

    const { data, loading, error } = useApiData();


    // const getBankList = async() => {
    //     await axios.get('/api/get-bank-lists')
    // }

    useEffect(() => {
        if (data) {
            setBalance(data.balance)
        }

        // getBankList()
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
            comment,
            accountName,
            accountNumber
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
            <BalanceBar rigthElement="Cash-Out" balance={balance} />
            <div className="flex flex-row gap-4">
                <div className="flex w-2/3 bg-cursedBlack rounded-xl">
                    {showQr ? <QrCode data={qrData} className='m-auto' /> : ''}
                </div>
                <div className="flex w-1/3 bg-gray13 rounded-xl">
                    <Form className="flex flex-col gap-4 p-4 w-full" onSubmit={onHandleSubmit}>
                        <FormField name="amount" label="Amount" value={amount} onChange={(e) => { setAmount(e.target.value) }} customLabelClass="text-xs" type="number" pattern={PATTERNS.NUMBER} min={1} max={1000000} errorMessage="Invalid Amount" required />
                        <label htmlFor="bankList" className="flex items-center text-xs text-white font-sans font-light text-nowrap">Banks</label>
                        <select id="bankList" className="rounded-xlg py-4 px-4 bg-semiBlack font-sans font-light tacking-[5%] text-white" value={bank} onChange={(e) => setBank(e.target.value)} required>
                            <option value=''>Select Bank</option>
                            {BANK_DETAILS.map(bank => {
                                return <option key={bank.bankCode} value={bank.bankCode}>{bank.bankName}</option>
                            })}
                        </select>
                        <FormField name="accountName" label="Account Name" placeholder="Enter Account Name" value={accountName} onChange={(e) => { setAccountName(e.target.value) }} customLabelClass="text-xs" required />
                        <FormField name="accountNumber" label="Account Number" placeholder="Enter Account Number" value={accountNumber} onChange={(e) => { setAccountNumber(e.target.value) }} customLabelClass="text-xs" required />
                        <FormField name="comment" label="Comment" value={comment} onChangeTextArea={(e) => { setComment(e.target.value) }} customLabelClass="text-xs" type="textarea" />
                        <Button onClick={onHandleSubmit} isLoading={isLoading} loadingText="Loading..." type="submit">Submit</Button>
                    </Form>
                </div>
            </div>
        </div>

    )
}

export default CashOut