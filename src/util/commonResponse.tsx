const formatGenericErrorResponse = (response:any) => {

    return response.response?.data?.errors || { 'Unexpected Error': ['Oops! something went wrong'] }
}

export {
    formatGenericErrorResponse
}