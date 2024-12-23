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
import { localAxios } from "@/util/localAxiosUtil"

const Login = () => {
    const router = useRouter()
    const [userId, setUserId] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const onHandleSubmit = async () => {
        setIsLoading(true)
        setErrorMessage('')       

        await localAxios.post('/api/signin', { username: userId, password: encrypt(password) })
            .then(() => {
                router.push('/')
            })
            .catch(e => {
                const errorMessages = e.response.data.error
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
                setIsLoading(false)
            })
            .finally(() => {
            })
    }

    return (
        <Form className="w-96 flex flex-col gap-4 justify-center" onSubmit={onHandleSubmit}>
            {isLoading ? <LoadingSpinner /> : null}
            <Image src={logo} alt="" className="block lg:hidden m-auto" priority={false} />
            <FormField name="userId" label="User ID" placeholder="Enter User ID" value={userId} onChange={(e) => { setUserId(e.target.value) }} required />
            <FormField name="password" label="Password" placeholder="******" type="password" value={password} onChange={(e) => { setPassword(e.target.value) }} required />
            <Button onClick={onHandleSubmit} isLoading={isLoading} loadingText="Loading..." type={'submit'}>Login</Button>
            {
                errorMessage !== '' ?
                    <div className="flex gap-2 text-white bg-red p-4 rounded-xlg">
                        {errorMessage}
                    </div>
                    : ''
            }
            <Link href={'/forgot-password'} className="flex text-white underline m-auto">Forgot Password?</Link>
            <span className="text-white m-auto font-sans font-light text-wrap">By continuing, you agree to our User Agreement and Privacy Policy</span>

        </Form>

    )
}


export default Login