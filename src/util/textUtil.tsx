const formatMoney = (value: string) => {

    const numValue = parseFloat(value)

    if (isNaN(numValue)) {
        return formatter.format(0)
    }

    return formatter.format(numValue)
}


const formatDate = (date: string) => {
    date = date.replaceAll('-', '').replace('T', '').replaceAll(':', '').split('.')[0]
    return date
}


const formatter = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
})


export {
    formatMoney,
    formatDate
}