import { useApiData } from "@/app/context/apiContext";
import { NextPage } from "next"
import { useEffect, useState } from "react";

interface NavBarProps {
    slug?: string
}


const NavBar: NextPage<NavBarProps> = (props) => {
    const { slug } = props
    const { data,  } = useApiData();
    const [title, setTitle] = useState("Loader Portal")
    useEffect(() => {
        if (data) {
            if(data.accountType == 9)
                setTitle("Event Manager Portal")
        }
    }, [data])
    return (
        <div className="min-h-[181px] w-full bg-cursedBlack flex px-14">
            <div className="flex flex-col my-auto">
                <div className="flex text-xl gap-2">
                    <span>{title}</span>
                    <span className="text-[#73984F]">/ {slug}</span>
                </div>
                <div className="flex text-yellow text-base font-bold">Dashboard</div>
            </div>
        </div>
    )
}

export default NavBar