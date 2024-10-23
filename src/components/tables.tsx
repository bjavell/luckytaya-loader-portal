import { useState } from "react";

interface HeadersProp<T> {
    label?: string;
    key: string;
}

interface TablesProps<T> {
    headers: Array<HeadersProp<T>>;
    items: Array<T>;
    primaryId: string;
}

const Tables = <T extends any>({ headers, items, primaryId }: TablesProps<T>) => {
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;
    const totalPages = Math.ceil(items.length / pageSize);

    const start = (currentPage - 1) * pageSize;
    const end = start + pageSize;
    const paginatedItems = items.slice(start, end);

    const handleNext = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePrevious = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handlePageClick = (page: number) => {
        setCurrentPage(page);
    };

    // Function to generate page numbers with ellipses
    const getPaginationRange = () => {
        const range = [];
        const maxVisiblePages = 3; // Maximum number of page buttons to show
        let startPage: number, endPage: number;

        if (totalPages <= maxVisiblePages) {
            startPage = 1;
            endPage = totalPages;
        } else {
            if (currentPage <= maxVisiblePages) {
                startPage = 1;
                endPage = maxVisiblePages;
            } else if (currentPage + 1 >= totalPages) {
                startPage = totalPages - maxVisiblePages + 1;
                endPage = totalPages;
            } else {
                startPage = currentPage - 1;
                endPage = currentPage + 1;
            }
        }

        // Add ellipsis if necessary
        if (startPage > 1) {
            range.push(1);
            if (startPage > 2) range.push('...');
        }
        for (let i = startPage; i <= endPage; i++) {
            range.push(i);
        }
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) range.push('...');
            range.push(totalPages);
        }

        return range;
    };

    const pageNumbers = getPaginationRange();

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
                        <tr key={`key-${i}-${item[primaryId]}`} className="even:bg-gray13 odd:bg-cursedBlack text-xs">
                            {headers.map(h => (
                                <td key={`row-key-${i}-${item[h.key]}`} className="p-3">{item[h.key]}</td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div className="flex justify-end gap-2 mt-4">
                <button onClick={handlePrevious} disabled={currentPage === 1} className="bg-[#080808] border-[#3A3A3A] text-[#C4CDD5] py-2 px-4 rounded">
                    &lt;
                </button>

                {pageNumbers.map((number, index) => (
                    <button
                        key={index}
                        onClick={() => {
                            if (typeof number === 'number') {
                                handlePageClick(number);
                            }
                        }}
                        className={`py-2 px-4 rounded ${currentPage === number ? 'bg-[#3A3A3A] text-white' : 'bg-[#080808] text-[#C4CDD5]'}`}
                        disabled={typeof number === 'string'} // Disable button for ellipses
                    >
                        {number}
                    </button>
                ))}

                <button onClick={handleNext} disabled={currentPage === totalPages} className="bg-[#080808] border-[#3A3A3A] text-[#C4CDD5] py-2 px-4 rounded">
                    &gt;
                </button>
            </div>
        </div>
    );
};

export default Tables;
