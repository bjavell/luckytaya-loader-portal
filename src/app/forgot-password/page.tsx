'use client'
import Button from "@/components/button"
import Form from "@/components/form"
import FormField from "@/components/formField"
import { encrypt } from "@/util/cryptoUtil"
import axios from "axios"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import logo from '@/assets/images/logo-1.svg'
import Image from "next/image"
import LoadingSpinner from "@/components/loadingSpinner"
import ConfirmationModal from "@/components/confirmationModal"
import { PATTERNS } from "@/classes/constants"

const ForgotPassword = () => {
    const router = useRouter()
    const [username, setUsername] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')


    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [index, setIndex] = useState(0)

    const onButtonSubmit = async () => {
        try {
            setIsConfirmModalOpen(false)
            setIsLoading(true)
            const response = await axios.post('/api/forgot-password', { username })
            setUsername('')
            setErrorMessage('')
            setIsAlertModalOpen(true)
            setAlertMessage(response.data.message)
            setIndex(index + 1)
        } catch (e: any) {
            const errorMessages = e?.response?.data?.error
            if (errorMessages) {
                if (errorMessages['Not found']) {
                    setErrorMessage(errorMessages['Not found'][0])
                } else if (errorMessages['Bad request']) {
                    setErrorMessage(errorMessages['Bad request'][0])
                } else if (errorMessages['Unexpexted Error']) {
                    setErrorMessage(errorMessages['Unexpexted Error'][0])
                } else {
                    setErrorMessage('Oops! something went wrong')
                }
            }
            else {
                setErrorMessage('Oops! something went wrong')
            }
        } finally {
            setIsLoading(false)
        }
    }

    const onToggleConfirmModal = () => {
        setIsConfirmModalOpen(!isConfirmModalOpen)
    }
    return (
        <div className=" text-white">
            <ConfirmationModal
                isOpen={isAlertModalOpen}
                onConfirm={() => setIsAlertModalOpen(false)}
                onCancel={() => { }}
                isOkOnly={true}
                message={alertMessage}
            ></ConfirmationModal>
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onCancel={onToggleConfirmModal}
                onConfirm={onButtonSubmit}
                message="Proceed with the changes?"
            ></ConfirmationModal>
            <Form className="w-96 flex flex-col gap-4 justify-center" onSubmit={onToggleConfirmModal} key={`form-${index}`}>
                {isLoading ? <LoadingSpinner /> : null}
                <Image src={logo} alt="" className="block lg:hidden m-auto" priority={false} />
                <FormField name="userId" label="Username" placeholder="Enter your username" value={username} onChange={(e) => { setUsername(e.target.value) }} required />
                <Button onClick={onToggleConfirmModal} isLoading={isLoading} loadingText="Loading..." type={'button'}>Submit</Button>
                {
                    errorMessage !== '' ?
                        <div className="flex gap-2 text-white bg-red p-4 rounded-xlg">
                            {errorMessage}
                        </div>
                        : ''
                }
            </Form>
        </div>

    )
}


export default ForgotPassword