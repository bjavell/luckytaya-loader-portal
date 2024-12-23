'use client'
import { useEffect, useState } from "react"
import axios from "axios"
import Tables from "@/components/tables"
import { useParams, useRouter, useSearchParams } from "next/navigation"
import { formatDynamicNumber, formatMoney } from "@/util/textUtil"
import { USER_TYPE } from "@/classes/constants"
import Button from "@/components/button"
import Modal from "@/components/modal"
import FormField from "@/components/formField"
import UserData from "@/classes/userData"
import ConfirmationModal from "@/components/confirmationModal"
import AccountType from "@/classes/accountTypeData"
import LoadingSpinner from "@/components/loadingSpinner"

import Image from "next/image";
import Form from "@/components/form"
import { localAxios } from "@/util/localAxiosUtil"


const playerPortal = process.env.NEXT_PUBLIC_PLAYER_PORTAL

const Players = () => {
    const router = useRouter()
    const params = useParams()

    const manageType = params?.type
    const accountStatusPending = useSearchParams()?.get('accountStatus')
    const [players, setPlayers] = useState([])
    const [filterPlayers, setFilterPlayers] = useState([])
    const [status, setStatus] = useState('ALL')
    const [isShowModal, setIsShowModal] = useState(false)
    const [modalData, setModalData] = useState<UserData>({
        "accountNumber": 0,
        "accountType": 0,
        "accountStatus": 0,
        "accountBalance": 0,
        "username": "",
        "firstname": "",
        "lastname": "",
        "phoneNumber": "",
        "email": "",
        "facebookAccount": "",
        "referralCode": 0,
        "id": 0,
        "suspended": 0,
        image: ''
        // "roles": []
    })
    const [search, setSearch] = useState('')
    const [accountType, setAccountType] = useState<AccountType[]>([])
    const [accountRole, setAccountRole] = useState([])
    const [isLoading, setIsLoading] = useState(false)

    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
    const [alertMessage, setAlertMessage] = useState('');
    const [searchAccountType, setSearchAccountType] = useState('ALL')
    const [accountStatus, setAccountStatus] = useState('ALL')
    const [currDataStatus, setCurrDataStatus] = useState('')


    const getUserLists = async () => {
        try {
            setIsLoading(true)

            const response = await localAxios.get('/api/get-all-users', {
                params: {
                    type: manageType === 'backoffice' ? USER_TYPE.MANAGEMENT : USER_TYPE.PLAYER
                }
            })

            setPlayers(response.data)
            setFilterPlayers(response.data)
        } catch (e: any) {
            const errorMessages = e?.response?.data?.error
            if (errorMessages) {
                if (errorMessages['Unauthorized']) {
                    router.push('/login')
                }
            }
            // const errorMessages = e.response.data.error
            setPlayers([])
            setFilterPlayers([])

        } finally {
            setIsLoading(false)
        }

    }

    const getUserType = async () => {
        await localAxios.get('/api/get-account-type')
            .then(response => {
                setAccountType(response.data)
            })
            .catch((e) => {
                const errorMessages = e.response.data.error
                if (errorMessages) {
                    if (errorMessages['Unauthorized']) {
                        router.push('/login')
                    }
                }
                // const errorMessages = e.response.data.error
                setAccountType([])
            })
            .finally(() => {
                // setIsLoading(false)
            })
    }

    // const getUserType = async () => {
    //     await localAxios.get('/api/get-account-type')
    //         .then(response => {
    //             setAccountType(response.data)
    //         })
    //         .catch((e) => {
    //             const errorMessages = e.response.data.error
    //             if (errorMessages) {
    //                 if (errorMessages['Unauthorized']) {
    //                     router.push('/login')
    //                 }
    //             }
    //             // const errorMessages = e.response.data.error
    //             setAccountType([])
    //         })
    //         .finally(() => {
    //             // setIsLoading(false)
    //         })
    // }

    const getUserRole = async () => {
        await localAxios.get('/api/get-account-roles')
            .then(response => {
                setAccountRole(response.data)
            })
            .catch((e) => {
                const errorMessages = e.response.data.error
                if (errorMessages) {
                    if (errorMessages['Unauthorized']) {
                        router.push('/login')
                    }
                }
                // const errorMessages = e.response.data.error
                setAccountRole([])
            })
            .finally(() => {
                // setIsLoading(false)
            })
    }

    useEffect(() => {
        if (players.length === 0)
            getUserLists()

        if (accountType.length === 0) {
            getUserType()
        }

        if (accountRole.length === 0) {
            getUserRole()
        }

        if (accountStatusPending) {
            onUserSearch(search, status, searchAccountType, accountStatusPending)
        } else {
            onUserSearch(search, status, searchAccountType, accountStatus)
        }

    }, [players])

    const openModal = (data: any) => {
        setModalData(data)
        setCurrDataStatus(data.status)
        setIsShowModal(true)
    }

    const closeModal = () => {
        if (!isLoading) {
            setModalData({
                "accountNumber": 0,
                "accountType": 0,
                "accountStatus": 0,
                "accountBalance": 0,
                "username": "",
                "firstname": "",
                "lastname": "",
                "phoneNumber": "",
                "email": "",
                "facebookAccount": "",
                "referralCode": 0,
                "id": 0,
                "suspended": 0,
                // "roles": []
            })
            setIsShowModal(false)
            setCurrDataStatus('')
        }
    }

    const onUserSearch = (value: string, status: string, srchAcctType: string, accountStatus: string) => {
        const filter = players.filter((player: any) => {
            return (`${player?.firstname} ${player?.lastname}`.toUpperCase().includes(value) || String(player?.accountNumber)?.includes(value)
                || player?.phoneNumber?.toUpperCase().includes(value) ||
                player?.email?.toUpperCase().includes(value)) &&
                (status === 'ALL' ? true : Number(status) === player.suspended) &&
                (srchAcctType === 'ALL' ? true : Number(srchAcctType) === Number(player.accountType)) &&
                (accountStatus === 'ALL' ? true : accountStatus === player.status)
        })

        setSearch(value)
        setStatus(status)
        setSearchAccountType(srchAcctType)
        setAccountStatus(accountStatus)
        setFilterPlayers(filter)
    }

    const onAccountTypeChange = (value: string) => {
        setModalData(prevData => ({
            ...prevData,
            accountType: Number(value)
        }))
    }

    const onSuspendChange = (value: string) => {
        setModalData(prevData => ({
            ...prevData,
            suspended: Number(value)
        }))
    }
    const onApproveChange = (value: string) => {
        setModalData(prevData => ({
            ...prevData,
            status: value
        }))
    }

    // const onHandleCheckBox = (role: string, checked: boolean) => {
    //     setModalData((prevModalData) => {
    //         if (checked) {
    //             return { ...prevModalData, roles: [...prevModalData.roles, role] };
    //         } else {
    //             return { ...prevModalData, roles: prevModalData.roles.filter((r) => r !== role) };
    //         }
    //     })
    // }

    const onButtonSubmit = async () => {
        try {
            setIsConfirmModalOpen(false)
            setIsLoading(true)
            //console.log(modalData)
            await localAxios.post('/api/update-user-account', modalData)
            setModalData({
                "accountNumber": 0,
                "accountType": 0,
                "accountStatus": 0,
                "accountBalance": 0,
                "username": "",
                "firstname": "",
                "lastname": "",
                "phoneNumber": "",
                "email": "",
                "facebookAccount": "",
                "referralCode": 0,
                "id": 0,
                "suspended": 0,
                status: ''
                // "roles": []
            })
            setIsAlertModalOpen(true)
            setAlertMessage('Account successfully updated!')
            setIsShowModal(false)
            getUserLists()
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
        <div className="flex flex-col gap-4 w-full">
            {isLoading ? <LoadingSpinner /> : null}
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
            <Modal isOpen={isShowModal} onClose={closeModal} size="medium">
                <div className="flex flex-col items-end gap-4">
                    <div className="flex w-full gap-4">
                        <Form className="flex flex-col gap-4 p-4 w-full">
                            {modalData.image ?
                                <div className="flex flex-col">
                                    <Image src={`${playerPortal}${modalData.image}`} alt={"player image"} width={200} height={200} />
                                </div>
                                : null}
                            <div className="flex">
                                <FormField name={"accountNumber"} value={formatDynamicNumber(modalData.accountNumber)} label="Account Number" customLabelClass="text-xs" readonly />
                                <FormField name={"accountBalance"} value={formatMoney(`${modalData.accountBalance}`)} label="Account Balance" customLabelClass="text-xs" readonly />
                            </div>
                            <div className="flex">
                                <FormField name={"firstName"} value={modalData.firstname} label="First Name" customLabelClass="text-xs" readonly />
                                <FormField name={"lastName"} value={modalData.lastname} label="Last Name" customLabelClass="text-xs" readonly />
                            </div>
                            <div className="flex">
                                <FormField name={"phoneNumber"} value={modalData.phoneNumber} label="Mobile Number" customLabelClass="text-xs" readonly />
                                <FormField name={"email"} value={modalData.email} label="Email" customLabelClass="text-xs" readonly />
                            </div>
                            <div className="flex">
                                <FormField name={"facebookAccount"} value={modalData.facebookAccount} label="Facebook Account" customLabelClass="text-xs" readonly />
                                <FormField name={"referralCode"} value={formatDynamicNumber(modalData.referralCode)} label="Referral Code" customLabelClass="text-xs" readonly />
                            </div>
                            <div className="flex gap-4">
                                {/* <div className="flex flex-col flex-1 gap-4">
                                    <label htmlFor="roles" className="text-white font-sans font-light text-nowrap text-xs">Roles</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        {accountRole.map((e: any) => {
                                            return <div key={e.key} className="flex gap-4 items-center">
                                                <input
                                                    type="checkbox"
                                                    value={e.key}
                                                    checked={modalData.roles.includes(e.key)}
                                                    onChange={(e) => onHandleCheckBox(e.target.value, e.target.checked)}
                                                />
                                                <label>{e.description}</label>
                                            </div>
                                        })}
                                    </div>

                                </div> */}
                                <div className="flex flex-col flex-1 gap-4">
                                    {
                                        manageType === 'backoffice' ?
                                            <>
                                                <label htmlFor="accountType" className="text-white font-sans font-light text-nowrap text-xs">Account Type</label>
                                                <select id="accountType" className="rounded-xlg py-4 px-4 bg-semiBlack font-sans font-light text-sm tacking-[5%] text-white" value={modalData.accountType} onChange={(e) => onAccountTypeChange(e.target.value)} required>
                                                    <option value=''>Select Account Type</option>
                                                    {
                                                        accountType ?
                                                            accountType.map((e: any) => {
                                                                return <option key={e.description} value={e.accountType}>{e.description}</option>
                                                            }) :
                                                            <option></option>
                                                    }
                                                </select>
                                            </> :
                                            null
                                    }
                                    <label htmlFor="suspend" className="text-white font-sans font-light text-nowrap text-xs">Suspend?</label>
                                    <select id="accountType" className="rounded-xlg py-4 px-4 bg-semiBlack font-sans font-light text-sm tacking-[5%] text-white" value={modalData.suspended} onChange={(e) => onSuspendChange(e.target.value)}>
                                        <option value={0}>No</option>
                                        <option value={1}>Yes</option>
                                    </select>
                                    {
                                        currDataStatus === 'PENDING' ?
                                            <>
                                                <label htmlFor="suspend" className="text-white font-sans font-light text-nowrap text-xs">Approve Player?</label>
                                                <select id="accountType" className="rounded-xlg py-4 px-4 bg-semiBlack font-sans font-light text-sm tacking-[5%] text-white" value={modalData.status} onChange={(e) => onApproveChange(e.target.value)} required>
                                                    <option value={''}>--</option>
                                                    <option value={'APPROVED'}>Yes</option>
                                                    <option value={'REJECTED'}>No</option>
                                                </select>
                                            </>
                                            : null
                                    }
                                </div>
                            </div>
                        </Form>
                    </div>
                    <div className="flex gap-4">
                        <Button
                            onClick={closeModal}
                            isLoading={isLoading}
                            type={"button"}
                            textColor="text-red"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={onToggleConfirmModal}
                            isLoading={isLoading}
                            type={"button"}
                            loadingText="Loading..." >
                            Submit
                        </Button>
                    </div>
                </div>
            </Modal>
            <h1 className="text-xl">{manageType === 'backoffice' ? 'Backoffice' : 'Players'}</h1>
            <div className="gap-4 items-center flex w-2/3">
                <label htmlFor="accountNumber" >Search</label>
                <FormField name="accountNumber" value={search} onBlur={(e) => { onUserSearch(e.target.value.toUpperCase(), status, searchAccountType, accountStatus) }} />
                <div className="flex flex-row">
                    <div className="gap-2 flex">
                        <label htmlFor="status" className="flex items-center">Status</label>
                        <select id="status" className="rounded-xlg py-4 px-4 bg-semiBlack font-sans font-light text-sm tacking-[5%] text-white" value={status} onChange={(e) => onUserSearch(search, e.target.value, searchAccountType, accountStatus)}>
                            <option value="ALL">ALL</option>
                            <option value="0">Active</option>
                            <option value="1">Suspended</option>
                        </select>
                    </div>
                </div>
                {manageType === 'backoffice' ?
                    <div className="flex flex-row">
                        <div className="gap-2 flex">
                            <label htmlFor="searchAccountType" className="flex items-center">Account Type</label>
                            <select id="searchAccountType" className="rounded-xlg py-4 px-4 bg-semiBlack font-sans font-light text-sm tacking-[5%] text-white" value={searchAccountType} onChange={(e) => onUserSearch(search, status, e.target.value, accountStatus)}>
                                <option value="ALL">ALL</option>
                                <option value="9">Admin</option>
                                <option value="5">Declarator</option>
                                <option value="4">Event Manager</option>
                                <option value="1">Finance</option>
                            </select>
                        </div>
                    </div>
                    :
                    <div className="flex flex-row">
                        <div className="gap-2 flex">
                            <label htmlFor="searchAccountType" className="flex items-center">Account Status</label>
                            <select id="searchAccountType" className="rounded-xlg py-4 px-4 bg-semiBlack font-sans font-light text-sm tacking-[5%] text-white" value={accountStatus} onChange={(e) => onUserSearch(search, status, searchAccountType, e.target.value)}>
                                <option value="ALL">ALL</option>
                                <option value="PENDING">Pending</option>
                                <option value="APPROVED">Approved</option>
                                <option value="REJECTED">Rejected</option>
                            </select>
                        </div>
                    </div>}
            </div>
            <div className="flex flex-col">
                <Tables
                    primaryId="accountNumber"
                    headers={[
                        {
                            key: 'accountNumber',
                            label: 'account number',
                            format: (val: string) => {
                                return formatDynamicNumber(val)
                            }
                        },
                        {
                            key: 'firstname',
                            label: 'complete name',
                            concatKey: ['lastname'],
                            concatSeparator: ' '
                        },
                        {
                            key: 'email',
                            label: 'email'
                        },
                        {
                            key: 'phoneNumber',
                            label: 'mobile number'
                        },
                        {
                            key: 'accountType',
                            label: 'type',
                            format: (val: string) => {

                                const accountTp = accountType.find((item: any) => {
                                    return Number(item.accountType) === Number(val)
                                })

                                if (accountTp) {
                                    return accountTp ? accountTp?.description : ''
                                } else if (val.toString() === '8') {
                                    return 'Player'
                                } else {
                                    return val
                                }
                            }
                        },
                        {
                            key: 'accountBalance',
                            label: 'balance',
                            format: (val: string) => {
                                return formatMoney(val)
                            }
                        },
                        {
                            key: 'suspended',
                            label: 'status',
                            format: (val: string) => {

                                let formattedValue
                                if (Number(val) === 1) {
                                    formattedValue = 'Suspended'
                                } else {
                                    formattedValue = 'Active'
                                }

                                return formattedValue
                            }
                        }, {
                            key: '',
                            label: 'action',
                            customValue: (item: any) => {
                                return <div className="flex gap-2 items-center justify-center">
                                    <Button
                                        onClick={() => openModal(item)}
                                        type={"button"}
                                        size="text-xs"
                                    >
                                        Edit
                                    </Button>
                                </div>
                            }
                        }
                    ]}
                    items={filterPlayers}
                    isCentered={true}
                />
            </div>
        </div>

    )
}

export default Players