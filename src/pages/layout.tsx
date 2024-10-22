import NavBar from "@/components/navBar"
import SideBar from "@/components/sideBar"
import Head from "next/head"
import { useRouter } from "next/router"
import { ReactNode } from "react"
import Image from "next/image"
import loginBG from '@/public/images/login-bg.svg'

const DashboardLayout: React.FC<{ children: ReactNode, title: string }> = ({ children, title }) => {
    const router = useRouter()

    console.log(router)


    return (
        <div className="text-neutralGray">
            <Head>
                <title>{title}</title>
            </Head>
            <div className="flex flex-row grow">
                <SideBar />
                <main className="w-full flex flex-col">
                    <NavBar />
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



export default DashboardLayout