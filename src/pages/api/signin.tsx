import { decrypt } from "@/util/cryptoUtil"
import axios from "axios"
import type { NextApiRequest, NextApiResponse } from "next"
import { Agent } from "https"

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    console.log(req.method)

    if (req.method !== 'POST') {
        res.status(405).json({
            error: [{
                '01': 'Method Not Allowed'
            }]
        })
    }

    const request = {
        username: req.body.username, password: decrypt(req.body.password)
    }

    console.log('path', `${process.env.BASE_URL}/api/v1/User/Login`, request)


    const httpsAgent = new Agent({ rejectUnauthorized: false, host: '161.49.111.17', port: 1443, path: '/' })



    // const resposne = await fetch(`${process.env.BASE_URL}/api/v1/User/Login`, {
    //     body: JSON.stringify(request),
    //     method: 'POST',
    //     headers: {
    //         'accept': 'application/json',
    //         'Content-Type': 'application/json'
    //     },
    //     redirect: "follow"
    // })


    // console.log(resposne)

    return res.status(200).json({
        "username": "player1",
        "firstname": "Juan",
        "lastname": "Dela Cruz",
        "phoneNumber": "12312312312",
        "email": "espaunan@gmail.com",
        "facebookAccount": "player1",
        "referralCode": 0,
        "userId": 201420192,
        "suspended": 0,
        "roles": [],
        "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjIwMTQyMDE5MiIsIm5hbWUiOiJwbGF5ZXIxIiwianRpIjoieDdGQ3paWlY3RVNtQmZOUWpJTkFjQSIsInByIjoiMSIsImV4cCI6MTcyOTYyNDUzMSwiaXNzIjoiU2Fib25nU3ZTZXJ2ZXIiLCJhdWQiOiJTYWJvbmdTdlNlcnZlciJ9.lR9-8p_aqEk87LYiZ_L9o5v_w7fDoSSJfOjYOcPIA2M",
        "accountNumber": 6112022014001065,
        "accountType": 8,
        "accountStatus": 1,
        "accountBalance": 5430.00
    })
    // await axios.post(`${process.env.BASE_URL}/api/v1/User/Login`, request, {  })
    //     .then(response => {
    //         console.log(response)
    //         res.status(200).json(response)
    //     }).catch(e => {
    //         console.error(e)
    //         res.status(500).json({
    //             error: [{
    //                 '01': 'Oops! something went wrong'
    //             }]
    //         })
    //     })


}

export default handler