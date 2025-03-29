import { v4 as uuidv4 } from 'uuid';


const formatMoney = (value: string) => {

    const numValue = parseFloat(value)

    if (isNaN(numValue)) {
        return formatter.format(0).replace("PHP", '').trim()
    }

    return formatter.format(numValue).replace("PHP", '').trim()
}

const formatNumber = (input: number | string): string => {
    const num = typeof input === "string" ? parseInt(input.replace(/,/g, "")) : input
    return num.toLocaleString()
}

const formatDate = (date: string) => {
    date = date.replaceAll('-', '').replace('T', '').replaceAll(':', '').split('.')[0]
    return date
}


const formatter = new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    currencyDisplay: 'code'
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

const formatDynamicNumber = (input: string | number): string => {
    // Convert input to a string if it's a number
    const inputStr = input.toString();

    // Clean any non-numeric characters
    const cleanedInput = inputStr.replace(/\D/g, '');

    // Split the string into chunks of 4 digits
    const chunks: string[] = [];
    for (let i = 0; i < cleanedInput.length; i += 4) {
        chunks.push(cleanedInput.substring(i, i + 4));
    }

    // Join the chunks with hyphens
    return chunks.join('-');
}

function guidToNumber(): number {
    const guid = uuidv4(); // Generate a UUID string
    const numericPart = guid.replace(/[^0-9]/g, ''); // Remove non-numeric characters
    return parseInt(numericPart.substring(0, 15), 10); // Take the first 15 digits and convert to number
}

const renderNestedDetails = (val: any) => {
    if (typeof val === 'string') {
        return val; // If action is a string, just return it
    }

    if (typeof val === 'object') {
        return Object.entries(val).map(([key, value]) => (
            <div key={key}>
                <strong>{key}:</strong> {typeof value === 'object' ? renderNestedDetails(value) : String(value || '')}
            </div>
        ));
    }
}



export {
    formatMoney,
    formatDate,
    insertDecimalAtThirdToLast,
    removeDecimalPlaces,
    formatDynamicNumber,
    guidToNumber,
    formatNumber,
    renderNestedDetails
}