import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import logo from '@/assets/images/logo-1.svg'
import Image from "next/image"
import Logout from '@/assets/images/Logout.svg'
import { SetStateAction, useEffect, useState } from "react"
import axios from "axios"
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime"
import { getCurrentSession } from "@/context/auth"
import UserAvatar from '@/assets/images/UserAvatar.png'
import { useApiData } from "@/app/context/apiContext"
import { sideBarEventRoutes, sideBarAgentRoutes, sideBarMasterRoutes, sideBarAdminRoutes } from "@/classes/routes"

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
    await axios.post('/api/signout', {})
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

const SideBar = () => {
    const router = useRouter()
    const currentRoute = usePathname() ?? ''
    const [isLoading, setIsLoading] = useState(false)
    const [name, setName] = useState('')
    const { data, loading, error } = useApiData();
    const [routes, setRoutes] = useState<any>([])

    useEffect(() => {
        if (data) {
            setName(`${data?.fistname} ${data?.lastname}`)
            if (data.accountType == 9 && data.roles?.includes('admin'))
                setRoutes(sideBarAdminRoutes)
            else if (data.accountType == 9 && data.roles?.includes('eventmgr'))
                setRoutes(sideBarEventRoutes)
            else if (data.accountType === 2 && data.roles?.includes('acctmgr'))
                setRoutes(sideBarMasterRoutes)
            else if (data.accountType === 7) setRoutes(sideBarAgentRoutes)
        }
    }, [data])
    // const getUserDetails = async () => {
    //     await axios.get('/api/get-user-details')
    //         .then(response => {
    //             setName(`${response.data?.fistname} ${response.data?.lastname}`)
    //         })
    //         .catch((e) => {
    //             const errorMessages = e.response.data.error
    //             if (errorMessages) {
    //                 if (errorMessages['Unauthorized']) {
    //                     router.push('/login')
    //                 }
    //             }

    //         })
    //         .finally(() => {
    //         })
    // }

    // useEffect(() => {
    //     getUserDetails()
    // }, [])

    let sideBarSlug

    if (data) {
        if (data.accountType === 9 && data.roles?.includes('admin')) {
            sideBarSlug = 'Admin Portal'
        } else if (data.accountType === 9 && data.roles?.includes('eventmgr')) {
            sideBarSlug = 'Event Manager'
        } else if (data.accountType === 2 && data.roles?.includes('acctmgr')) {
            sideBarSlug = 'Master Agent Portal'
        } else if (data.accountType === 7) {
            sideBarSlug = 'Agent Portal'
        }
    }

    console.log(data)


    return (
        <aside className="flex flex-col w-[232px] h-screen top-0">
            <div className="flex brand w-[232px] min-h-[181px] bg-black"> <Image src={logo} alt="" className="m-auto" priority={false} /> </div>
            <div className="flex h-screen bg-darkGrey justify-center">
                <ul className="flex flex-col w-full">
                    <li className="flex bg-cursedBlack h-11 mb-4">
                        <div className="font-sans m-auto">
                            {sideBarSlug}
                        </div>
                    </li>
                    {routes?.map((__routes: any) => populateRoutes(__routes, currentRoute))}
                    <li className="px-4 flex flex-col" >
                        <button onClick={() => onHandleLogout(router, setIsLoading)} className="p-4 text-red hover:bg-cursedBlack hover:rounded-xlg hover:text-[#E7DE54] flex gap-2" >
                            <Image src={Logout} alt="" className={`h-4 w-auto my-auto`} /> Logout</button>
                    </li>
                    <li className="mt-auto mb-[5.563rem]">
                        <div className="bg-gray13 w-full h-32">
                            <div className="flex justify-center items-center m-auto w-full h-full flex-col gap-2">
                                <Image src={UserAvatar} alt="avatar" className="h-14 w-14" />
                                {name}
                            </div>
                        </div>
                    </li>
                </ul>
            </div>

        </aside>
    )
}

export default SideBar