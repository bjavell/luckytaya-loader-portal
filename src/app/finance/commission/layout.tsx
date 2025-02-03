import CommonLayout from "@/app/layout/commonLayout"
import { Metadata } from "next"
import { ReactNode } from "react"

const DashboardLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <CommonLayout  slug="COMMISSION">
            {children}
        </CommonLayout>
    )
}

export default DashboardLayout

export const metadata: Metadata = {
    title: 'Commission'
}