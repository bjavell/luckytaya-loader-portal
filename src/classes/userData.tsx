interface UserData {
    accountNumber: number,
    accountType: number,
    accountStatus: number,
    accountBalance: number,
    username: string
    firstName: string
    lastName: string
    mobile: string
    email: string
    facebookAccount: string
    referralCode: number,
    userId: number,
    suspended: number,
    image?: string,
    status?: string,
    walletId: number
    // roles: string[]
}

export default UserData