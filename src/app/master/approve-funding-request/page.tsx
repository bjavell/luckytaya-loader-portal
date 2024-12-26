'use client'
import { useEffect, useState } from "react"
import axios from "axios"
import Tables from "@/components/tables"
import { useRouter } from "next/navigation"
import { formatDate, formatDynamicNumber, formatMoney } from "@/util/textUtil"
import AccountType from "@/classes/accountTypeData"
import Button from "@/components/button"
import ConfirmationModal from "@/components/confirmationModal"
import FormField from "@/components/formField"
import { useApiData } from "@/app/context/apiContext"
import BalanceBar from "@/components/balanceBar"
import LoadingSpinner from "@/components/loadingSpinner"
import { localAxios } from "@/util/localAxiosUtil"

const FundingRequest = () => {
    const router = useRouter()
    const [requests, setRequests] = useState([])

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [funding, setFunding] = useState('')

    const [filterRequests, setFilterRequests] = useState([])
    const [requestSearch, setRequestSearch] = useState('')
    const [index, setIndex] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    const [balance, setBalance] = useState('')
    const [action, setAction] = useState('')

    const { data, setReload } = useApiData()

    const getFundingRequests = async () => {
        try {

            const response = await localAxios.get('/api/get-funding-requests',)

            const responseData = response.data
            setRequests(responseData)
            setFilterRequests(responseData)
        } catch {

        }
    }

    useEffect(() => {
        if (data) {
            setBalance(data.balance)
            setIsLoading(false)
            getFundingRequests()
        }
    }, [data])

    const onToggleConfirmModal = (item: any, action: string) => {
        setFunding(item)
        setAction(action)
        setIsConfirmModalOpen(!isConfirmModalOpen)
    }

    const onConfirmAction = async () => {
        setIsConfirmModalOpen(false)
        try {
            setIsLoading(true)
            let response
            if (action === 'APPROVE') {
                response = await localAxios.post('/api/approve-funding', {
                    id: funding
                })
            } else {
                response = await localAxios.post('/api/reject-funding', {
                    id: funding
                })
            }

            setAlertMessage(response.data.message)

            await getFundingRequests()
            setReload(true)
        } catch (e: any) {
            const errorMessages = e?.response?.data?.error
            if (errorMessages) {
                if (errorMessages['Not found']) {
                    setAlertMessage(errorMessages['Not found'][0])
                }else if (errorMessages['Bad request']) {
                    setAlertMessage(errorMessages['Bad request'][0])
                } else {
                    setAlertMessage('An Error occured please try again')
                }

            } else {
                setAlertMessage('An Error occured please try again')
            }
        } finally {
            setIsLoading(false)
            setIsAlertModalOpen(true)
            setIndex(index + 1)
        }
    }

    const searchRequests = (value: string) => {
        const filter = requests.filter((agent: any) => {
            return (`${agent?.firstname} ${agent?.lastname}`.toUpperCase().includes(value) || String(agent?.accountNumber)?.includes(value)
                || agent?.phoneNumber?.toUpperCase().includes(value) || agent?.email?.toUpperCase().includes(value))
        })

        setRequestSearch(value)
        setFilterRequests(filter)
    }




    return (
        <div className="flex flex-col w-full" key={`agentList-${index}`}>
            <ConfirmationModal
                isOpen={isAlertModalOpen}
                onConfirm={() => setIsAlertModalOpen(false)}
                onCancel={() => { }}
                isOkOnly={true}
                message={alertMessage}
            />
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onCancel={() => onToggleConfirmModal(null, '')}
                onConfirm={onConfirmAction}
                message="Confirm transaction?"
            />
            {isLoading ? <LoadingSpinner /> : null}
            <div className="flex flex-col gap-4 w-full overflow-auto pr-4">
                <BalanceBar rigthElement='Funding Request Menu' balance={balance} />
                <div className="flex gap-4 flex-col">
                    <h1 className="text-xl">Requests</h1>
                    <div className="flex items-center gap-2 w-1/3">
                        <label htmlFor="accountNumber" >Search</label>
                        <FormField name="accountNumber" value={requestSearch} onBlur={(e) => { searchRequests(e.target.value.toUpperCase()) }} />

                    </div>
                    <div className="flex flex-col">
                        <Tables
                            primaryId="_id"
                            headers={[
                                {
                                    key: 'date',
                                    label: 'date',
                                    format: (val: string) => {

                                        const dt = new Date(val)

                                        return `${dt.toLocaleString()}`
                                    }
                                },
                                {
                                    key: 'firstname',
                                    label: 'complete name',
                                    concatKey: ['lastname'],
                                    concatSeparator: ' '
                                },
                                {
                                    key: 'accountNumber',
                                    label: 'account number',
                                    format: (val: string) => {
                                        return formatDynamicNumber(val)
                                    }
                                },
                                {
                                    key: 'amount',
                                    label: 'amount',
                                    format(item: any) {
                                        return formatMoney(item)
                                    }
                                },
                                {
                                    key: '',
                                    label: 'action',
                                    customValue: (item: any) => <div className="flex gap-2 items-center justify-center">
                                        <Button
                                            onClick={() => onToggleConfirmModal(item._id, 'REJECT')}
                                            type={"button"}
                                            size="text-xs"
                                            textColor="text-red"
                                        >
                                            Reject
                                        </Button>
                                        <Button
                                            onClick={() => onToggleConfirmModal(item._id, 'APPROVE')}
                                            type={"button"}
                                            size="text-xs"
                                        >
                                            Approve
                                        </Button>
                                    </div>

                                }
                            ]}
                            items={filterRequests}
                            isCentered={true}
                            key={`funding-requests-${index}`}
                        />
                    </div>
                </div>
            </div>
        </div>

    )
}

export default FundingRequest