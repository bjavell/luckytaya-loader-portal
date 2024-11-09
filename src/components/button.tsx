import { NextPage } from "next"
import { ReactNode } from "react"

interface ButtonProps {
    children?: ReactNode,
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void,
    disabled?: boolean,
    isLoading?: boolean,
    loadingText?: string,
    customCss?: string,
    type: 'button' | 'submit'
}

const Button: NextPage<ButtonProps> = (props) => {
    const { children, customCss, type, onClick } = props
    return (
        <button type={type} className={`justify-center inline-block py-3 px-6 rounded-xlg bg-yellow-green text-[20px]  group-invalid:pointer-events-none group-invalid:opacity-50 ${customCss}`} onClick={onClick} disabled={props.disabled || props.isLoading}>{props.isLoading ? props.loadingText : children}</button>
    )
}


export default Button