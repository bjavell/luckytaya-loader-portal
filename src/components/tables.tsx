import { useState } from "react"

interface HeadersProp<T> {
    label?: string,
    key: string,
    customValueClass?: string,
    format?: Function,
    concatKey?: Array<string>
}

interface TablesProps<T> {
    headers: Array<HeadersProp<T>>,
    items: Array<T>,
    primaryId: string,
    isCentered?: boolean
}

const Tables = <T extends any>({ headers, items, primaryId, isCentered = false }: TablesProps<T>) => {
    const [currentPage, setCurrentPage] = useState(1)
    const pageSize = 10
    const totalPages = Math.ceil(items.length / pageSize)

    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    const paginatedItems = items.slice(start, end)

    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1)
        }
    }

    const handlePrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1)
        }
    }

    const handlePageClick = (page: number) => {
        setCurrentPage(page)
    }

    // Function to generate page numbers with ellipses
    const getPaginationRange = () => {
        const range = []
        const maxVisiblePages = 3 // Maximum number of page buttons to show
        let startPage: number, endPage: number

        if (totalPages <= maxVisiblePages) {
            startPage = 1
            endPage = totalPages
        } else {
            if (currentPage <= maxVisiblePages) {
                startPage = 1
                endPage = maxVisiblePages
            } else if (currentPage + 1 >= totalPages) {
                startPage = totalPages - maxVisiblePages + 1
                endPage = totalPages
            } else {
                startPage = currentPage - 1
                endPage = currentPage + 1
            }
        }

        // Add ellipsis if necessary
        if (startPage > 1) {
            range.push(1)
            if (startPage > 2) range.push('...')
        }
        for (let i = startPage; i <= endPage; i++) {
            range.push(i)
        }
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) range.push('...')
            range.push(totalPages)
        }

        return range
    }

    const pageNumbers = getPaginationRange()

    const populateItem = ((i: number, h: any, item: any) => {

        const className = `p-3 font-semibold ${h.customValueClass ? h.customValueClass : ''} ${isCentered ? 'text-center' : ''}`
        let value = item[h.key]

        if (h.concatKey) {
            h.concatKey.forEach((concateKeyIndex: any) => {
                value = `${value} ${item[concateKeyIndex]}`
            })
        }

        return <td key={`row-key-${h.key}-${i}`} className={className}>{h.format ? h.format(value) : value}</td>
    })

    return (
        <div className="justify-between">
            <table className="table-auto w-full">
                <thead>
                    <tr>
                        {headers.map(h => (
                            <th key={`h-${h.key}`} className="bg-green text-[12px] text-black font-semibold p-3">
                                {h.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {paginatedItems.map((item: any, i) => (
                        <tr key={`key-${item[primaryId]}-${i}`} className="even:bg-gray13 odd:bg-cursedBlack text-xs">
                            {headers.map(h => populateItem(i, h, item))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="flex justify-end gap-2 mt-4">
                <button onClick={handlePrevious} disabled={currentPage === 1} className="hover:bg-[#3A3A3A] hover:text-white bg-[#080808] border border-[#3A3A3A] text-[#C4CDD5] py-2 px-4 rounded">
                    &lt;
                </button>

                {pageNumbers.map((number, index) => (
                    <button
                        key={`pg-num-${number}-${index}`}
                        onClick={() => {
                            if (typeof number === 'number') {
                                handlePageClick(number)
                            }
                        }}
                        className={`py-2 px-4 rounded border border-[#3A3A3A] hover:bg-[#3A3A3A] hover:text-white ${currentPage === number ? 'bg-[#3A3A3A] text-white' : 'bg-[#080808] text-[#C4CDD5]'}`}
                        disabled={typeof number === 'string'} // Disable button for ellipses
                    >
                        {number}
                    </button>
                ))}

                <button onClick={handleNext} disabled={currentPage === totalPages} className="hover:bg-[#3A3A3A] hover:text-white bg-[#080808] border border-[#3A3A3A] text-[#C4CDD5] py-2 px-4 rounded">
                    &gt;
                </button>
            </div>
        </div>
    )
}

export default Tables
