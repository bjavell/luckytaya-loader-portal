'use client'

import LoadingSpinner from "@/components/loadingSpinner"
import Tables from "@/components/tables"
import { localAxios } from "@/util/localAxiosUtil"
import { useEffect, useState } from "react"

const Commisson = () => {

    const [isLoading, setIsLoading] = useState(true)
    const [commission, setCommission] = useState([])


    const getCommission = async () => {
        try {
            const response = await localAxios.get('/api/get-commission', {})

            setCommission(response.data)
        } catch (e) {
            setCommission([])
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (commission.length === 0) {
            getCommission()
        }
    }, [])


    return (
        isLoading ? <LoadingSpinner /> :
            <div className="flex flex-col gap-4 w-full">
                <h1 className="text-xl">Commissions</h1>
                <div className="flex flex-col">
                    <Tables
                        primaryId="eventId"
                        headers={[
                            {
                                key: 'eventName',
                                label: 'event name'
                            }, {
                                key: 'sales',
                                label: 'sales'
                            }, {
                                key: 'commission',
                                label: 'commission'
                            }
                        ]}
                        items={commission}
                        isCentered={true}
                    />
                </div>
            </div>
    )
}


export default Commisson