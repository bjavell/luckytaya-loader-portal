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

const insertDecimalAtThirdToLast = (str: string | number) => {

    str = String(str)
    if (str.length < 3) {
        return str
    }
    const beforeDecimal = str.slice(0, str.length - 2)
    const afterDecimal = str.slice(str.length - 2)
    return beforeDecimal + '.' + afterDecimal
}

const removeDecimalPlaces = (amount: string) => {
    return `${(Number.parseFloat(amount)).toFixed(2)}`.replaceAll(",", "").replace(".", "")
}


export {
    formatMoney,
    formatDate,
    insertDecimalAtThirdToLast,
    removeDecimalPlaces
}