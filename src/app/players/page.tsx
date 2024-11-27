'use client'
import { useEffect, useState } from "react"
import axios from "axios"
import Tables from "@/components/tables"
import { useRouter } from "next/navigation"
import { formatMoney } from "@/util/textUtil"
import Button from "@/components/button"
import AccountType from "@/classes/accountTypeData"
import FormField from "@/components/formField"

const Players = () => {
    const router = useRouter()
    const [players, setPlayers] = useState([])
    const [filterPlayers, setFilterPlayers] = useState([])
    const [accountType, setAccountType] = useState<AccountType[]>([])
    const [search, setSearch] = useState('')


    const getPlayerLists = async () => {

        await axios.get('/api/get-user-members')
            .then(response => {
                setPlayers(response.data.direct)
                setFilterPlayers(response.data.direct)
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
        getPlayerLists()
        getAcccountType()

    }, [])

    const onCashin = (item: any) => {
        const url = `/loading-station/cash-in/player?accountNumber=${item.accountNumber}`
        window.open(url, '_blank')
    }

    const onUserSearch = (value: string) => {
        const filter = players.filter((player: any) => {
            return (`${player?.firstname} ${player?.lastname}`.toUpperCase().includes(value) || String(player?.accountNumber)?.includes(value)
                || player?.phoneNumber?.toUpperCase().includes(value) || player?.email?.toUpperCase().includes(value))
        })

        setSearch(value)
        setFilterPlayers(filter)
    }

    return (
        <div className="flex flex-col gap-4 w-full">
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
                            key: 'fistname',
                            label: 'COMPLETE NAME',
                            concatKey: ['lastname'],
                            concatSeparator: ' '
                        },
                        {
                            key: 'accountNumber',
                            label: 'ACCOUNT NUMBER'
                        },
                        // {
                        //     key: 'accountType',
                        //     label: 'ACCOUNT TYPE',
                        //     format(item: any) {

                        //         const account = accountType.find(e => e?.accountType === item)

                        //         return account?.description ?? item
                        //     }
                        // },
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
                                    onClick={() => onCashin(item)}
                                    type={"button"}
                                    size="text-xs"
                                >
                                    Cash In
                                </Button>
                            </div>

                        }
                    ]}
                    items={filterPlayers}
                    isCentered={true}
                />
            </div>
        </div>

    )
}

export default Players