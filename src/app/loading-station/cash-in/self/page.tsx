'use client'

import { FormEvent, useEffect, useState } from "react"
import gcashLoad from '@/assets/images/GcashLoad.png'
import Image from "next/image"
import { formatDate, formatMoney, removeDecimalPlaces } from "@/util/textUtil"
import BalanceBar from "@/components/balanceBar"
import { QR_TRANSACTION_STATUS, TRAN_TYPE } from "@/classes/constants"
import QrCode from "@/components/qrCode"
import axios from "axios"
import { useRouter } from "next/navigation"
import { useApiData } from "@/app/context/apiContext"
import LoadForm from "@/components/loadForm"

const SelfCashin = () => {
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

    const { data, setReload } = useApiData();

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
        if (data) {
            getLoadStationConfig()
            setBalance(data.balance)
            setLoadTo(data.accountNumber)
            setCompleteName(`${data.fistname} ${data.lastname}`)
            setEmail(data.email)
        }
    }, [data])

    const onHandleSubmit = async (e: FormEvent | MouseEvent) => {
        e.preventDefault()
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

    const onAmountChange = (amount: string) => {

        const { cashInConFeeFixPlayer, cashInConFeePercentage, cashInConFeeType } = config

        let _convFee

        if (cashInConFeeType === 2) {
            _convFee = parseFloat(amount) * cashInConFeePercentage
        } else {
            _convFee = cashInConFeeFixPlayer
        }

        const calculateFee = _convFee
        const calculateTotalAmount = Number(amount) + calculateFee

        setAmount(amount)
        setConvFee(_convFee)
        setComFee(0)
        setFee(formatMoney(calculateFee.toString()))
        setTotalAmount(formatMoney(calculateTotalAmount.toString()))
    }


    return (
        <div className="flex flex-col w-full gap-4">
            <BalanceBar title="Self Cash-In" balance={balance} />
            <div className="flex flex-row gap-4">
                <div className="flex w-1/2 bg-[#005BAA] rounded-xl p-4">
                    {showQr ? <QrCode data={qrData} className='m-auto' /> : <Image src={gcashLoad} alt="gcash load background" className="m-auto" />}
                </div>
                <LoadForm
                    loadTo={{
                        value: loadTo,
                        isReadOnly: true
                    }}
                    completeName={completeName}
                    email={email}
                    amount={{
                        value: amount,
                        onBlur: (val: string) => {
                            onAmountChange(val)
                        }
                    }}
                    fee={fee}
                    totalAmount={totalAmount}
                    comment={{
                        value: comment,
                        onChage: setComment
                    }}
                    isLoading={isLoading}
                    onHandleSubmit={onHandleSubmit}

                />
            </div>
        </div>
    )
}

export default SelfCashin