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
    // roles: string[];
    masterAgentAccountNumber: number;
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
        accountType: 0,
        // roles: [],
        masterAgentAccountNumber: 0
    })
    const [index, setIndex] = useState(0)

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [isShowMasterAgenctAccountField, setIsShowMasterAgenctAccountField] = useState(false)

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

        const now = new Date();

        // Get each component (as numbers)
        const year = now.getFullYear();
        const month = now.getMonth() + 1; // getMonth() is 0-based, so add 1
        const day = now.getDate();
        const hours = now.getHours();
        const minutes = now.getMinutes();
        const seconds = now.getSeconds();
        const milliseconds = now.getMilliseconds();
        setUserRegistration(prevState => ({
            ...prevState,
            referralCode: Number(
                `${year}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}${hours.toString().padStart(2, '0')}${minutes.toString().padStart(2, '0')}${seconds.toString().padStart(2, '0')}${milliseconds.toString().padStart(3, '0')}`
            )
        })
        )

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
        if (name === 'accountType') {
            if (value === '6') {
                setIsShowMasterAgenctAccountField(true)
            } else {
                setIsShowMasterAgenctAccountField(false)
            }
        } else { setIsShowMasterAgenctAccountField(false) }
    }


    // const onHandleCheckBox = (role: string, checked: boolean) => {
    //     setUserRegistration((prevState) => {
    //         if (checked) {
    //             return { ...prevState, roles: [...prevState.roles, role] };
    //         } else {
    //             return { ...prevState, roles: prevState.roles.filter((r) => r !== role) };
    //         }
    //     })
    // }

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
                accountType: 0,
                // roles: [],
                masterAgentAccountNumber: 0
            })
            setIndex(index + 1)
            setIsAlertModalOpen(true)
            setAlertMessage(response.data.message)
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

    const onCloseAlertModal = () => {
        setIsAlertModalOpen(false)
        setAlertMessage('')
    }

    return (
        <div className="flex w-full">
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
                message="Proceed with the registration?"
            ></ConfirmationModal>
            <Form className="flex flex-col w-full" key={`form-${index}`}>
                <div className="flex flex-col gap-4 p-4 w-full bg-gray13 rounded-xl w-full gap-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                        <FormField name={"username"} label="Username" customLabelClass="text-xs" onBlur={handleChange} value={userRegistration.username} required />
                        <FormField name={"facebookAccount"} label="Facebook Account" customLabelClass="text-xs" onBlur={handleChange} value={userRegistration.facebookAccount} required />
                        <FormField name={"firstname"} label="First Name" customLabelClass="text-xs" onBlur={handleChange} value={userRegistration.firstname} required />
                        <FormField name={"lastname"} label="Last Name" customLabelClass="text-xs" onBlur={handleChange} value={userRegistration.lastname} required />
                        <FormField name={"phoneNumber"} label="Phone Number" customLabelClass="text-xs" onBlur={handleChange} value={userRegistration.phoneNumber} required />
                        <FormField name={"email"} label="Email" customLabelClass="text-xs" type="email" pattern={PATTERNS.EMAIL} errorMessage="Invalid Email Address" onBlur={handleChange} value={userRegistration.email} required />

                        <FormField name={"referralCode"} label="Referral Code" customLabelClass="text-xs" value={userRegistration.referralCode} readonly />
                        <div className="flex flex-col flex-1 gap-4">
                            {/* <label htmlFor="roles" className="text-white font-sans font-light text-nowrap text-xs">Roles</label>
                            <div className="grid grid-cols-2 gap-4">
                                {userRole.map((e: any) => {
                                    return <div key={e.key} className="flex gap-4 items-center">
                                        <input
                                            type="checkbox"
                                            value={e.key}
                                            checked={userRegistration.roles.includes(e.key)}
                                            onChange={(event) => onHandleCheckBox(event.target.value, event.target.checked)}
                                        />
                                        <label>{e.description}</label>
                                    </div>
                                })}
                            </div> */}

                            <div className="flex flex-col flex-1 gap-4">
                                <label htmlFor="accountType" className="text-white font-sans font-light text-nowrap text-xs">Account Type</label>
                                <select id="accountType" name='accountType' className="rounded-xlg py-4 px-4 bg-semiBlack font-sans font-light text-[13px] tacking-[5%] text-white" value={userRegistration.accountType} onChange={onDropDownChange} required>

                                    <option value=''>Select Account Type</option>
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

                        {isShowMasterAgenctAccountField ? <FormField name={"masterAgentAccountNumber"} label="Master Agent Account Number" customLabelClass="text-xs" onBlur={handleChange} value={userRegistration.masterAgentAccountNumber} required /> : ''}
                    </div>
                    <Button isLoading={isLoading} loadingText="Loading..." onClick={onToggleConfirmModal} type={"button"}>Submit</Button>
                </div>
            </Form>
        </div>

    )
}

export default Players