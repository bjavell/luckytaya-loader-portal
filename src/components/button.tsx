import { NextPage } from "next"
import { ReactNode } from "react"

interface ButtonProps {
    children?: ReactNode,
    onClick: Function,
    disabled?: boolean,
    isLoading?: boolean,
    loadingText?: string
}

const Button: NextPage<ButtonProps> = (props) => {
    const { children } = props
    return (
        <button type="button" className="justify-center flex py-3 px-6 rounded-xlg bg-yellow-green text-[20px]" onClick={() => { props.onClick() }} disabled={props.disabled || props.isLoading}>{props.isLoading ? props.loadingText : children}</button>
    )
}


export default Button