'use client'
import { useEffect, useState } from "react"
import axios from "axios"
import Tables from "@/components/tables"

const Active = () => {
    const [players, setPlayers] = useState([])
    const [filterPlayers, setFilteredPlayer] = useState([])
    const [status, setStatus] = useState('ALL')


    useEffect(() => {
        axios.get('/api/get-all-players')
            .then(response => {
                setPlayers(response.data)
                setFilteredPlayer(response.data)
            })
            .catch(e => {
                console.error(e)
            })
            .finally(() => {
                // setIsLoading(false)
            })
    }, [])

    const onStatusChange = ((e: any) => {
        console.log(e.target.value)
        const filter = players.filter((player: any) => {
            if (e.target.value === 'ALL') {
                return true
            }
            console.log(player)
            return player.suspended === Number(e.target.value)
        })
        setStatus(e.target.value)
        setFilteredPlayer(filter)
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
                        }, {
                            key: 'balance',
                            label: 'BALANCE'
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

export default Active