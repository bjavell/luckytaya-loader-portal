import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import logo from '@/assets/images/logo-1.svg'
import Image from "next/image"
import Logout from '@/assets/images/Logout.svg'
import { ReactNode, SetStateAction, useEffect, useState } from "react"
import axios from "axios"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { getCurrentSession } from "@/context/auth"
import UserAvatar from '@/assets/images/Avatar.svg'
import { useApiData } from "@/app/context/apiContext"
import { sideBarEventRoutes, sideBarAgentRoutes, sideBarMasterRoutes, sideBarAdminRoutes, sideBarMainMasterRoutes, sideBarFinanceRoutes, sideBarDeclaratorRoutes } from "@/classes/routes"
import { localAxios } from "@/util/localAxiosUtil"

interface SideBarRoutesProps {
    module?: string,
    item?: SideBarRoutesProps[],
    ico?: string,
    link?: string
}

const populateRoutes = (routes: SideBarRoutesProps, currentRoute: string) => {
    return (
        <li key={routes.module} className="px-4 py-2 flex flex-col">
            <span className="pb-2">{routes.module}</span>
            {/* {routes.link ? <Link href={routes.link} className={`${currentRoute === routes.link ? 'bg-cursedBlack' : ''} h-full w-full rounded `}>{routes.module}</Link> : routes.module} */}
            <div className="flex flex-col gap-2">

                {
                    routes.item ?
                        // <ul className="flex flex-col">
                        routes.item?.map(e => populateItems(e, currentRoute))
                        :
                        <></>
                }
            </div>

        </li>
    )
}

const populateItems = (item: SideBarRoutesProps, currentRoute: string) => {
    return (
        <Link
            key={item.module}
            href={item.link ?? '/'}
            className={`${currentRoute === item.link ? 'bg-cursedBlack rounded-xlg text-[#E7DE54]' : ''} p-4 hover:bg-cursedBlack hover:rounded-xlg hover:text-[#E7DE54] flex gap-2`}
        >
            {item.ico ? <Image src={item.ico} alt="" className={`h-4 w-auto my-auto`} /> : ''}
            {item.module}
        </Link>
    )
}

const onHandleLogout = async (router: AppRouterInstance | string[], setIsLoading: { (value: SetStateAction<boolean>): void; (arg0: boolean): void }) => {
    await localAxios.post('/api/signout', {})
        .then(response => {
            router.push('/login')
        })
        .catch(e => {
            const errorMessages = e.response.data.error

        })
        .finally(() => {
            setIsLoading(false)
        })
}

const SideBar: React.FC<{ isOpen: boolean, toggleSideBar: () => void }> = (props) => {

    const { isOpen, toggleSideBar } = props

    const router = useRouter()
    const currentRoute = usePathname() ?? ''
    const [isLoading, setIsLoading] = useState(false)
    const [name, setName] = useState('')
    const { data, loading, error } = useApiData();
    const [routes, setRoutes] = useState<any>([])
    const [sideBarSlug, setSideBarSlug] = useState('')

    useEffect(() => {
        if (data) {
            setName(`${data?.firstName} ${data?.lastName}`)
            if (data.role?.includes('admin')) {
                setSideBarSlug('Admin Portal')
                setRoutes(sideBarAdminRoutes)
            } else if (data.role?.includes('eventmgr')) {
                setSideBarSlug('Event Manager')
                setRoutes(sideBarEventRoutes)
            } else if (data.role?.includes('master')) {
                setSideBarSlug('Main Master Agent Portal')
                setRoutes(sideBarMainMasterRoutes)
            } else if (data.role?.includes('acctmgr')) {
                setSideBarSlug('Master Agent Portal')
                setRoutes(sideBarMasterRoutes)
            } else if (data.role?.includes('finance')) {
                setSideBarSlug('Finance Portal')
                setRoutes(sideBarFinanceRoutes)
            } else if (data.role?.includes('acctmgr')) {
                setSideBarSlug('Agent Portal')
                setRoutes(sideBarAgentRoutes)
            } else if (data.role?.includes('eventmgr')) {
                setSideBarSlug('Declarator Portal')
                setRoutes(sideBarDeclaratorRoutes)
            }
        }
    }, [data])

    return (
        <aside className={`bg-darkGrey flex flex-col lg:block w-56 h-screen top-0 fixed z-10 text-sm lg:text-base transform transition-transform ease-in-out duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 `}>
            <div className="flex brand w-56 h-24 lg:h-32 bg-black relative justify-center items-center">
                <div className="absolute top-5 -right-10 flex sm:block lg:hidden">
                    <button className="rounded-full p-1 bg-cursedBlack border-white border-1 transform transition-transform ease-in-out duration-300" onClick={toggleSideBar}> {isOpen ? 'X' : '☰'}</button>
                </div>
                <Image src={logo} alt="" priority={false} />
            </div>
            <div className="flex flex-col h-2/3 overflow-auto">
                <ul className="flex flex-col w-full">
                    <li className="flex bg-cursedBlack mb-4 font-sans justify-center min-h-11 items-center">
                        {sideBarSlug}
                    </li>
                    {routes?.map((__routes: any) => populateRoutes(__routes, currentRoute))}
                    <li className="px-4 flex flex-col" >
                        <button onClick={() => onHandleLogout(router, setIsLoading)} className="p-4 text-red hover:bg-cursedBlack hover:rounded-xlg hover:text-[#E7DE54] flex gap-2" >
                            <Image src={Logout} alt="" className={`h-4 w-auto my-auto`} /> Logout</button>
                    </li>
                </ul>
            </div>
            <div className="bg-gray13 w-full h-24 flex">
                <div className="flex justify-center items-center m-auto w-full h-full flex-col gap-2">
                    <Link href={"/profile/edit"}  >
                        <Image src={UserAvatar} alt="avatar" className="h-7 lg:h-14 w-7 lg:w-14" />
                    </Link>
                    {name}
                </div>
            </div>

        </aside>
    )
}

export default SideBar