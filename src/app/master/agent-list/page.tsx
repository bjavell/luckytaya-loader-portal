'use client'
import { useEffect, useState } from "react"
import axios from "axios"
import Tables from "@/components/tables"
import { useRouter } from "next/navigation"
import { formatMoney } from "@/util/textUtil"
import AccountType from "@/classes/accountTypeData"
import Button from "@/components/button"
import ConfirmationModal from "@/components/confirmationModal"

const Players = () => {
    const router = useRouter()
    const [directMember, setDirectMember] = useState([])
    const [indirectMember, setIndirectMember] = useState([])
    const [orphanMember, setOrphanMember] = useState([])
    const [accountType, setAccountType] = useState<AccountType[]>([])

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [member, setMember] = useState('')
    const [action, setAction] = useState('')

    const getMembers = async () => {
        await axios.get('/api/get-user-members')
            .then(response => {
                const responseData = response.data
                setDirectMember(responseData.direct)
                setIndirectMember(responseData.indirect)
                setOrphanMember(responseData.orphan)
            })
            .catch((e) => {
            })
            .finally(() => {
            })
    }

    const getAcccountType = async () => {
        await axios.get('/api/get-account-type')
            .then(response => {
                setAccountType(response.data)
            })
            .catch((e) => {
                const errorMessages = e.response.data.error
                if (errorMessages) {
                    if (errorMessages['Unauthorized']) {
                        router.push('/login')
                    }
                }
                // const errorMessages = e.response.data.error
                setAccountType([])
            })
            .finally(() => {
                // setIsLoading(false)
            })
    }
    useEffect(() => {
        getMembers()
        getAcccountType()
    }, [])

    const onToggleConfirmModal = (item: any, action: string) => {
        setMember(item?.accountNumber)
        setAction(action)
        setIsConfirmModalOpen(!isConfirmModalOpen)
    }

    const onConfirmAction = async () => {
        setIsConfirmModalOpen(false)
        try {

            const response = await axios.patch('/api/member', {
                accountNumber: member,
                action
            })

            setAlertMessage(response.data.message)

            await getMembers()
        } catch (e: any) {
            const errorMessages = e?.response?.data?.error
            if (errorMessages) {
                if (errorMessages['Bad request']) {
                    setAlertMessage(errorMessages['Bad request'][0])
                } else {
                    setAlertMessage('An Error occured please try again')
                }

            } else {
                setAlertMessage('An Error occured please try again')
            }
        } finally {
            setIsAlertModalOpen(true)
        }
    }

    return (
        <div className="flex flex-col w-full">
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
                message="Proceed with the changes?"
            />
            <div className="flex flex-col gap-4 w-full overflow-auto pr-4">

                <div className="flex flex-col">
                    <h1 className="text-xl">Member</h1>
                    <div className="flex flex-col">
                        <Tables
                            primaryId="accountNumber"
                            headers={[
                                {
                                    key: 'fistname',
                                    label: 'COMPLETE NAME',
                                    concatKey: ['lastname'],
                                    concatSeparator: ' '
                                },
                                {
                                    key: 'accountNumber',
                                    label: 'ACCOUNT NUMBER'
                                },
                                {
                                    key: 'accountType',
                                    label: 'ACCOUNT TYPE',
                                    format(item: any) {

                                        const account = accountType.find(e => e?.accountType === item)

                                        return account?.description ?? item
                                    }
                                },
                                {
                                    key: 'balance',
                                    label: 'BALANCE',
                                    format: (val: string) => {
                                        return formatMoney(val)
                                    }
                                }, {
                                    key: 'principalAccountNumber',
                                    label: 'PRINCIPAL ACCOUNT NUMBER'
                                },
                                {
                                    key: '',
                                    label: 'ACTION',
                                    customValue: (item: any) => <div className="flex gap-2 items-center justify-center">
                                        <Button
                                            onClick={() => onToggleConfirmModal(item, 'REMOVE')}
                                            type={"button"}
                                            size="text-xs"
                                            textColor="text-red"
                                        >
                                            Remove
                                        </Button>
                                    </div>

                                }
                            ]}
                            items={directMember}
                            isCentered={true}
                        />
                    </div>
                </div>
                <div className="flex flex-col">
                    <h1 className="text-xl">Indirect</h1>
                    <div className="flex flex-col">
                        <Tables
                            primaryId="accountNumber"
                            headers={[
                                {
                                    key: 'fistname',
                                    label: 'COMPLETE NAME',
                                    concatKey: ['lastname'],
                                    concatSeparator: ' '
                                },
                                {
                                    key: 'accountNumber',
                                    label: 'ACCOUNT NUMBER'
                                },
                                {
                                    key: 'accountType',
                                    label: 'ACCOUNT TYPE',
                                    format(item: any) {

                                        const account = accountType.find(e => e?.accountType === item)

                                        return account?.description ?? item
                                    }
                                },
                                {
                                    key: 'balance',
                                    label: 'BALANCE',
                                    format: (val: string) => {
                                        return formatMoney(val)
                                    }
                                }, {
                                    key: 'principalAccountNumber',
                                    label: 'PRINCIPAL ACCOUNT NUMBER'
                                }
                            ]}
                            items={indirectMember}
                            isCentered={true}
                        />
                    </div>
                </div>
                <div className="flex flex-col">
                    <h1 className="text-xl">Orphan</h1>
                    <div className="flex flex-col">
                        <Tables
                            primaryId="accountNumber"
                            headers={[
                                {
                                    key: 'fistname',
                                    label: 'COMPLETE NAME',
                                    concatKey: ['lastname'],
                                    concatSeparator: ' '
                                },
                                {
                                    key: 'accountNumber',
                                    label: 'ACCOUNT NUMBER'
                                },
                                {
                                    key: 'accountType',
                                    label: 'ACCOUNT TYPE',
                                    format(item: any) {

                                        const account = accountType.find(e => e?.accountType === item)

                                        return account?.description ?? item
                                    }
                                },
                                {
                                    key: 'balance',
                                    label: 'BALANCE',
                                    format: (val: string) => {
                                        return formatMoney(val)
                                    }
                                }, {
                                    key: 'principalAccountNumber',
                                    label: 'PRINCIPAL ACCOUNT NUMBER'
                                },
                                {
                                    key: '',
                                    label: 'ACTION',
                                    customValue: (item: any) => {
                                        return <div className="flex gap-2 items-center justify-center">
                                            <Button
                                                onClick={() => onToggleConfirmModal(item, 'ADD')}
                                                type={"button"}
                                                size="text-xs"
                                            >
                                                Add
                                            </Button>
                                        </div>
                                    }
                                }
                            ]}
                            items={orphanMember}
                            isCentered={true}
                        />
                    </div>
                </div>
            </div>
        </div>

    )
}

export default Players