import { NextPage } from "next"

interface NavBarProps {
    slug?: string
}


const NavBar: NextPage<NavBarProps> = (props) => {
    const { slug } = props
    return (
        <div className="min-h-[181px] w-full bg-cursedBlack flex px-14">
            <div className="flex flex-col my-auto">
                <div className="flex text-xl gap-2">
                    <span>Loader Portal</span>
                    <span className="text-[#73984F]">/ {slug}</span>
                </div>
                <div className="flex text-yellow text-base font-bold">Dashboard</div>
            </div>
        </div>
    )
}

export default NavBar