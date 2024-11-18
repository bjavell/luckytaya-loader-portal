'use client'
import Button from "@/components/button"
import { useEffect, useState } from "react"
import { getCurrentSession } from "@/context/auth"
import axios from "axios"
import { useRouter } from "next/navigation"

const Home = () => {
    const router = useRouter()
    const [referralLink, setReferralLink] = useState<string>('')

    const getUserDetails = async () => {
        await axios.get('/api/get-user-details')
            .then(response => {
                setReferralLink(`http://test.test.com?referralCode=${response.data?.referralCode}`)
            })
            .catch((e) => {
                const errorMessages = e.response.data.error
                if (errorMessages) {
                    if (errorMessages['Unauthorized']) {
                        router.push('/login')
                    }
                }

            })
            .finally(() => {
            })
    }

    useEffect(() => {
        getUserDetails()
    }, [])

    const onCopyReferralLink = async () => {
        if (navigator.clipboard && window.isSecureContext) {
            try {
                await navigator.clipboard.writeText(referralLink);
                alert('Text copied to clipboard!');
            } catch (err) {
                console.error('Error copying text: ', err);
                alert('Failed to copy text');
            }
        } else {
            // Use the 'out of viewport hidden text area' trick
            const textArea = document.createElement("textarea");
            textArea.value = referralLink;

            // Move textarea out of the viewport so it's not visible
            textArea.style.position = "absolute";
            textArea.style.left = "-999999px";

            document.body.prepend(textArea);
            textArea.select();

            try {
                document.execCommand('copy');
            } catch (error) {
                console.error('Error copying text using fallback: ', error);
                alert('Failed to copy text');
            } finally {
                textArea.remove();
            }
        }
    }

    // <div className="font-light mt-10">Recently archived reports are now available and can be viewed by visiting the &quot;Report Archive Menu&quot; <br />Please bear in mind that the platform only offers a &quot;Read Only&quot; access in which you should not <br />perform your typical transactions on the said site. Thank you for your continuous support.
    //         </div>
    //         <div>E-Billiard Account Services</div>
    //         <div className="flex flex-col bg-cursedBlack rounded-xl mt-10 max-w-[47.5rem]">
    //             <div className="p-5 flex flex-col gap-4 text-base">
    //                 <span>Referal Link</span>
    //                 <div className="flex flex-row gap-2 my-5">
    //                     <div className="bg-gray13 rounded-xl p-3 max-w-[32.375rem] truncate">
    //                         {referralLink}
    //                     </div>
    //                     <Button onClick={() => onCopyReferralLink()} customCss={'text-black font-semibold text-xs'} type="button">Copy Referral Link</Button>
    //                 </div>
    //             </div>
    //             <div className="p-5 bg-gray13 rounded-b-xl text-base font-light">
    //                 Please take note of your referral link above, All players that will register under this link will automatically be under your account
    //             </div>
    //         </div>

    return (
        <div className="flex flex-col gap-4">
            <div className="text-bold text-2xl text-lightGreen">GOOD DAY, <br />E-BILLIARD AGENTS</div>            
        </div>
    )
}

export default Home