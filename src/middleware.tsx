import axios from "axios";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentSession, setSession } from "./context/auth";

const middleware = async (request: NextRequest) => {
    const { pathname } = request.nextUrl

    const currentSession = getCurrentSession()
    console.log(request.cookies)
    console.log(currentSession)

    // const cookieStore = cookies()

    // console.log(request.method)
    // console.log(pathname)

    // if (request.method === 'POST' && pathname === '/api/signin') {
    //     const httpsAgent = new Agent({
    //         rejectUnauthorized: false,
    //         host: '161.49.111.17',
    //         port: 1443,
    //         path: '/'
    //     })

    //     await axios.post(`${process.env.BASE_URL}/api/v1/User/Login`, request, { httpsAgent })
    //         .then(response => {
    //             setSession(response.data)
    //             return NextResponse.json(response.data)
    //         }).catch(e => {
    //             return NextResponse.json({ error: e.response.data.errors }, { status: 500 })
    //         })
    // }

    // const currentSession = getCurrentSession()
    // const isProtectedPath = request.nextUrl.pathname.startsWith('/dashboard') || request.nextUrl.pathname.startsWith('/history') || request.nextUrl.pathname.startsWith('/players');

    // if (!currentSession && isProtectedPath) {
    //     console.log('here')
    //     console.log(currentSession)
    //     return NextResponse.redirect(new URL('/login', request.url))
    // }


    return NextResponse.next()
}

const config = {
    matcher: ['/dashboard/*', '/history/*', '/players/*']

}

export {
    middleware,
    config
}