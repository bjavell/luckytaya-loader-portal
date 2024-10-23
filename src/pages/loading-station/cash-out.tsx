import FormField from "@/components/formField"
import DashboardLayout from "../layout"
import Button from "@/components/button"
import { useState } from "react"

const Active = () => {
    const [userInput, setUserInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    return (
        <DashboardLayout title="Dashboard" slug="CASH-OUT">
            <div className="flex flex-col w-full gap-4">
                <div className="flex justify-between bg-[#1F1F1F] rounded-xl p-3">
                    <div className="flex text-[#C3C3C3] text-base">Cash-Out</div>
                    <div className="flex text-[#C3C3C3] text-base">BALANCE</div>
                </div>
                <div className="flex flex-row gap-4">
                    <div className="flex w-1/2 bg-white rounded-xl"></div>
                    <div className="flex w-1/2 bg-gray13 rounded-xl">
                        <div className="flex flex-col gap-4 p-4 w-full">
                            <FormField name="userId" label="User ID" placeholder="Enter User ID" value={userInput} onChange={(e) => { setUserInput(e.target.value) }} customLabelClass="text-xs" />
                            <FormField name="userId" label="User ID" placeholder="Enter User ID" value={userInput} onChange={(e) => { setUserInput(e.target.value) }} customLabelClass="text-xs" />
                            <Button onClick={() => alert('123123123')} isLoading={isLoading} loadingText="Loading...">Submit</Button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>

    )
}

export default Active