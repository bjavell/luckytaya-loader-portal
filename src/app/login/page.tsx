'use client'
import Button from "@/components/button"
import Form from "@/components/form"
import FormField from "@/components/formField"
import { encrypt } from "@/util/cryptoUtil"
import axios from "axios"
import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"

const Login = () => {
    const router = useRouter()
    const [userId, setUserId] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [errorMessage, setErrorMessage] = useState('')

    const onHandleSubmit = async () => {
        setIsLoading(true)
        setErrorMessage('')

        await axios.post('api/signin', { username: userId, password: encrypt(password) })
            .then(response => {
                router.push('dashboard')
            })
            .catch(e => {
                const errorMessages = e.response.data.error;
                if (errorMessages) {
                    if (errorMessages['Not found']) {
                        setErrorMessage(errorMessages['Not found'][0]);
                    } else if (errorMessages['Bad request']) {
                        setErrorMessage(errorMessages['Bad request'][0]);
                    }
                }
                else {
                    setErrorMessage('Oops! something went wrong');
                }
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    return (
        <Form className="w-96 flex flex-col gap-5 justify-center" onSubmit={onHandleSubmit}>
            <FormField name="userId" label="User ID" placeholder="Enter User ID" value={userId} onChange={(e) => { setUserId(e.target.value) }} />
            <FormField name="password" label="Password" placeholder="******" type="password" value={password} onChange={(e) => { setPassword(e.target.value) }} />
            <Button onClick={onHandleSubmit} isLoading={isLoading} loadingText="Loading..." type={'submit'}>Login</Button>
            {
                errorMessage !== '' ?
                    <div className="flex gap-2 text-white bg-red p-4 rounded-xlg">
                        {errorMessage}
                    </div>
                    : ''
            }
            <Link href={''} className="flex text-white underline m-auto">FORGOT PASSWORD?</Link>
            <span className="text-white m-auto font-sans font-light ">BY CONTINUING, YOU AGREE TO OUR<br />USER AGREEMENT AND PRIVACY POLICY</span>
        </Form>

    )
}


export default Login