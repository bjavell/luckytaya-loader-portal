import { useApiData } from "@/app/context/apiContext";
import { NextPage } from "next"
import { useEffect, useState } from "react";

interface NavBarProps {
    slug?: string,
    toggleSidebar: () => void
}


const NavBar: NextPage<NavBarProps> = (props) => {
    const { slug, toggleSidebar } = props
    const { data, } = useApiData();
    const [title, setTitle] = useState("Agent Portal")
    useEffect(() => {
        if (data) {
            if (data.accountType == 9 && data.roles?.includes('eventmgr'))
                setTitle("Event Manager Portal")
            else if (data.accountType == 9 && data.roles?.includes('admin'))
                setTitle("Admin Portal")
            else if (data.accountType === 2 && data.roles?.includes('acctmgr'))
                setTitle("Master Agent Portal")
        }
    }, [data])
    return (
        <div className="min-h-28 lg:min-h-32 w-full bg-cursedBlack flex px-14">
            <div className="flex flex-col my-auto">
                <div className="flex text-sm lg:text-xl gap-2">
                    <span>{title}</span>
                    <span className="text-[#73984F]">/ {slug}</span>
                </div>
                <div className="flex text-yellow text-base font-bold">Dashboard</div>
            </div>
        </div>
    )
}

export default NavBar