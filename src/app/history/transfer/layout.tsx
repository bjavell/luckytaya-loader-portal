import { ReactNode } from "react"
import CommonLayout from "@/app/layout/commonLayout"
import { Metadata } from "next"

const DashboardLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
    return (
        <CommonLayout slug="TRANSFER">
            {children}
        </CommonLayout>
    )
}

export default DashboardLayout


export const metadata: Metadata = {
    title: 'Transfer'
}