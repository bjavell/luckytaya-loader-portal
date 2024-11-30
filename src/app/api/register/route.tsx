import { DB_COLLECTIONS, QR_TRANSACTION_STATUS } from "@/classes/constants";
import CustomError from "@/classes/customError";
import { getCurrentSession } from "@/context/auth";
import { luckTayaAxios } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";
import { decrypt, encrypt } from "@/util/cryptoUtil";
import { insert } from "@/util/dbUtil";
import { getToken } from "@/util/generator";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from 'nodemailer'
import { type } from "os";
import { comment } from "postcss";

const tempPassword = process.env.TEMP_PASSWORD


const sendEmail = async (recipient: string, username: string, password: string) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: decrypt(process.env.SMTP_PASSWORD ?? '')
        }
    })

    const mailOptions = {
        from: process.env.GMAIL_USER,  // Sender's email
        to: recipient,  // Receiver's email
        subject: '[DEV] LuckyTaya Registration!',  // Subject
        text: `Please use this credential for your login. [URL: http://136.158.92.61:6001/login ] [ USERNAME: ${username} ] [ PASSWORD: ${password} ]`
    }

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log('Error occurred: ', error);
        }
        console.log('Email sent: ' + info.response);
    })
}

const POST = async (req: NextRequest) => {
    try {

        const request = await req.json()
        const currentSession = await getCurrentSession()

        const generatedPassword = getToken(8)


        const mgmtUsersResponse = await luckTayaAxios.get(`/api/v1/User/MgmtRole`, {
            headers: {
                'Authorization': `Bearer ${currentSession.token}`,
            },
        })

        const mgmtUsersResponseData = mgmtUsersResponse.data
        let hasMasterAccount

        if (Number(request.accountType) === Number(6)) {
            hasMasterAccount = mgmtUsersResponseData.filter((e: any) => {
                return Number(e.accountNumber) === Number(request.masterAgentAccountNumber)
            })

        }

        if ((hasMasterAccount?.length > 0 && Number(request.accountType) === Number(6)) || Number(request.accountType) !== Number(6)) {
            const registerResponse = await luckTayaAxios.post('/api/v1/User/Register', { ...request, password: generatedPassword })

            const { accountNumber, userId } = registerResponse.data

            let roles = ['']

            if (request.accountType === '3' || request.accountType === '6') {
                roles = ['acctmgr']
            } else if (request.accountType === '4' || request.accountType === '5') {
                roles = ['eventmgr']
            } else if (request.accountType === '1') {
                roles = ['finance']
            }

            const updateAccount = {
                roles: roles,
                accountNumber,
                userId,
                suspended: 0,
                accountType: request.accountType
            }

            await luckTayaAxios.put('/api/v1/User/UserRoleAccountTypeUpdate', updateAccount, {
                headers: {
                    'Authorization': `Bearer ${currentSession.token}`,
                },
            })

            // await insert(DB_COLLECTIONS.TAYA_AGENTS, {
            //     request,
            //     response: registerResponse.data
            // })

            await sendEmail(request.email, request.username, generatedPassword)
        } else {
            throw new CustomError('Bad request', {
                'Bad request': [`Master Agent Account '${request.masterAgentAccountNumber}' not found.`]
            })
        }



        return NextResponse.json({ 'message': 'User succesffully created' })
    } catch (e: any) {
        console.error(e)
        console.log(e?.response?.data)

        return NextResponse.json({
            error: formatGenericErrorResponse(e)
        },
            { status: 500 })
    }
}

export {
    POST
}