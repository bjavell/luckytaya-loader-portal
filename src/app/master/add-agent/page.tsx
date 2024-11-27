'use client'
import { useEffect, useState } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import { PATTERNS } from "@/classes/constants"
import Button from "@/components/button"
import FormField from "@/components/formField"
import Form from "@/components/form"
import ConfirmationModal from "@/components/confirmationModal"


interface UserRegistrationProps {
    username: string;
    firstname: string;
    lastname: string;
    phoneNumber: string;
    email: string;
    facebookAccount: string;
    referralCode: number;
    accountType: number;
    roles: string[];
}

const Players = () => {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [userType, setUserType] = useState([])
    const [userRole, setUserRole] = useState([])
    const [userRegistration, setUserRegistration] = useState<UserRegistrationProps>({
        username: '',
        firstname: '',
        lastname: '',
        phoneNumber: '',
        email: '',
        facebookAccount: '',
        referralCode: 0,
        accountType: 8,
        roles: []
    })
    const [index, setIndex] = useState(0)

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');

    const getUserType = async () => {
        await axios.get('/api/get-account-type')
            .then(response => {
                setUserType(response.data)
            })
            .catch((e) => {
                const errorMessages = e.response.data.error
                if (errorMessages) {
                    if (errorMessages['Unauthorized']) {
                        router.push('/login')
                    }
                }
                // const errorMessages = e.response.data.error
                setUserType([])
            })
            .finally(() => {
                // setIsLoading(false)
            })
    }

    const getUserRole = async () => {
        await axios.get('/api/get-account-roles')
            .then(response => {
                setUserRole(response.data)
            })
            .catch((e) => {
                const errorMessages = e.response.data.error
                if (errorMessages) {
                    if (errorMessages['Unauthorized']) {
                        router.push('/login')
                    }
                }
                // const errorMessages = e.response.data.error
                setUserRole([])
            })
            .finally(() => {
                // setIsLoading(false)
            })
    }

    useEffect(() => {
        if (userType.length === 0) {
            getUserType()
        }

        if (userRole.length === 0) {
            getUserRole()
        }

    }, [])


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setUserRegistration(prevState => ({
            ...prevState,
            [name]: value,
        }))
    }

    const onDropDownChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target
        setUserRegistration(prevState => ({
            ...prevState,
            [name]: value
        }))
    }


    const onHandleCheckBox = (role: string, checked: boolean) => {
        setUserRegistration((prevState) => {
            if (checked) {
                return { ...prevState, roles: [...prevState.roles, role] };
            } else {
                return { ...prevState, roles: prevState.roles.filter((r) => r !== role) };
            }
        })
    }

    const onFormSubmit = async () => {
        try {
            setIsConfirmModalOpen(false)
            setIsLoading(true)
            const response = await axios.post('/api/register', userRegistration)
            setUserRegistration({
                username: '',
                firstname: '',
                lastname: '',
                phoneNumber: '',
                email: '',
                facebookAccount: '',
                referralCode: 0,
                accountType: 8,
                roles: []
            })
            setIndex(index + 1)
            setIsAlertModalOpen(true)
            setAlertMessage(response.data.message)
        } catch (e: any) {
            setIsAlertModalOpen(true)
            setAlertMessage('Oops! something went wrong')
        } finally {
            setIsLoading(false)
        }
    }


    const onToggleConfirmModal = () => {
        setIsConfirmModalOpen(!isConfirmModalOpen)
    }

    const onCloseAlertModal = () => {
        setIsAlertModalOpen(false)
        setAlertMessage('')
    }

    return (
        <div className="flex w-full">
             <ConfirmationModal
                isOpen={isAlertModalOpen}
                onConfirm={() => setIsAlertModalOpen(false)}
                onCancel={()=> {}}
                isOkOnly={true}
                message={alertMessage}
            ></ConfirmationModal>
            <ConfirmationModal
                isOpen={isConfirmModalOpen}
                onCancel={onToggleConfirmModal}
                onConfirm={onFormSubmit}
                message="Proceed with the registration?"
            ></ConfirmationModal>
            <Form className="flex flex-col gap-4 p-4 w-full bg-gray13 h-2/3 rounded-xl" key={`form-${index}`}>
                <div className="flex w-full gap-4">
                    <div className="flex flex-col gap-4 w-full">
                        <FormField name={"username"} label="Username" customLabelClass="text-xs" onBlur={handleChange} value={userRegistration.username} required />
                        <FormField name={"firstname"} label="First Name" customLabelClass="text-xs" onBlur={handleChange} value={userRegistration.firstname} required />
                        <FormField name={"lastname"} label="Last Name" customLabelClass="text-xs" onBlur={handleChange} value={userRegistration.lastname} required />
                        <FormField name={"phoneNumber"} label="Phone Number" customLabelClass="text-xs" onBlur={handleChange} value={userRegistration.phoneNumber} required />
                        <FormField name={"email"} label="Email" customLabelClass="text-xs" type="email" pattern={PATTERNS.EMAIL} errorMessage="Invalid Email Address" onBlur={handleChange} value={userRegistration.email} required />
                    </div>
                    <div className="flex flex-col gap-4 w-full">
                        <FormField name={"facebookAccount"} label="Facebook Account" customLabelClass="text-xs" onBlur={handleChange} value={userRegistration.facebookAccount} required />
                        <FormField name={"referralCode"} label="Referral Code" customLabelClass="text-xs" onBlur={handleChange} value={userRegistration.referralCode} required />
                        <div className="flex flex-col flex-1 gap-4">
                            <label htmlFor="roles" className="text-white font-sans font-light text-nowrap text-xs">Roles</label>
                            <div className="grid grid-cols-2 gap-4">
                                {userRole.map((e: string) => {
                                    return <div key={e} className="flex gap-4 items-center">
                                        <input
                                            type="checkbox"
                                            value={e}
                                            checked={userRegistration.roles.includes(e)}
                                            onChange={(e) => onHandleCheckBox(e.target.value, e.target.checked)}
                                        />
                                        <label>{e}</label>
                                    </div>
                                })}
                            </div>

                        </div>
                        <div className="flex flex-col flex-1 gap-4">
                            <label htmlFor="accountType" className="text-white font-sans font-light text-nowrap text-xs">Account Type</label>
                            <select id="accountType" name='accountType' className="rounded-xlg py-4 px-4 bg-semiBlack font-sans font-light text-[13px] tacking-[5%] text-white" value={userRegistration.accountType} onChange={onDropDownChange}>
                                {
                                    userType ?
                                        userType.map((e: any) => {
                                            return <option key={e.description} value={e.accountType}>{e.description}</option>
                                        }) :
                                        <option></option>
                                }
                            </select>

                        </div>
                    </div>
                </div>
                <Button isLoading={isLoading} loadingText="Loading..." onClick={onToggleConfirmModal} type={"button"}>Submit</Button>
            </Form>
        </div>

    )
}

export default Players