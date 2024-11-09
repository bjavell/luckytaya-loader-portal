import { clearSession } from "@/context/auth"
import { NextRequest, NextResponse } from "next/server"

const POST = async (req: NextRequest) => {

    await clearSession()

    return NextResponse.json({})
    // res.setHeader("set-cookie", `session=; path=/; samesite=lax; httponly;`)
    // res.status(200).json({})
}

export {
    POST
}
