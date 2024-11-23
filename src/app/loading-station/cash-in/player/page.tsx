'use client'
import { useEffect, useState } from "react"
import gcashLoad from '@/assets/images/GcashLoad.png'
import Image from "next/image"
import { formatMoney } from "@/util/textUtil"
import BalanceBar from "@/components/balanceBar"
import axios from "axios"
import { useRouter } from "next/navigation"
import { useApiData } from "@/app/context/apiContext"
import LoadForm from "@/components/loadForm"
import ConfirmationModal from "@/components/confirmationModal"

const PlayerCashin = () => {
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
    const [convFee, setConvFee] = useState(0)
    const [comFee, setComFee] = useState(0)
    const [index, setIndex] = useState(0)
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

    const { data, reload, setReload } = useApiData();
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

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
        if (reload) {
            setLoadTo('')
            setLoadTo('')
            setAmount('')
            setConvFee(0)
            setComFee(0)
            setFee('')
            setTotalAmount('')
            setCompleteName('-')
            setEmail('-')
            setComment('')
            setIndex(index + 1)
        }
    }, [data, reload])



    const onHandleSubmit = async () => {
        setIsLoading(true)
        try {
            const response = await axios.post('/api/cashin', {
                amount: parseFloat(amount),
                convFee,
                comFee,
                toAccountNumber: loadTo
            })
            setReload(true)

            setIsAlertModalOpen(true)
            setAlertMessage(response.data.message)


        } catch (e: any) {
            const errorMessages = e.response.data.error

            if (errorMessages) {
                if (errorMessages['Bad request']) {
                    setAlertMessage(errorMessages['Bad request'][0])
                }
            } else {

                setAlertMessage('Oops! an error occured')
            }

            setIsAlertModalOpen(true)
        } finally {
            setIsLoading(false)
        }
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


    const onCancel = () => {
        setIsConfirmModalOpen(false)
    }

    const onConfirm = () => {
        setIsConfirmModalOpen(false)
        onHandleSubmit()
    }

    const toggelConfirmationModal = () => {
        setIsConfirmModalOpen(!isConfirmModalOpen)
    }

    return (
        <div className="flex flex-col w-full gap-4">
            <ConfirmationModal
                isOpen={isAlertModalOpen}
                onConfirm={() => setIsAlertModalOpen(false)}
                isOkOnly={true}
                message={alertMessage}
            ></ConfirmationModal>
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onCancel={onCancel}
                onConfirm={onConfirm}
                message="Proceed with the transaction?"
            ></ConfirmationModal>
            <BalanceBar title="Player Cash-In" balance={balance} />
            <div className="flex flex-row gap-4">
                <div className="flex w-1/2 bg-[#005BAA] rounded-xl p-4">
                    <Image src={gcashLoad} alt="gcash load background" className="m-auto" />
                </div>
                <LoadForm
                    key={`load-form-${index}`}
                    loadTo={{
                        value: loadTo,
                        onChange: setLoadTo,
                        onBlur: (val: string) => {
                            searchPlayer(val)
                        },
                        isReadOnly: false
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
                    onHandleSubmit={toggelConfirmationModal}
                />
            </div>
        </div>
    )
}

export default PlayerCashin