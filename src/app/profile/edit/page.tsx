'use client'
import { useEffect, useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { PATTERNS } from "@/classes/constants"
import Button from "@/components/button"
import FormField from "@/components/formField"
import Form from "@/components/form"
import ConfirmationModal from "@/components/confirmationModal"
import { formatDynamicNumber, guidToNumber } from "@/util/textUtil"
import { useApiData } from "@/app/context/apiContext"
import LoadingSpinner from "@/components/loadingSpinner"
import { encrypt } from "@/util/cryptoUtil"


const EditProfile = () => {


    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [editProfile, setEditProfile] = useState({
        firstname: '',
        lastname: '',
        email: '',
        phoneNumber: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [index, setIndex] = useState(0)

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    const { data, setReload } = useApiData()

    useEffect(() => {

        if (data) {
            setEditProfile({
                firstname: data.fistname,
                lastname: data.lastname,
                email: data.email,
                phoneNumber: data.phoneNumber,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            })
            setIsLoading(false)
        }

    }, [data])


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setEditProfile(prevState => ({
            ...prevState,
            [name]: value,
        }))
    }

    const onFormSubmit = async () => {
        try {
            setIsConfirmModalOpen(false)
            setIsLoading(true)


            const request = {
                ...editProfile,
                currentPassword: encrypt(editProfile.currentPassword),
                newPassword: encrypt(editProfile.newPassword),
                confirmPassword: encrypt(editProfile.confirmPassword),
            }

            const response = await axios.post('/api/update-profile', request)

            setIndex(index + 1)
            setIsAlertModalOpen(true)
            setAlertMessage(response.data.message)
            setReload(true)

        } catch (e: any) {
            const errorMessages = e?.response?.data?.error
            if (errorMessages) {
                if (errorMessages['Bad request']) {
                    setAlertMessage(errorMessages['Bad request'][0])
                } else {
                    setAlertMessage('An Error occured please try again')
                }

            } else {
                setAlertMessage('An Error occured please try again')
            }
            setIsAlertModalOpen(true)
        } finally {
            setIsLoading(false)
        }
    }


    const onToggleConfirmModal = () => {
        setIsConfirmModalOpen(!isConfirmModalOpen)
    }


    return (
        <div className="flex w-full justify-center">
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
                onConfirm={onFormSubmit}
                message="Update profile?"
            ></ConfirmationModal>
            <Form className="flex flex-col w-1/2" key={`form-${index}`}>
                {isLoading ? <LoadingSpinner /> :
                    <div className="flex flex-col gap-4 p-4 w-full bg-gray13 rounded-xl w-full gap-4">
                        <FormField name={"firstname"} label="First Name" customLabelClass="text-xs" onBlur={handleChange} value={editProfile.firstname} required />
                        <FormField name={"lastname"} label="Last Name" customLabelClass="text-xs" onBlur={handleChange} value={editProfile.lastname} required />
                        <FormField name={"email"} label="Email" customLabelClass="text-xs" onBlur={handleChange} value={editProfile.email} required />
                        <FormField name={"phoneNumber"} label="Mobile Number" customLabelClass="text-xs" onBlur={handleChange} value={editProfile.phoneNumber} required />
                        <FormField name={"currentPassword"} label="Current Password" customLabelClass="text-xs" onBlur={handleChange} value={editProfile.currentPassword} type="password" required={editProfile.newPassword !== '' || editProfile.confirmPassword !== ''} />
                        <FormField name={"newPassword"} label="New Password" customLabelClass="text-xs" onBlur={handleChange} value={editProfile.newPassword} type="password" required={editProfile.currentPassword !== ''} />
                        <FormField name={"confirmPassword"} label="Confirm Password" customLabelClass="text-xs" onBlur={handleChange} value={editProfile.confirmPassword} errorMessage="New password does not match" pattern={editProfile.newPassword} type="password" required={editProfile.currentPassword !== ''} />

                        <Button isLoading={isLoading} loadingText="Loading..." onClick={onToggleConfirmModal} type={"button"}>Submit</Button>
                    </div>
                }
            </Form>
        </div>

    )
}

export default EditProfile