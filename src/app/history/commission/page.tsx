'use client'

import Tables from "@/components/tables"

const Commisson = () => {
    const tempData = [{
        date: '2024-01-01 10:10:00 PM',
        txnId: '123123',
        sender: 'BEN | 123456',
        receiver: 'RONALD | 123456',
        amount: '1.00',
        type: 'Deposit'
    }]
    return (
            <div className="flex flex-col gap-4 w-full">
                <h1 className="text-xl">Transfer</h1>
                <div className="flex flex-col">
                    <Tables
                        primaryId="id"
                        headers={[
                            {
                                key: 'date',
                                label: 'DATE'
                            }, {
                                key: 'txnId',
                                label: 'TXN ID'
                            }, {
                                key: 'sender',
                                label: 'SENDER'
                            }, {
                                key: 'receiver',
                                label: 'RECEIVER'
                            }, {
                                key: 'amount',
                                label: 'AMOUNT',
                                customValueClass: 'text-semiYellow'
                            }, {
                                key: 'type',
                                label: 'TYPE'
                            },
                        ]}
                        items={tempData}
                        isCentered={true}
                    />
                </div>
            </div>
    )
}


export default Commisson