import Button from "@/components/button"
import Form from "@/components/form"
import FormField from "@/components/formField"
import Layout from "@/components/loginLayout"
import Link from "next/link"
import { useRouter } from "next/router"
import { useState } from "react"

const Login = () => {
    const router = useRouter()
    const [userId, setUserId] = useState('')
    const [password, setPassword] = useState('')

    return (
        <Layout title="Loader Portal">
            <Form className="w-96 flex flex-col gap-5 justify-center">
                <FormField name="userId" label="User ID" placeholder="Enter User ID" />
                <FormField name="password" label="Password" placeholder="******" type="password" />
                <Button>Login</Button>
                <Link href={''} className="flex text-white underline m-auto">FORGOT PASSWORD?</Link>
                <span className="text-white m-auto font-sans font-light ">BY CONTINUING, YOU AGREE TO OUR<br />USER AGREEMENT AND PRIVACY POLICY</span>
            </Form>
        </Layout>

    )
}


export default Login