const getStartOfWeek = (date: Date) => {
    const day = date.getDay()
    const diff = (day + 6) % 7
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - diff) 
    startOfWeek.setHours(0, 0, 0, 0)
    return startOfWeek
}

export {
    getStartOfWeek
}