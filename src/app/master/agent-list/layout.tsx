import { ReactNode } from "react"
import { Metadata } from "next"
import CommonLayout from "@/app/layout/commonLayout"

const DashboardLayout: React.FC<{ children: ReactNode }> = ({ children }) => {
    
    return (
        <CommonLayout slug="AGENTS">
            {children}
        </CommonLayout>
    )
}

export default DashboardLayout

export const metadata: Metadata = {
    title: 'Agents'
}