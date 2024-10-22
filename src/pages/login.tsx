import Button from "@/components/button"
import Form from "@/components/form"
import FormField from "@/components/formField"
import Layout from "@/pages/rootLayout"
import { encrypt } from "@/util/cryptoUtil"
import axios from "axios"
import Link from "next/link"
import { useRouter } from "next/router"
import { useState } from "react"

const Login = () => {
    const router = useRouter()
    const [userId, setUserId] = useState('')
    const [password, setPassword] = useState('')
    const [isLoading, setIsLoading] = useState(false)

    const onHandleSubmit = async () => {
        setIsLoading(true)

        await axios.post('api/signin', { username: userId, password: encrypt(password) })
            .then(response => {
                console.log(response)
                router.push('dashboard')
            })
            .catch(e => {
                console.error(e)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    return (
        <Layout title="Loader Portal">
            <Form className="w-96 flex flex-col gap-5 justify-center">
                <FormField name="userId" label="User ID" placeholder="Enter User ID" value={userId} onChange={(e) => { setUserId(e.target.value) }} />
                <FormField name="password" label="Password" placeholder="******" type="password" value={password} onChange={(e) => { setPassword(e.target.value) }} />
                <Button onClick={onHandleSubmit} isLoading={isLoading} loadingText="Loading...">Login</Button>
                <Link href={''} className="flex text-white underline m-auto">FORGOT PASSWORD?</Link>
                <span className="text-white m-auto font-sans font-light ">BY CONTINUING, YOU AGREE TO OUR<br />USER AGREEMENT AND PRIVACY POLICY</span>
            </Form>
        </Layout>

    )
}


export default Login