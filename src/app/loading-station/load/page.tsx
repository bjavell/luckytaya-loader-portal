'use client'
import FormField from "@/components/formField"
import { useState } from "react"
import Button from "@/components/button"

const Active = () => {
    const [userInput, setUserInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)


    return (
        <div className="flex flex-col w-full gap-4">
            <div className="flex justify-between bg-[#1F1F1F] rounded-xl p-3">
                <div className="flex text-[#C3C3C3] text-base">Load Station</div>
                <div className="flex text-[#C3C3C3] text-base">BALANCE</div>
            </div>
            <div className="flex flex-row gap-4">
                <div className="flex w-1/2 bg-white rounded-xl"></div>
                <div className="flex w-1/2 bg-gray13 rounded-xl">
                    <div className="flex flex-row gap-2 w-full">
                        <div className="flex flex-col p-4 gap-4 w-full">
                            <FormField name="userId" label="Load to" placeholder="Enter Load To" value={userInput} onChange={(e) => { setUserInput(e.target.value) }} customLabelClass="text-xs" />
                            <FormField name="userId" label="Complete Name" placeholder="Enter complete name" value={userInput} onChange={(e) => { setUserInput(e.target.value) }} customLabelClass="text-xs" />
                            <FormField name="userId" label="Amount" placeholder="Enter amount" value={userInput} onChange={(e) => { setUserInput(e.target.value) }} customLabelClass="text-xs" />
                            <FormField name="userId" label="Email Address" placeholder="example@gmail.com" value={userInput} onChange={(e) => { setUserInput(e.target.value) }} customLabelClass="text-xs" />
                        </div>
                        <div className="flex flex-col p-4 gap-4 w-full">
                            <FormField name="userId" label="Fee" placeholder="Enter Fee" value={userInput} onChange={(e) => { setUserInput(e.target.value) }} customLabelClass="text-xs" />
                            <FormField name="userId" label="User ID" placeholder="Enter User ID" value={userInput} onChange={(e) => { setUserInput(e.target.value) }} customLabelClass="text-xs" />
                            <FormField name="userId" label="Comment" placeholder="Type your comment" value={userInput} onChange={(e) => { setUserInput(e.target.value) }} customLabelClass="text-xs" />
                            <Button onClick={() => alert('123123123')} isLoading={isLoading} loadingText="Loading..." type="submit">Submit</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Active