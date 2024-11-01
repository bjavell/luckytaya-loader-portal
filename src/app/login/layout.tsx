import Head from "next/head"
import Image from "next/image"
import { ReactNode } from "react"
import loginBG from '@/assets/images/login-bg.svg'
import logo from '@/assets/images/logo-1.svg'
import { Metadata } from "next";


const Layout: React.FC<{ children: ReactNode }> = ({ children }) => {

    return (
        <div className="h-screen flex">
            <Head>
                <title>Login</title>
            </Head>
            <main>
                <div className="flex flex-row h-screen w-screen bg-gray13">
                    <div className="w-1/2 flex items-center justify-center bg-black">
                        <Image src={loginBG} alt="" className="object-cover w-full h-full mix-blend-luminosity relative opacity-10" priority={false} />
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                            <Image src={logo} alt="" className="h-1/4 w-2/4" priority={false} />
                        </div>
                    </div>
                    <div className="w-1/2 flex items-center justify-center p-4">
                        {children}
                    </div>
                </div>
            </main>
        </div>
    )

}

export const metadata : Metadata = {
    title: 'Login'
}

export default Layout