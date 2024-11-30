'use client'

import NavBar from "@/components/navBar"
import SideBar from "@/components/sideBar"
import { ReactNode, Suspense, useState } from "react"
import Image from "next/image"
import loginBG from '@/assets/images/login-bg.svg'
import { ApiProvider } from "../context/apiContext"

const CommonLayout: React.FC<{ children: ReactNode, slug: string }> = ({ children, slug }) => {
    const [isSideBarOpen, setIsSideBarOpen] = useState(false)

    return (
        <ApiProvider>
            <div className="text-neutralGray">
                <div className="flex relative">
                    <SideBar isOpen={isSideBarOpen} toggleSideBar={() => setIsSideBarOpen(!isSideBarOpen)} />
                    <main className="lg:ml-56 w-full flex flex-col h-dvh">
                        <NavBar slug={slug} toggleSidebar={() => setIsSideBarOpen(!isSideBarOpen)} />
                        <div className="flex relative bg-black w-full h-full overflow-auto">
                            <Image src={loginBG} alt="" className="object-cover w-full h-full mix-blend-luminosity relative opacity-10" priority={false} />
                            <div className="absolute inset-0 flex py-10 px-14 overflow-auto">
                                {children}
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </ApiProvider>
    )
}
export default CommonLayout