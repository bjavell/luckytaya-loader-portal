'use client'
import { useEffect, useState } from "react"
import axios from "axios"
import Tables from "@/components/tables"
import { useRouter } from "next/navigation"
import { formatDynamicNumber, formatMoney } from "@/util/textUtil"
import Button from "@/components/button"
import AccountType from "@/classes/accountTypeData"
import FormField from "@/components/formField"
import { localAxios } from "@/util/localAxiosUtil"
import Modal from "@/components/modal"
import TransactionHistory from "@/components/transactionHistory"

const Players = () => {
    const router = useRouter()
    const [players, setPlayers] = useState([])
    const [filterPlayers, setFilterPlayers] = useState([])
    const [accountType, setAccountType] = useState<AccountType[]>([])
    const [search, setSearch] = useState('')
    const [isShowTransactionHistoryModal, setIsShowTransactionHistoryModal] = useState(false)
    const [accountNumber, setAccountNumber] = useState(0)


    const getPlayerLists = async () => {

        await localAxios.get('/api/get-user-members', {
            params: {
                type: 'players'
            }
        })
            .then(response => {
                setPlayers(response.data)
                setFilterPlayers(response.data)
            })
            .catch((e) => {
                const errorMessages = e.response.data.error
                if (errorMessages) {
                    if (errorMessages['Unauthorized']) {
                        router.push('/login')
                    }
                }
                // const errorMessages = e.response.data.error
                setPlayers([])
                setFilterPlayers([])
            })
            .finally(() => {
                // setIsLoading(false)
            })
    }
    const getAcccountType = async () => {
        await localAxios.get('/api/get-account-type')
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
        getPlayerLists()
        getAcccountType()

    }, [])

    const onCashin = (item: any) => {
        const url = `/loading-station/cash-in/player?accountNumber=${item.accountNumber}`
        router.push(url)
    }

    const onUserSearch = (value: string) => {
        const filter = players.filter((player: any) => {
            return (`${player?.firstname} ${player?.lastname}`.toUpperCase().includes(value) || String(player?.accountNumber)?.includes(value)
                || player?.phoneNumber?.toUpperCase().includes(value) || player?.email?.toUpperCase().includes(value))
        })

        setSearch(value)
        setFilterPlayers(filter)
    }


    const openTransactionHistoryModal = (data: any) => {
        setAccountNumber(data.accountNumber)
        setIsShowTransactionHistoryModal(true)
    }


    const closeTransactionHistoryModal = () => {
        setAccountNumber(0)
        setIsShowTransactionHistoryModal(false)
    }

    return (
        <div className="flex flex-col gap-4 w-full">
            <Modal isOpen={isShowTransactionHistoryModal} onClose={closeTransactionHistoryModal} size="large">
                <div className="flex flex-col items-end gap-4">
                    <div className="flex w-full gap-4">
                        <TransactionHistory reportType="player" accountNumber={accountNumber} />
                    </div>
                    <div className="flex gap-4">
                        <Button
                            onClick={closeTransactionHistoryModal}
                            type={"button"}
                            textColor="text-red"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            </Modal>
            <h1 className="text-xl">Players</h1>
            <div className="flex items-center gap-2 w-1/3">
                <label htmlFor="accountNumber" >Search</label>
                <FormField name="accountNumber" value={search} onBlur={(e) => { onUserSearch(e.target.value.toUpperCase()) }} />

            </div>
            <div className="flex flex-col">
                <Tables
                    primaryId="accountNumber"
                    headers={[
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
                            },
                        },
                        {
                            key: 'suspended',
                            label: 'status',
                            format: (val: string) => {

                                let formattedValue
                                if (Number(val) === 1) {
                                    formattedValue = 'Suspended'
                                } else {
                                    formattedValue = 'Active'
                                }

                                return formattedValue
                            }
                        }, {
                            key: '',
                            label: 'action',
                            customValue: (item: any) => {

                                return <div className="flex gap-2 items-center justify-center">
                                    <Button
                                        onClick={() => openTransactionHistoryModal(item)}
                                        type={"button"}
                                        size="text-xs"
                                    >
                                        View Transaction
                                    </Button>
                                </div>
                            }
                        }
                        // {
                        //     key: 'accountType',
                        //     label: 'ACCOUNT TYPE',
                        //     format(item: any) {

                        //         const account = accountType.find(e => e?.accountType === item)

                        //         return account?.description ?? item
                        //     }
                        // },
                        // {
                        //     key: 'balance',
                        //     label: 'balance',
                        //     format: (val: string) => {
                        //         return formatMoney(val)
                        //     }
                        // },
                        // {
                        //     key: 'principalAccountNumber',
                        //     label: 'PRINCIPAL ACCOUNT NUMBER'
                        // },
                        // {
                        //     key: '',
                        //     label: 'action',
                        //     customValue: (item: any) => <div className="flex gap-2 items-center justify-center">
                        //         <Button
                        //             onClick={() => onCashin(item)}
                        //             type={"button"}
                        //             size="text-xs"
                        //         >
                        //             Cash In
                        //         </Button>
                        //     </div>  

                        // }
                    ]}
                    items={filterPlayers}
                    isCentered={true}
                />
            </div>
        </div>

    )
}

export default Players