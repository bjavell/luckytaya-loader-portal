'use client'

import Tables from "@/components/tables"
import { useEffect, useState } from "react"
import { format } from 'date-fns'
import FormField from "@/components/formField"
import Form from "@/components/form"
import Button from "@/components/button"
import { formatDynamicNumber, formatMoney } from "@/util/textUtil"
import LoadingSpinner from "@/components/loadingSpinner"
import { localAxios } from "@/util/localAxiosUtil"
import { NextPage } from "next"

const CashinHistory: NextPage<{}> = (props) => {

    const currDate = new Date()
    const defaultStartDate = new Date(currDate)
    defaultStartDate.setHours(0, 0, 0, 0)
    const defaultEndDate = new Date(currDate)
    defaultEndDate.setHours(23, 59, 59, 999)

    const [transactions, setTransactions] = useState([])
    const [startDate, setStartDate] = useState(format(defaultStartDate, "yyyy-MM-dd'T'HH:mm"))
    const [endDate, setEndDate] = useState(format(defaultEndDate, "yyyy-MM-dd'T'HH:mm"))
    const [isLoading, setIsLoading] = useState(false)
    const [filteredTransactions, setFilteredTransactions] = useState([])
    const [transactionType, setTransactionType] = useState('ALL')
    const [index, setIndex] = useState('0')

    // Fetch transaction data
    const getTransaction = async () => {
        try {
            const startDateDateTime = new Date(startDate)
            // startDateDateTime.setHours(0, 0, 0, 0)
            const localStartDateTime = new Date(startDateDateTime.getTime() - startDateDateTime.getTimezoneOffset() * 60000)

            const endDateDateTime = new Date(endDate)
            // endDateDateTime.setHours(23, 59, 59, 999)
            const localEndDateTime = new Date(endDateDateTime.getTime() - endDateDateTime.getTimezoneOffset() * 60000)

            const response = await localAxios.get('/api/get-cashin-report', {
                params: {
                    startDate: localStartDateTime.toISOString(),
                    endDate: localEndDateTime.toISOString()
                }
            })

            setTransactions(response.data)
            setIndex(prevIndex => prevIndex + 1) // Update index to refresh the table
        } catch (e) {
            setTransactions([])
            setFilteredTransactions([])
        }
    }

    // Fetch transaction data on mount or whenever the date range changes
    useEffect(() => {
        if (transactions.length === 0) {
            getTransaction()
        }
    }, [])

    // Filter transactions based on the selected transaction type
    useEffect(() => {
        const filterTransaction = transactions.filter((transaction: any) => {
            if (transactionType === 'ALL') {
                return true
            }
            return transaction.transactionType === Number(transactionType)
        })
        setFilteredTransactions(filterTransaction)
    }, [transactions, transactionType])

    // Handle form submission
    const onHandleSubmit = async () => {
        setIsLoading(true)
        if (!startDate) {
            setStartDate(format(currDate, 'yyyy-MM-ddTHH:mm:ss'))
        }
        if (!endDate) {
            setEndDate(format(defaultEndDate, 'yyyy-MM-ddTHH:mm:ss'))
        }
        await getTransaction()
        setIsLoading(false)
    }

    const exportToCSV = () => {
        const year = currDate.getFullYear();
        const month = currDate.getMonth() + 1; // getMonth() is 0-based, so add 1
        const day = currDate.getDate();
        const hours = currDate.getHours();
        const minutes = currDate.getMinutes();
        const seconds = currDate.getSeconds();
        const milliseconds = currDate.getMilliseconds();

        const headers = [
            "DATE", "TXN ID", "USER", "AMOUNT", "STATUS"
        ];

        const csvRows = [
            headers.join(','), // Add header row
            ...filteredTransactions.map((transaction: any) => {
                const formattedDate = format(new Date(transaction.transactionDate), 'yyyy-MM-dd hh:mm:ss a');
                const user = transaction.fullName + ' | ' + transaction.accountNumber;
                const amount = transaction.amount;
                return [
                    formattedDate,
                    transaction.transactionId,
                    user,
                    amount,
                    transaction.status,
                ].join(',');
            })
        ];

        // Create a Blob from the CSV rows
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `LuckyTaya-Cashin-Report-${year}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}${hours.toString().padStart(2, '0')}${minutes.toString().padStart(2, '0')}${seconds.toString().padStart(2, '0')}${milliseconds.toString().padStart(3, '0')}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            <h1 className="text-xl">Cashin In</h1>
            <div className="search-container flex flex-row items-center justify-between">
                <Form className="flex flex-row">
                    <div className="gap-4 flex items-center">
                        <FormField name="startDate" label="Start Date" placeholder="Enter Load To" value={startDate} onChange={(e) => setStartDate(e.target.value)} type="datetime-local" />
                        <FormField name="endDate" label="End Date" placeholder="Enter Load To" value={endDate} onChange={(e) => setEndDate(e.target.value)} type="datetime-local" />
                        <Button onClick={onHandleSubmit} isLoading={isLoading} loadingText="Loading..." type={'submit'}>Search</Button>
                    </div>
                </Form>
                <div className="flex flex-row gap-4">
                    <Button onClick={exportToCSV} isLoading={isLoading} loadingText="Loading..." type={'button'}>Export</Button>
                </div>
            </div>
            <div className="flex flex-col">
                {isLoading ? <LoadingSpinner /> :
                    <Tables
                        primaryId="id"
                        headers={[
                            {
                                key: 'transactionDate',
                                label: 'date',
                                format: (val: string) => {
                                    const formatDate = new Date(val)
                                    return format(formatDate, 'yyyy-MM-dd hh:mm:ss a')
                                }
                            }, {
                                key: 'transactionId',
                                label: 'transaction id',
                            }, {
                                key: 'fullName',
                                label: 'sender',
                                concatKey: ['accountNumber'],
                                customValue: (item) => {
                                    return (
                                        <>
                                            {item.fullName}
                                            <br />
                                            {formatDynamicNumber(item.accountNumber)}
                                        </>
                                    )
                                    // spliitedVal[0] + ' | ' + formatAccountNumber
                                }
                            }, {
                                key: 'amount',
                                label: 'amount',
                                customValueClass: 'text-semiYellow',
                                format: (val: string) => {
                                    return formatMoney(val)
                                }
                            }, {
                                key: 'status',
                                label: 'status',
                            }

                        ]}
                        items={filteredTransactions}
                        isCentered={true}
                        key={`table-${index}`}
                    />
                }
            </div>
        </div>
    )
}

export default CashinHistory
