import axios from "axios"
import type { NextApiRequest, NextApiResponse } from "next"
import { Agent } from "https"
// import { setSession } from "@/context/auth"

const SESSION_COOKIE_NAME = 'session'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    console.log(req.method)
    console.log(req.query)
    const { suspended } = req.query

    if (req.method !== 'GET') {
        res.status(405).json({
            error: [{
                '01': 'Method Not Allowed'
            }]
        })
    }

    console.log('path', `${process.env.BASE_URL}/api/v1/UserAccount/AllPlayerAccount`)


    const httpsAgent = new Agent({
        rejectUnauthorized: false,
        host: '161.49.111.17',
        port: 1443,
        path: '/'
    })

    await axios.get(`${process.env.BASE_URL}/api/v1/UserAccount/AllPlayerAccount`, {
        httpsAgent,
        headers: {
            'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIwMTQyMDA3OCIsIm5hbWUiOiJhZG1pbjEiLCJqdGkiOiJXWTQ0TktTdjAwU0RQVnJZZkducHpRIiwicHIiOiIwIiwicm9sZXMiOiJhZG1pbiIsImV4cCI6MTcyOTY4OTYxMywiaXNzIjoiU2Fib25nU3ZTZXJ2ZXIiLCJhdWQiOiJTYWJvbmdTdlNlcnZlciJ9.CSMEKdFpsMsr-zxpwp5pOOyxDhd342twV-BztNkB5Ps'
        }
    })
        .then(response => {
            const rawData = response.data
            const data = rawData.filter((__rawData: { suspended: number }) => __rawData.suspended === Number(suspended))
            console.log(data)
            res.status(200).json(data)
        }).catch(e => {
            // console.error(e)
            // console.log(e.response)
            res.status(500).json({
                error: e.response.data.errors
            })
        })
}

export default handler