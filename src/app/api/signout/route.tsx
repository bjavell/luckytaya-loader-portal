import { clearSession } from "@/context/auth";
import { NextApiRequest } from "next";
import { NextResponse } from "next/server";

const POST = async (req: NextApiRequest) => {

    await clearSession()

    return NextResponse.json({})
    // res.setHeader("set-cookie", `session=; path=/; samesite=lax; httponly;`)
    // res.status(200).json({})
}

export {
    POST
}
