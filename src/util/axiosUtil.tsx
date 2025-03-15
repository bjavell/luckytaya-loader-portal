import logger from "@/lib/logger";
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


const otsEngine: AxiosInstance = axios.create({
    headers: {
        'Content-Type': 'application/json'
    }
})





const luckTayaMainAxios: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKOFFICE_BASEURL,
    headers: {
        'Content-Type': 'application/json'
    },
    httpsAgent: new Agent({
        rejectUnauthorized: false
    })
})


const starpayAxios: AxiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BASE_URL_STARPAY
})



luckTayaAxios.interceptors.response.use(
    (config) => {
        const correlationId = config.config.headers.get('x-correlation-id')
        let logRequest

        const requestData = config.config.data

        if (requestData) {
            logRequest = JSON.parse(requestData)
            if (logRequest) {
                if (logRequest.password) {
                    logRequest.password = 'XXXXXX'
                }
            }
        }

        const responseData = {
            ...config.data
        }

        if (responseData) {
            if (responseData.token) {
                responseData.token = 'XXXXXX'
            }
        }

        logger.info('GAME ENGINE REQUEST RESPONSE', {
            correlationId,
            url: config.config.url,
            uri: config.config.params,
            method: config.config.method,
            request: logRequest,
            response: responseData
        })

        return config;
    },
    (error) => {
        const correlationId = error.config.headers.get('x-correlation-id')
        let logRequest

        const requestData = error.config.data

        if (requestData) {
            logRequest = JSON.parse(requestData)
            if (logRequest) {
                if (logRequest.password) {
                    logRequest.password = 'XXXXXX'
                }
            }
        }

        logger.info('GAME ENGINE REQUEST RESPONSE', {
            correlationId,
            url: error.config.url,
            uri: error.config.params,
            method: error.config.method,
            request: logRequest,
            response: error.response.data
        })
        return Promise.reject(error);
    }
);



otsEngine.interceptors.response.use(
    (config) => {
        const correlationId = config.config.headers.get('x-correlation-id')
        let logRequest

        const requestData = config.config.data

        if (requestData) {
            logRequest = JSON.parse(requestData)
            if (logRequest) {
                if (logRequest.password) {
                    logRequest.password = 'XXXXXX'
                }
            }
        }

        const responseData = {
            ...config.data
        }

        if (responseData) {
            if (responseData.token) {
                responseData.token = 'XXXXXX'
            }
        }

        logger.info('OTS GAME ENGINE REQUEST RESPONSE', {
            correlationId,
            url: config.config.url,
            uri: config.config.params,
            method: config.config.method,
            request: logRequest,
            response: responseData
        })

        return config;
    },
    (error) => {
        const correlationId = error.config.headers.get('x-correlation-id')
        let logRequest

        const requestData = error.config.data

        if (requestData) {
            logRequest = JSON.parse(requestData)
            if (logRequest) {
                if (logRequest.password) {
                    logRequest.password = 'XXXXXX'
                }
            }
        }

        logger.info('GAME ENGINE REQUEST RESPONSE', {
            correlationId,
            url: error.config.url,
            uri: error.config.params,
            method: error.config.method,
            request: logRequest,
            response: error.response.data
        })
        return Promise.reject(error);
    }
);




// localAxios.interceptors.response.use(
//     (config) => {
//         const correlationId = config.config.headers.get('x-correlation-id')
//         let logRequest

//         const requestData = config.config.data

//         if (requestData) {
//             logRequest = JSON.parse(requestData)
//             if (logRequest) {
//                 if (logRequest.password) {
//                     logRequest.password = 'XXXXXX'
//                 }
//             }
//         }

//         const responseData = {
//             ...config.data
//         }

//         if (responseData) {
//             if (responseData.token) {
//                 responseData.token = 'XXXXXX'
//             }
//         }

//         logger.info('LUCKYTAYA REQUEST RESPONSE', {
//             correlationId,
//             url: config.config.url,
//             method: config.config.method,
//             request: logRequest,
//             response: responseData
//         })

//         return config;
//     },
//     (error) => {
//         const correlationId = error.config.headers.get('x-correlation-id')
//         let logRequest

//         const requestData = error.config.data

//         if (requestData) {
//             logRequest = JSON.parse(requestData)
//             if (logRequest) {
//                 if (logRequest.password) {
//                     logRequest.password = 'XXXXXX'
//                 }
//             }
//         }

//         logger.info('LUCKYTAYA REQUEST RESPONSE', {
//             correlationId,
//             url: error.config.url,
//             // uri: error.config
//             method: error.config.method,
//             request: logRequest,
//             response: error.response.data
//         })
//         return Promise.reject(error);
//     }
// );


export {
    luckTayaAxios,
    starpayAxios,
    luckTayaMainAxios,
    otsEngine
}