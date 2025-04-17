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
import Modal from "@/components/modal"
import { localAxios } from "@/util/localAxiosUtil"


const EditProfile = () => {


    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [editProfile, setEditProfile] = useState({
        accountNumber: '',
        accountType: 0,
        firstName: '',
        lastName: '',
        email: '',
        mobile: '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    })
    const [index, setIndex] = useState(0)

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    const { data, reload, setReload } = useApiData()

    useEffect(() => {
        //console.log(data)
        if (data) {
            setEditProfile({
                accountType: data.accountType,
                accountNumber: data.accountNumber,
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                mobile: data.mobile,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            })
            setIsLoading(false)
        }

    }, [data, reload])


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

            const response = await localAxios.post('/api/update-profile', request)

            setIndex(index + 1)
            setIsAlertModalOpen(true)
            setAlertMessage(response.data.message)
            setReload(true)
            setEditProfile(prevState => ({
                ...prevState,
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            }))

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
        setEditProfile(prevState => ({
            ...prevState,
            'currentPassword': '',
        }))
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
            {/* <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onCancel={onToggleConfirmModal}
                onConfirm={onFormSubmit}
                message="Update profile?"
            ></ConfirmationModal> */}
            <Modal isOpen={isConfirmModalOpen} onClose={onToggleConfirmModal} size="small">
                <Form className="flex flex-col gap-4" onSubmit={onFormSubmit}>
                    <h2 className="text-sm lg:text-lg font-semibold mb-4">Update profile?</h2>
                    <FormField name={"currentPassword"} label="Enter your current password to proceed" customLabelClass="text-xs" onBlur={handleChange} value={editProfile.currentPassword} type="password" required />
                    <div className="flex justify-end space-x-4">
                        <Button onClick={onToggleConfirmModal} type='button' textColor='text-red' isGrouped={false}>
                            Cancel
                        </Button>
                        <Button isLoading={isLoading} loadingText="Loading..." onClick={onFormSubmit} type={"button"}>Submit</Button>
                    </div>
                </Form>
            </Modal>
            <Form className="flex flex-col w-1/2" key={`form-${index}`} onSubmit={onToggleConfirmModal}>
                {isLoading ? <LoadingSpinner /> :
                    <div className="flex flex-col gap-4 p-4 w-full bg-gray13 rounded-xl w-full gap-4">
                        {(editProfile.accountType === 2 || editProfile.accountType === 6 || editProfile.accountType === 3) && <FormField name={"accountNumber"} label="Account Number" customLabelClass="text-xs" value={formatDynamicNumber(editProfile.accountNumber)} readonly />}
                        <FormField name={"firstName"} label="First Name" customLabelClass="text-xs" onBlur={handleChange} value={editProfile.firstName} required />
                        <FormField name={"lastName"} label="Last Name" customLabelClass="text-xs" onBlur={handleChange} value={editProfile.lastName} required />
                        <FormField name={"email"} label="Email" customLabelClass="text-xs" onBlur={handleChange} value={editProfile.email} required />
                        <FormField name={"mobile"} label="Mobile Number" customLabelClass="text-xs" onBlur={handleChange} value={editProfile.mobile} required />
                        <FormField name={"newPassword"} label="New Password" customLabelClass="text-xs" onBlur={handleChange} value={editProfile.newPassword} type="password" required={editProfile.confirmPassword !== ''} />
                        <FormField name={"confirmPassword"} label="Confirm Password" customLabelClass="text-xs" onBlur={handleChange} value={editProfile.confirmPassword} errorMessage="New password does not match" pattern={editProfile.newPassword} type="password" required={editProfile.newPassword !== ''} />

                        <Button isLoading={isLoading} loadingText="Loading..." onClick={onToggleConfirmModal} type={"button"}>Submit</Button>
                    </div>
                }
            </Form>
        </div>

    )
}

export default EditProfile