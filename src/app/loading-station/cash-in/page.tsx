'use client'
import FormField from "@/components/formField"
import { useEffect, useState } from "react"
import Button from "@/components/button"
import gcashLoad from '@/assets/images/GcashLoad.png'
import Image from "next/image"
import { formatDate, formatMoney, removeDecimalPlaces } from "@/util/textUtil"
import BalanceBar from "@/components/balanceBar"
import Form from "@/components/form"
import { PATTERNS, TRAN_TYPE } from "@/classes/constants"
import QrCode from "@/components/qrCode"
import axios from "axios"
import { useRouter } from "next/navigation"
import { useApiData } from "@/app/context/apiContext"

const Load = () => {
    const router = useRouter()
    const [totalAmount, setTotalAmount] = useState('')
    const [loadTo, setLoadTo] = useState('')
    const [completeName, setCompleteName] = useState('-')
    const [amount, setAmount] = useState('')
    const [balance, setBalance] = useState('')
    const [email, setEmail] = useState('-')
    const [fee, setFee] = useState('')
    const [comment, setComment] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [qrData, setQrData] = useState('')
    const [showQr, setShowQr] = useState(false)
    const [convFee, setConvFee] = useState(0)
    const [comFee, setComFee] = useState(0)
    const [config, setConfig] = useState<{
        cashInConFeeFixPlayer: number,
        cashInConFeePercentage: number,
        cashInConFeeType: number,
        cashOutConFeeType: number,
        cashInCommissionFee: number,
        commissionFeePercentage: number,
        commissionFeeType: number
    }>({
        cashInConFeeFixPlayer: 0,
        cashInConFeePercentage: 0,
        cashInConFeeType: 0,
        cashOutConFeeType: 0,
        cashInCommissionFee: 0,
        commissionFeePercentage: 0,
        commissionFeeType: 0
    })

    const { data, loading, error } = useApiData();

    const getLoadStationConfig = async () => {
        await axios.get('/api/get-load-station-config')
            .then(response => {
                const responseData = response.data
                setConfig(responseData)
            })
            .catch((e) => {
            })
            .finally(() => {
            })
    }

    useEffect(() => {
        // getUserDetails()
        if (data) {
            getLoadStationConfig()
            setBalance(data.balance)
        }
    }, [data])



    const onHandleSubmit = async () => {
        setIsLoading(true)
        const date = new Date()
        const expireDate = new Date()
        expireDate.setHours(expireDate.getHours() + 2)

        const data = {
            trxAmount: removeDecimalPlaces(totalAmount),
            timeStart: formatDate(date.toISOString()),
            timeExpire: formatDate(expireDate.toISOString()),
            accountNumber: loadTo,
            convenienceFee: convFee,
            commissionFee: comFee,
            comment: comment,
            type: TRAN_TYPE.CASHIN

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
    }

    const searchPlayer = async (accountNumber: string) => {
        setIsLoading(true)
        await axios.get('/api/get-user', {
            params: {
                accountNumber
            }
        })
            .then((response) => {
                const responseData = response.data

                if (responseData.userName) {
                    setCompleteName(responseData.userName)
                } else {
                    setCompleteName('No user found!')
                    setLoadTo('')
                }

                if (responseData.email) {
                    setEmail(responseData.email)
                } else {
                    setEmail('-')
                }
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
                setIsLoading(false)
            })
    }

    const onAmountChange = (amount: string) => {

        const { cashInCommissionFee, cashInConFeeFixPlayer, cashInConFeePercentage, cashInConFeeType, commissionFeeType, commissionFeePercentage, } = config

        let _comFee, _convFee

        if (cashInConFeeType === 2) {
            _convFee = parseFloat(amount) * cashInConFeePercentage
        } else {
            _convFee = cashInConFeeFixPlayer
        }

        if (commissionFeeType === 2) {
            _comFee = parseFloat(amount) * commissionFeePercentage
        } else {
            _comFee = cashInCommissionFee
        }

        const calculateFee = _comFee + _convFee
        const calculateTotalAmount = Number(amount) + calculateFee

        setAmount(amount)
        setConvFee(_convFee)
        setComFee(_comFee)
        setFee(formatMoney(calculateFee.toString()))
        setTotalAmount(formatMoney(calculateTotalAmount.toString()))
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
                            <FormField name="loadTo" label="Load to" placeholder="Enter Load To" value={loadTo} onChange={(e) => { setLoadTo(e.target.value) }} customLabelClass="text-xs" required onBlur={(e) => {
                                searchPlayer(e.target.value)
                            }} />
                            <FormField name="completeName" label="Complete Name" value={completeName} customLabelClass="text-xs" readonly />
                            <FormField name="email" label="Email Address" value={email} customLabelClass="text-xs" type="email" readonly />
                            <FormField name="amount" label="Amount" placeholder="Enter amount" value={amount} onBlur={(e) => { onAmountChange(e.target.value) }} customLabelClass="text-xs" required type="number" pattern={PATTERNS.NUMBER} min={1} max={50000} errorMessage="Invalid Amount" />
                        </div>
                        <div className="flex flex-col p-4 gap-4 w-full">
                            <FormField name="fee" label="Fee" placeholder="Enter Fee" value={fee} customLabelClass="text-xs" readonly />
                            <FormField name="totalAmount" label="Total Amount" value={totalAmount} customLabelClass="text-xs" readonly />
                            <FormField name="comment" label="Comment" placeholder="Type your comment" value={comment} onChangeTextArea={(e) => { setComment(e.target.value) }} customLabelClass="text-xs" type="textarea" />
                            <Button onClick={onHandleSubmit} isLoading={isLoading} loadingText="Loading..." type={'submit'}>Submit</Button>
                        </div>
                    </Form>
                </div>
            </div>
        </div>
    )
}

export default Load