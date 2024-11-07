'use client'

import NavBar from "@/components/navBar"
import SideBar from "@/components/sideBar"
import { ReactNode } from "react"
import Image from "next/image"
import loginBG from '@/assets/images/login-bg.svg'

const CommonLayout: React.FC<{ children: ReactNode, slug: string }> = ({ children, slug }) => {
    return (
        <div className="text-neutralGray">
            <div className="flex">
                <SideBar />
                <main className="w-full flex flex-col max-h-screen">
                    <NavBar slug={slug} />
                    <div className="flex relative bg-black w-full h-screen">
                        <Image src={loginBG} alt="" className="object-cover w-full h-full mix-blend-luminosity relative opacity-10" priority={false} />
                        <div className="absolute inset-0 flex z-10 py-10 px-14">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}
export default CommonLayout