import { NextPage } from "next";
import { FormEventHandler, ReactNode } from "react";

interface FormProps {
    className?: string,
    children?: ReactNode,
    onSubmit?: FormEventHandler
}

const Form: NextPage<FormProps> = (props) => {
    const { className, children, ...formProps } = props

    return (
        <form className={`${className}`} {...formProps} noValidate>{children}</form>
    )
}

export default Form