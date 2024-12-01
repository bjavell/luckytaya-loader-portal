'use client'
import { useEffect, useState } from "react"
import gcashLoad from '@/assets/images/GcashLoad.png'
import Image from "next/image"
import { formatDate, formatDynamicNumber, formatMoney, removeDecimalPlaces } from "@/util/textUtil"
import BalanceBar from "@/components/balanceBar"
import axios from "axios"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { useApiData } from "@/app/context/apiContext"
import LoadForm from "@/components/loadForm"
import ConfirmationModal from "@/components/confirmationModal"
import { TRAN_TYPE } from "@/classes/constants"
import QrCode from "@/components/qrCode"
import Modal from "@/components/modal"
import LoadingSpinner from "@/components/loadingSpinner"
import Button from "@/components/button"

const PlayerCashin = () => {
    const router = useRouter()
    const params = useParams()

    const cashinType = params?.type
    const accountNumber = useSearchParams()?.get('accountNumber')
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
    const [isLoadToReadOnly, setIsLoadToReadOnly] = useState(false)
    const [balanceBarTitle, setBalanceBarTitle] = useState('')
    const [qrData, setQrData] = useState('')
    const [showQr, setShowQr] = useState(false)

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

    const onHandleSubmit = async () => {
        setIsLoading(true)
        try {
            let response
            if (cashinType === 'self') {
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

                response = await axios.post('/api/create-qr', data)
                setQrData(response.data.codeUrl)
                setShowQr(true)
                setAlertMessage('QR successfully generated!')
            } else {
                response = await axios.post('/api/cashin', {
                    amount: parseFloat(amount),
                    convFee,
                    comFee,
                    toAccountNumber: loadTo.replaceAll('-', '')
                })
                setReload(true)
                setAlertMessage(response.data.message)
            }

            setIsAlertModalOpen(true)


        } catch (e: any) {
            const errorMessages = e.response.data.error

            if (errorMessages) {
                if (errorMessages['Bad request']) {
                    setAlertMessage(errorMessages['Bad request'][0])
                }
            } else {

                setAlertMessage('Oops! an error occured')
            }
            setShowQr(false)
            setQrData('')
            setIsAlertModalOpen(true)
        } finally {
            setIsLoading(false)
        }
    }

    const searchPlayer = async (accountNumber: string) => {
        setIsLoading(true)
        await axios.get('/api/get-user', {
            params: {
                accountNumber: accountNumber.replaceAll('-', '')
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

    const searchAgent = async (accountNumber: string) => {
        setIsLoading(true)
        await axios.get('/api/get-user-members', {
            params: {
                type: 'agents'
            }
        })
            .then((response) => {
                const responseData = response.data

                const filteredAgent = responseData.direct.filter((e: any) => {
                    return Number(e.accountNumber) === Number(accountNumber.replaceAll('-', ''))
                })

                if (filteredAgent.length > 0) {
                    setCompleteName(`${filteredAgent[0].fistname} ${filteredAgent[0].lastname}`)
                    setEmail(filteredAgent[0].email)
                } else {
                    setCompleteName('No user found!')
                    setEmail('-')
                }
            })
            .catch((e) => {
                const errorMessages = e?.response?.data?.error
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

    const formatLoadTo = (val: string) => {
        setLoadTo(formatDynamicNumber(val))
    }


    useEffect(() => {
        if (data) {
            getLoadStationConfig()
            setBalance(data.balance)
            if (cashinType === 'self') {
                formatLoadTo(data.accountNumber)
                setCompleteName(`${data.fistname} ${data.lastname}`)
                setEmail(data.email)
            }
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
        switch (cashinType) {
            case 'player':
                if (accountNumber) {
                    setIsLoadToReadOnly(true)
                    formatLoadTo(accountNumber)
                    searchPlayer(accountNumber)
                }
                setBalanceBarTitle('Player Cash-In Menu')
                break;
            case 'self':
                setIsLoadToReadOnly(true)
                setBalanceBarTitle('Self Cash-In Menu')
                break;
            case 'agent':
                if (accountNumber) {
                    setIsLoadToReadOnly(true)
                    formatLoadTo(accountNumber)
                    searchAgent(accountNumber)
                }
                setBalanceBarTitle('Agent Cash-In Menu')
                break;
            case 'masterAgent':
                if (accountNumber) {
                    setIsLoadToReadOnly(true)
                    formatLoadTo(accountNumber)
                    searchAgent(accountNumber)
                }
                setBalanceBarTitle('Master Agent Cash-In Menu')
                break;
            default:
                setBalanceBarTitle('Cash-In Menu')
        }

    }, [data, reload])

    return (
        <div className="flex flex-col w-full gap-4">
            {cashinType === 'self' ?
                <Modal
                    isOpen={isAlertModalOpen}
                    // onConfirm={() => setIsAlertModalOpen(false)}
                    // isOkOnly={true}
                    onClose={() => setIsAlertModalOpen(false)}
                    size="small"
                >
                    <div className="items-center flex flex-col justify-center gap-4">
                        <h1>Scan QR Code</h1>
                        <QrCode data={qrData} className='m-auto' />
                        <Button onClick={() => setIsAlertModalOpen(false)} type={"button"} >Close</Button>
                    </div>
                </Modal>
                :
                <ConfirmationModal
                    isOpen={isAlertModalOpen}
                    onConfirm={() => setIsAlertModalOpen(false)}
                    isOkOnly={true}
                    onCancel={() => { }}
                    message={alertMessage}
                ></ConfirmationModal>
            }
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onCancel={onCancel}
                onConfirm={onConfirm}
                message="Proceed with the transaction?"
            ></ConfirmationModal>
            <BalanceBar rigthElement={balanceBarTitle} balance={balance} />
            <div className="flex flex-row gap-4">
                {/* <div className="flex hidden lg:block lg:w-1/2 bg-[#005BAA] rounded-xl p-4">
                    {showQr ? <QrCode data={qrData} className='m-auto' /> : <Image src={gcashLoad} alt="gcash load background" className="m-auto" />}
                </div> */}
                {isLoading ? <LoadingSpinner /> :
                    <LoadForm
                        key={`load-form-${index}`}
                        loadTo={{
                            value: loadTo,
                            onChange: formatLoadTo,
                            onBlur: (val: string) => {
                                if (cashinType === 'player') {
                                    searchPlayer(val)
                                } else {
                                    searchAgent(val)
                                }
                            },
                            isReadOnly: isLoadToReadOnly
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
                }
            </div>
        </div>
    )
}

export default PlayerCashin