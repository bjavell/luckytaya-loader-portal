'use client'
import Button from "@/components/button"
import { useEffect, useState } from "react"
import { getCurrentSession } from "@/context/auth"
import axios from "axios"
import { useRouter } from "next/navigation"
import { encrypt } from "@/util/cryptoUtil"
import { useApiData } from "../context/apiContext"
import QrCode from "@/components/qrCode"
import LoadingSpinner from "@/components/loadingSpinner"
import BalanceBar from "@/components/balanceBar"


const playerPortal = process.env.NEXT_PUBLIC_PLAYER_PORTAL
const Home = () => {
    const router = useRouter()
    const [referralLink, setReferralLink] = useState<string>('')
    const [balance, setBalance] = useState('')
    const { data, loading } = useApiData()

    useEffect(() => {
        if (data) {
            setBalance(data.balance)
            setReferralLink(`${playerPortal}/register/${encrypt(data.referralCode.toString())}`)
        }
    }, [data])

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

    const downloadQRCode = () => {
        const canvas = document.querySelector('canvas');  // Find the canvas element
        if (canvas) {
            const imageUrl = canvas.toDataURL('image/png'); // Convert canvas to image URL
            const link = document.createElement('a');
            link.href = imageUrl;
            link.download = 'qrcode.png'; // Set the download file name
            link.click(); // Trigger the download
        }
    };


    if (loading) {
        return <LoadingSpinner />
    }


    return (
        <div className="flex flex-col gap-4 w-full">
            <BalanceBar balance={balance} />
            <div className="text-bold text-2xl text-lightGreen">GOOD DAY, <br />E-BILLIARD AGENTS</div>
            {/* <div className="font-light mt-10">Recently archived reports are now available and can be viewed by visiting the &quot;Report Archive Menu&quot; <br />Please bear in mind that the platform only offers a &quot;Read Only&quot; access in which you should not <br />perform your typical transactions on the said site. Thank you for your continuous support.
            </div> */}
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
                {referralLink ?
                    <div className="p-5 flex flex-col gap-4 text-base">
                        <span>QR Code</span>
                        <div className="flex flex-col gap-2 my-5 items-center">
                            <div className="bg-gray13 rounded-xl p-3 max-w-[32.375rem] truncate">
                                <QrCode data={referralLink} className='m-auto' />
                            </div>
                            <Button onClick={() => downloadQRCode()} customCss={'text-black font-semibold text-xs'} type="button">Download QR Code</Button>
                        </div>
                    </div> : null}
                <div className="p-5 bg-gray13 rounded-b-xl text-base font-light">
                    Please take note of your referral link above, All players that will register under this link will automatically be under your account
                </div>
            </div>
        </div>
    )
}

export default Home