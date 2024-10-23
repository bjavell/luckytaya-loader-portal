import { decrypt } from "@/util/cryptoUtil"
import axios from "axios"
import type { NextApiRequest, NextApiResponse } from "next"
import { Agent } from "https"
import { setSession } from "@/context/auth"

const SESSION_COOKIE_NAME = 'session'

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    console.log(req.method)

    if (req.method !== 'POST') {
        res.status(405).json({
            error: [{
                '01': 'Method Not Allowed'
            }]
        })
    }

    const request = {
        username: req.body.username,
        password: decrypt(req.body.password)
    }

    console.log('path', `${process.env.BASE_URL}/api/v1/User/Login`, request)


    const httpsAgent = new Agent({
        rejectUnauthorized: false,
        host: '161.49.111.17',
        port: 1443,
        path: '/'
    })

    await axios.post(`${process.env.BASE_URL}/api/v1/User/Login`, request, { httpsAgent })
        .then(response => {
            setSession(response.data)
            res.status(200).json(response.data)
        }).catch(e => {
            console.log(e.response.data)
            res.status(500).json({
                error: e.response.data.errors
            })
        })
}

export default handler