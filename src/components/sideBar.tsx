import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRouter } from "next/router"
import logo from '@/public/images/logo-1.svg'
import Image from "next/image"

interface SideBarRoutesProps {
    module?: string,
    item?: SideBarRoutesProps[],
    ico?: string,
    link?: string
}

const sideBarRoutes = [{
    module: 'GENERAL',
    item: [{
        module: 'Dashboard',
        ico: '',
        link: '/dashboard'
    }]

}, {
    module: 'PLAYERS',
    item: [{
        module: 'Active Players',
        ico: '',
        link: '/players/active'
    }, {
        module: 'Deact Players',
        ico: '',
        link: '/players/deact'
    }]

}, {
    module: 'LOADING STATION',
    item: [{
        module: 'Load Station',
        ico: '',
        link: '/loading/station'
    }, {
        module: 'Cash-Out',
        ico: '',
        link: '/loading/cashOut'
    }]

}, {
    module: 'HISTORY',
    item: [{
        module: 'Transfer',
        ico: '',
        link: '/history/transfer'
    }, {
        module: 'Commission',
        ico: '',
        link: '/history/commission'
    }]

}]

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
        <Link key={item.module} href={item.link ?? '/'} className={`${currentRoute === item.link ? 'bg-cursedBlack rounded-xlg text-[#E7DE54]' : ''} p-4 hover:bg-cursedBlack hover:rounded-xlg hover:text-[#E7DE54]`} >{item.module}</Link>
    )
}

const SideBar = () => {
    const router = useRouter()
    const currentRoute = usePathname()

    return (
        <div className="flex flex-col w-[232px] grow ">
            <div className="flex brand w-[232px] h-[181px] bg-semiBlack"> <Image src={logo} alt="" className="m-auto" priority={false} /> </div>
            <div className="flex grow bg-darkGrey justify-center">
                <ul className="flex flex-col w-full">
                    <li className="flex bg-cursedBlack h-11 mb-4">
                        <div className="font-sans m-auto">
                            Agent Portal
                        </div>
                    </li>
                    {sideBarRoutes.map(__routes => populateRoutes(__routes, currentRoute))}
                    <li className="px-4 flex flex-col"> <Link href={'/login'} className="p-4 text-red hover:bg-cursedBlack hover:rounded-xlg hover:text-[#E7DE54]" > Logout</Link></li>
                </ul>
            </div>

        </div>
    )
}

export default SideBar