import { DB_COLLECTIONS } from "@/classes/constants"
import { luckTayaAxios } from "@/util/axiosUtil"
import { decrypt, encrypt } from "@/util/cryptoUtil"
import { findOne, update } from "@/util/dbUtil"

const transferFromMaster = async (amount: number, accountNumber: number, correlationId: string | null) => {

    const request = { amount, toAccountNumber: accountNumber }
    const configQuery = { code: 'CFG0001' }

    const config = await findOne(DB_COLLECTIONS.CONFIG, configQuery)
    if (config) {
        try {
            const masterAuth = decrypt(config.mainMasterAuth)
            await transact(masterAuth, request, correlationId)
        } catch {
            const loginData = await login(config.mainMasterAgentUname, config.mainMasterAgentPword, correlationId)
            await transact(loginData.token, request, correlationId)
            await update(DB_COLLECTIONS.CONFIG, configQuery, { ...config, mainMasterAuth: encrypt(loginData.token) })
        }
    }
}

const login = async (username: string, password: string, correlationId: string | null) => {
    const response = await luckTayaAxios.post('/api/v1/User/login', {
        username,
        password,
    }, {
        headers: {
            "X-Correlation-ID": correlationId,
        }
    })

    return response.data
}

const transact = async (auth: string, transferRequest: any, correlationId: string | null) => {
    const response = await luckTayaAxios.get('/api/v1/Account/transferV2', {
        params: transferRequest,
        headers: {
            "X-Correlation-ID": correlationId,
            'Authorization': `Bearer ${auth}`,
        },
    })

    return response.data
}


export {
    transferFromMaster
}