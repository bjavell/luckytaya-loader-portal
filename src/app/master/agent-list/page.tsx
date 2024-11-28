'use client'
import { useEffect, useState } from "react"
import axios from "axios"
import Tables from "@/components/tables"
import { useRouter } from "next/navigation"
import { formatMoney } from "@/util/textUtil"
import AccountType from "@/classes/accountTypeData"
import Button from "@/components/button"
import ConfirmationModal from "@/components/confirmationModal"
import FormField from "@/components/formField"
import { useApiData } from "@/app/context/apiContext"
import BalanceBar from "@/components/balanceBar"

const Players = () => {
    const router = useRouter()
    const [agents, setAgents] = useState([])
    const [players, setPlayers] = useState([])
    const [orphans, setOrphans] = useState([])
    const [accountType, setAccountType] = useState<AccountType[]>([])

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [member, setMember] = useState('')
    const [action, setAction] = useState('')

    const [filteredAgents, setFilteredAgents] = useState([])
    const [agentSearch, setAgentSearch] = useState('')
    const [filteredOrphans, setFilteredOrphans] = useState([])
    const [orphanSearch, setOrphanSearch] = useState('')
    const [index, setIndex] = useState(0)

    const [balance, setBalance] = useState('')

    const { data } = useApiData()

    const getMembers = async () => {
        await axios.get('/api/get-user-members', {
            params: {
                type: 'agents'
            }
        })
            .then(response => {
                const responseData = response.data
                setAgents(responseData.direct)
                setFilteredAgents(responseData.direct)
                setPlayers(responseData.indirect)
                setOrphans(responseData.orphan)
                setFilteredOrphans(responseData.orphan)
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
        if (data)
            setBalance(data.balance)
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
            setIndex(index + 1)
        }
    }

    const searchAgent = (value: string) => {
        const filter = agents.filter((agent: any) => {
            return (`${agent?.firstname} ${agent?.lastname}`.toUpperCase().includes(value) || String(agent?.accountNumber)?.includes(value)
                || agent?.phoneNumber?.toUpperCase().includes(value) || agent?.email?.toUpperCase().includes(value))
        })

        setAgentSearch(value)
        setFilteredAgents(filter)
    }

    const searchOrphan = (value: string) => {
        const filter = orphans.filter((orphan: any) => {
            return (`${orphan?.firstname} ${orphan?.lastname}`.toUpperCase().includes(value) || String(orphan?.accountNumber)?.includes(value)
                || orphan?.phoneNumber?.toUpperCase().includes(value) || orphan?.email?.toUpperCase().includes(value))
        })

        setOrphanSearch(value)
        setFilteredOrphans(filter)
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
                message="Proceed with the changes?"
            />
            <div className="flex flex-col gap-4 w-full overflow-auto pr-4">
                <BalanceBar balance={balance} />
                <div className="flex gap-4 flex-col">
                    <h1 className="text-xl">Agents</h1>
                    <div className="flex items-center gap-2 w-1/3">
                        <label htmlFor="accountNumber" >Search</label>
                        <FormField name="accountNumber" value={agentSearch} onBlur={(e) => { searchAgent(e.target.value.toUpperCase()) }} />

                    </div>
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
                                },
                                // {
                                //     key: 'principalAccountNumber',
                                //     label: 'PRINCIPAL ACCOUNT NUMBER'
                                // },
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
                                        <Button
                                            onClick={() => {
                                                const url = `/loading-station/cash-in/agent?accountNumber=${item.accountNumber}`
                                                router.push(url)
                                            }}
                                            type={"button"}
                                            size="text-xs"
                                        >
                                            Cash-In
                                        </Button>
                                    </div>

                                }
                            ]}
                            items={filteredAgents}
                            isCentered={true}
                            key={`agents-${index}`}
                        />
                    </div>
                </div>

                <div className="flex w-full gap-4 flex-col">
                    <h1 className="text-xl">Players</h1>
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
                                    key: 'balance',
                                    label: 'BALANCE',
                                    format: (val: string) => {
                                        return formatMoney(val)
                                    }
                                },
                                //  {
                                //     key: 'principalAccountNumber',
                                //     label: 'PRINCIPAL ACCOUNT NUMBER'
                                // }
                            ]}
                            items={players}
                            isCentered={true}
                            key={`players-${index}`}
                        />
                    </div>
                </div>

                <div className="flex gap-4 flex-col">
                    <h1 className="text-xl">Orphan</h1>
                    <div className="flex items-center gap-2 w-1/3">
                        <label htmlFor="accountNumber" >Search</label>
                        <FormField name="accountNumber" value={orphanSearch} onBlur={(e) => { searchOrphan(e.target.value.toUpperCase()) }} />
                    </div>
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
                                },
                                // {
                                //     key: 'principalAccountNumber',
                                //     label: 'PRINCIPAL ACCOUNT NUMBER'
                                // },
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
                            items={filteredOrphans}
                            isCentered={true}
                            key={`orphans-${index}`}
                        />
                    </div>
                </div>
            </div>
        </div>

    )
}

export default Players