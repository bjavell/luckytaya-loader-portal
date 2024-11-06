import axios, { AxiosInstance } from "axios"
import { Agent } from "https"

const luckTayaAxios: AxiosInstance = axios.create({
    baseURL: process.env.LUCKY_TAYA_BASE_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    httpsAgent: new Agent({
        rejectUnauthorized: false
    })
})

const starpayAxios: AxiosInstance = axios.create({
    baseURL: process.env.STARPAY_BASE_URL
})


export {
    luckTayaAxios,
    starpayAxios
}