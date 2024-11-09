'use client'

import Tables from "@/components/tables"
import { getStartOfWeek } from "@/util/dateUtil"
import axios from "axios"
import { useEffect, useState } from "react"
import { format } from 'date-fns'
import FormField from "@/components/formField"
import Form from "@/components/form"
import Button from "@/components/button"

const Commisson = () => {

    const currDate = new Date()
    const defaultEndDate = new Date(currDate)
    defaultEndDate.setHours(23, 59, 59, 999)

    const [transactions, setTransactions] = useState([])
    const [startDate, setStartDate] = useState(format(getStartOfWeek(new Date(currDate.getTime() - 14 * 24 * 60 * 60 * 1000)), 'yyyy-MM-dd'))
    const [endDate, setEndDate] = useState(format(defaultEndDate, 'yyyy-MM-dd'))
    const [isLoading, setIsLoading] = useState(false)



    const getTransaction = async () => {

        await axios.get('/api/get-transaction', {
            params: {
                startDate: startDate.split('T')[0],
                endDate: endDate.split('T')[0]
            }
        }).then(response => {
            setTransactions(response.data)
        }).catch(() => {
            setTransactions([])
        })
    }

    useEffect(() => {
        getTransaction()
    }, [])

    const onHandleSubmit = async () => {
        setIsLoading(true)
        if (!startDate) {
            setStartDate(format(getStartOfWeek(new Date(currDate.getTime() - 14 * 24 * 60 * 60 * 1000)), 'yyyy-MM-dd'))
        }
        if (!endDate) {
            console.log('HERE!')
            setEndDate(format(defaultEndDate, 'yyyy-MM-dd'))
        }
        await getTransaction()
        setIsLoading(false)
    }

    return (
        <div className="flex flex-col gap-4 w-full">
            <h1 className="text-xl">Transfer</h1>
            <Form className="flex flex-row">
                <div className="gap-2 flex">
                    <FormField name="startDate" label="Start Date" placeholder="Enter Load To" value={startDate} onChange={(e) => {
                        setStartDate(e.target.value)
                    }} type="date" />
                    <FormField name="endDate" label="End Date" placeholder="Enter Load To" value={endDate} onChange={(e) => {
                        setEndDate(e.target.value)
                    }} type="date" />

                    <Button onClick={onHandleSubmit} isLoading={isLoading} loadingText="Loading..." type={'submit'}>Search</Button>
                </div>
            </Form>
            <div className="flex flex-col">
                <Tables
                    primaryId="id"
                    headers={[
                        {
                            key: 'transactionDateTime',
                            label: 'DATE',
                            format: (val: string) => {
                                const formatDate = new Date(val)
                                return format(formatDate, 'yyyy-MM-dd hh:mm:ss a')
                            }
                        }, {
                            key: 'transactionNumber',
                            label: 'TXN ID'
                        }, {
                            key: 'fromFirstname',
                            concatKey: ['fromLastname'],
                            label: 'SENDER'
                        }, {
                            key: 'toFirstname',
                            concatKey: ['toLastname'],
                            label: 'RECEIVER'
                        }, {
                            key: 'amount',
                            label: 'AMOUNT',
                            customValueClass: 'text-semiYellow'
                        }, {
                            key: 'transactionDesc',
                            label: 'TYPE'
                        },
                    ]}
                    items={transactions}
                    isCentered={true}
                />
            </div>
        </div>
    )
}


export default Commisson