'use client'
import { SetStateAction, useEffect, useState } from "react"
import axios from "axios"
import Tables from "@/components/tables"
import { useRouter } from "next/navigation"
import { formatMoney } from "@/util/textUtil"

const Players = () => {
    const router = useRouter()
    const [players, setPlayers] = useState([])
    const [filterPlayers, setFilterPlayers] = useState([])
    const [status, setStatus] = useState('ALL')


    const getPlayerLists = async () => {

        await axios.get('/api/get-all-players')
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

    useEffect(() => {
        if (players.length === 0)
            getPlayerLists()
    }, [])

    const onStatusChange = ((e: { target: { value: SetStateAction<string> } }) => {
        const filter = players.filter((player: any) => {
            if (e.target.value === 'ALL') {
                return true
            }
            return player.suspended === Number(e.target.value)
        })
        setStatus(e.target.value)
        setFilterPlayers(filter)
    })


    return (
        <div className="flex flex-col gap-4 w-full">
            <h1 className="text-xl">Players</h1>
            <div className="flex flex-row">
                <div className="gap-2 flex">
                    <label htmlFor="status" className="flex items-center">Status</label>
                    <select id="status" className="rounded-xlg py-4 px-4 bg-semiBlack font-sans font-light text-[13px] tacking-[5%] text-white" value={status} onChange={(e) => onStatusChange(e)}>
                        <option value="ALL">ALL</option>
                        <option value="0">Active</option>
                        <option value="1">Inactive</option>
                    </select>
                </div>
            </div>
            <div className="flex flex-col">
                <Tables
                    primaryId="accountNumber"
                    headers={[
                        {
                            key: 'date',
                            label: 'DATE'
                        },
                        {
                            key: 'completeName',
                            label: 'COMPLETE NAME'
                        },
                        {
                            key: 'aspnetuserId',
                            label: 'USER ID'
                        },
                        {
                            key: 'accountNumber',
                            label: 'ACCOUNT NUMBER'
                        }, {
                            key: 'balance',
                            label: 'BALANCE',
                            format: (val: string) => {
                                return formatMoney(val)
                            }
                        },
                        {
                            key: 'dob',
                            label: 'DOB'
                        },
                        {
                            key: 'occupation',
                            label: 'OCCUPATION'
                        }, {
                            key: 'province',
                            label: 'PROVINCE'
                        }, {
                            key: 'region',
                            label: 'REGION'
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