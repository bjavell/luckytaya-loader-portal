'use client'
import Button from "@/components/button"
import { useEffect, useState } from "react"
import { getCurrentSession } from "@/context/auth"

const Home = () => {
    const [referralLink, setReferralLink] = useState<string>('')

    useEffect(() => {
        const getSession = async () => {
            const session = await getCurrentSession()

            setReferralLink(`http://test.test.com?referralCode=${session?.referralCode}`)

        }
        getSession()
    }, [])


    const onCopyReferralLink = () => {
        navigator.clipboard.writeText(referralLink).then(() => {
            alert('Text copied to clipboard!');
        }).catch(err => {
            console.error('Error copying text: ', err);
        });
    }

    return (
        <div className="flex flex-col gap-4">

            <div className="text-bold text-2xl text-lightGreen">GOOD DAY, <br />E-BILLIARD AGENTS</div>
            <div className="font-light mt-10">Recently archived reports are now available and can be viewed by visiting the "Report Archive Menu" <br />Please bear in mind that the platform only offers a "Read Only" access in which you should not <br />perform your typical transactions on the said site. Thank you for your continuous support.
            </div>
            <div>E-Billiard Account Services</div>
            <div className="flex flex-col bg-cursedBlack rounded-xl mt-10 max-w-[47.5rem]">
                <div className="p-5 flex flex-col gap-4 text-base">
                    <span>Referal Link</span>
                    <div className="flex flex-row gap-2 my-5">
                        <div className="bg-gray13 rounded-xl p-3 max-w-[32.375rem] truncate">
                            {referralLink}
                        </div>
                        <Button onClick={() => onCopyReferralLink()} customCss={'text-black font-semibold text-xs'} type="button">Copy Referral Link</Button>
                    </div>
                </div>
                <div className="p-5 bg-gray13 rounded-b-xl text-base font-light">
                    Please take note of your referral link above, All players that will register under this link will automatically be under your account
                </div>
            </div>
        </div>
    )
}

export default Home