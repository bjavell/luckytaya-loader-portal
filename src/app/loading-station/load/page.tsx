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
    const [amountToBeCredited, setAmountToBeCredited] = useState('')
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
            trxAmount: removeDecimalPlaces(amount),
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
        await axios.get('/api/get-player', {
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

        if (cashInConFeeType === 1) {
            _convFee = parseFloat(amount) * cashInConFeePercentage
        } else {
            _convFee = cashInConFeeFixPlayer
        }

        if (commissionFeeType === 1) {
            _comFee = parseFloat(amount) * commissionFeePercentage
        } else {
            _comFee = cashInCommissionFee
        }

        const calculateFee = comFee + convFee
        const calculateAmountToBeCredited = Number(amount) - calculateFee

        setAmount(amount)
        setConvFee(_convFee)
        setComFee(_comFee)
        setFee(formatMoney(calculateFee.toString()))
        setAmountToBeCredited(formatMoney(calculateAmountToBeCredited.toString()))
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
                            <FormField name="email" label="Email Address" placeholder="example@gmail.com" value={email} onChange={(e) => { setEmail(e.target.value) }} customLabelClass="text-xs" type="email" pattern={PATTERNS.EMAIL} errorMessage='Input a valid email' required />
                            <FormField name="amount" label="Amount" placeholder="Enter amount" value={amount} onBlur={(e) => { onAmountChange(e.target.value) }} customLabelClass="text-xs" required type="number" pattern={PATTERNS.NUMBER} />
                        </div>
                        <div className="flex flex-col p-4 gap-4 w-full">
                            <FormField name="fee" label="Fee" placeholder="Enter Fee" value={fee} customLabelClass="text-xs" readonly errorMessage='Invalid Amount' />
                            <FormField name="amountToBeCredited" label="Amount to be credited" value={amountToBeCredited} customLabelClass="text-xs" readonly errorMessage='Invalid Amount' />
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