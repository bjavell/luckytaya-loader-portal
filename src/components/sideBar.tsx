import Link from "next/link"
import { usePathname } from "next/navigation"
import { useRouter } from "next/router"
import logo from '@/assets/images/logo-1.svg'
import Image from "next/image"
import Dashboard from '@/assets/images/Dashboard.svg'
import CashOut from '@/assets/images/CashOut.svg'
import Commission from '@/assets/images/Commission.svg'
import ActivePlayer from '@/assets/images/ActivePlayer.svg'
import DeactPlayer from '@/assets/images/DeactPlayer.svg'
import LoadStation from '@/assets/images/LoadStation.svg'
import Transfer from '@/assets/images/Transfer.svg'
import Logout from '@/assets/images/Logout.svg'

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
        ico: Dashboard,
        link: '/dashboard'
    }]

}, {
    module: 'PLAYERS',
    item: [{
        module: 'Active Players',
        ico: ActivePlayer,
        link: '/players/active'
    }, {
        module: 'Deact Players',
        ico: DeactPlayer,
        link: '/players/deact'
    }]

}, {
    module: 'LOADING STATION',
    item: [{
        module: 'Load Station',
        ico: LoadStation,
        link: '/loading-station/load'
    }, {
        module: 'Cash-Out',
        ico: CashOut,
        link: '/loading-station/cash-out'
    }]

}, {
    module: 'HISTORY',
    item: [{
        module: 'Transfer',
        ico: Transfer,
        link: '/history/transfer'
    }, {
        module: 'Commission',
        ico: Commission,
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

const SideBar = () => {
    const router = useRouter()
    const currentRoute = usePathname()

    return (
        <div className="flex flex-col w-[232px] grow ">
            <div className="flex brand w-[232px] h-[181px] bg-black"> <Image src={logo} alt="" className="m-auto" priority={false} /> </div>
            <div className="flex grow bg-darkGrey justify-center">
                <ul className="flex flex-col w-full">
                    <li className="flex bg-cursedBlack h-11 mb-4">
                        <div className="font-sans m-auto">
                            Agent Portal
                        </div>
                    </li>
                    {sideBarRoutes.map(__routes => populateRoutes(__routes, currentRoute))}
                    <li className="px-4 flex flex-col">
                        <Link href={'/login'} className="p-4 text-red hover:bg-cursedBlack hover:rounded-xlg hover:text-[#E7DE54] flex gap-2" >
                            <Image src={Logout} alt="" className={`h-4 w-auto my-auto`} /> Logout</Link>
                    </li>
                </ul>
            </div>

        </div>
    )
}

export default SideBar