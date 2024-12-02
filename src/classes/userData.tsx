interface UserData {
    accountNumber: number,
    accountType: number,
    accountStatus: number,
    accountBalance: number,
    username: string
    firstname: string
    lastname: string
    phoneNumber: string
    email: string
    facebookAccount: string
    referralCode: number,
    id: number,
    suspended: number,
    image?: string,
    status?: string
    // roles: string[]
}

export default UserData