import { getCurrentSession } from "@/context/auth";
import { luckTayaAxios } from "@/util/axiosUtil";
import { formatGenericErrorResponse } from "@/util/commonResponse";
import { decrypt } from "@/util/cryptoUtil";
import { getToken } from "@/util/generator";
import { NextRequest, NextResponse } from "next/server";
import nodemailer from 'nodemailer'

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

        const registerResponse = await luckTayaAxios.post('/api/v1/User/Register', { ...request, password: generatedPassword })

        const { accountNumber, userId } = registerResponse.data

        const updateAccount = {
            roles: request.roles,
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

        await sendEmail(request.email, request.username, generatedPassword)

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