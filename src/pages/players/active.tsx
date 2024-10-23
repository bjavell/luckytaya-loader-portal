import { useEffect, useState } from "react"
import DashboardLayout from "../layout"
import axios from "axios"
import Tables from "@/components/tables"

const Active = () => {
    const [players, setPlayers] = useState([])


    useEffect(() => {
        axios.get('/api/get-all-player?suspended=0')
            .then(response => {
                setPlayers(response.data)
            })
            .catch(e => {
                console.error(e)
            })
            .finally(() => {
                // setIsLoading(false)
            })
    }, [])

    return (
        <DashboardLayout title="Dashboard" slug="ACTIVE PLAYERS">
            <div className="flex flex-col gap-4 w-full">
                <h1 className="text-xl">Active Players</h1>
                <div className="flex flex-col">
                    <Tables
                        primaryId="accountNumber"
                        headers={[
                            // {
                            //     key: 'date',
                            //     label: 'DATE'
                            // },
                            //  {
                            //     key: 'completeName',
                            //     label: 'COMPLETE NAME'
                            // }, 
                            {
                                key: 'aspnetuserId',
                                label: 'USER ID'
                            }, {
                                key: 'balance',
                                label: 'BALANCE'
                            }, 
                            // {
                            //     key: 'dob',
                            //     label: 'DOB'
                            // }, 
                            // {
                            //     key: 'occupation',
                            //     label: 'OCCUPATION'
                            // }, {
                            //     key: 'province',
                            //     label: 'PROVINCE'
                            // }, {
                            //     key: 'region',
                            //     label: 'REGION'
                            // }
                        ]}
                        items={players}
                    />
                </div>
            </div>
        </DashboardLayout>

    )
}

export default Active