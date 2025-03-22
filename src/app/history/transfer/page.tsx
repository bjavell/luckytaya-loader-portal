'use client'

import Tables from "@/components/tables"
import { getStartOfWeek } from "@/util/dateUtil"
import axios from "axios"
import { useEffect, useState } from "react"
import { format } from 'date-fns'
import FormField from "@/components/formField"
import Form from "@/components/form"
import Button from "@/components/button"
import { formatDynamicNumber, formatMoney } from "@/util/textUtil"
import { localAxios } from "@/util/localAxiosUtil"

const Commisson = () => {

    const currDate = new Date()
    const defaultEndDate = new Date(currDate)
    defaultEndDate.setHours(23, 59, 59, 999)

    const [transactions, setTransactions] = useState([])
    const [startDate, setStartDate] = useState(format(getStartOfWeek(new Date(currDate.getTime() - 14 * 24 * 60 * 60 * 1000)), 'yyyy-MM-dd'))
    const [endDate, setEndDate] = useState(format(defaultEndDate, 'yyyy-MM-dd'))
    const [isLoading, setIsLoading] = useState(false)



    const getTransaction = async () => {


        const startDateDateTime = new Date(startDate)
        startDateDateTime.setHours(0, 0, 0, 0);
        // Adjust for the local timezone offset
        const localStartDateTime = new Date(startDateDateTime.getTime() - startDateDateTime.getTimezoneOffset() * 60000);


        const endDateDateTime = new Date(endDate)
        endDateDateTime.setHours(23, 59, 59, 999);
        // Adjust for the local timezone offset
        const localEndDateTime = new Date(endDateDateTime.getTime() - endDateDateTime.getTimezoneOffset() * 60000);

        await localAxios.get('/api/get-transaction', {
            params: {
                startDate: localStartDateTime.toISOString(),
                endDate: localEndDateTime.toISOString()
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
            setStartDate(format(getStartOfWeek(currDate), 'yyyy-MM-dd'))
        }
        if (!endDate) {
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
                    primaryId="historyId"
                    headers={[
                        {
                            key: 'createdDate',
                            label: 'date',
                            format: (val: string) => {
                                const formatDate = new Date(val)
                                return format(formatDate, 'yyyy-MM-dd hh:mm:ss a')
                            }
                        }, {
                            key: 'historyId',
                            label: 'txn id',
                            format: (val: string) => {
                                return val
                            }
                        }, {
                            key: 'otherDetails.from.firstName',
                            customValue: (item) => {
                                return (
                                    <>
                                        {item.otherDetails.from.firstName} {item.otherDetails.from.lastName}
                                        <br />
                                        {formatDynamicNumber(item.fromUserId )}
                                    </>
                                )
                                // spliitedVal[0] + ' | ' + formatAccountNumber
                            }
                        }, {
                            key: 'otherDetails.to.firstName',
                            label: 'receiver',
                            customValue: (item) => {
                                return (
                                    <>
                                    {item.otherDetails.to.firstName} {item.otherDetails.to.lastName}
                                    <br />
                                    {formatDynamicNumber(item.toUserId )}
                                    </>
                                )
                                // spliitedVal[0] + ' | ' + formatAccountNumber
                            }
                        }, {
                            key: 'otherDetails.amount',
                            label: 'amount',
                            customValueClass: 'text-semiYellow',
                            format: (val: any) => {
                                return formatMoney(val)
                            }
                        }, {
                            key: 'transactionType',
                            concatKey: ['otherDetails.action'],
                            concatSeparator: ' | ',
                            label: 'type',
                            
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