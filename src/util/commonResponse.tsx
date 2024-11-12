const formatGenericErrorResponse = (response:any) => {

    return response.response?.data?.errors || { 'Unexpexted Error': ['Oops! something went wrong'] }
}

export {
    formatGenericErrorResponse
}