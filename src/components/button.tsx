import { NextPage } from "next"
import { ReactNode } from "react"

interface ButtonProps {
    children?: ReactNode,
    onClick: () => void | Promise<void> | undefined,
    disabled?: boolean,
    isLoading?: boolean,
    loadingText?: string,
    customCss?: string,
    type: 'button' | 'submit',
    size?: string,
    textColor?: string
}

const Button: NextPage<ButtonProps> = (props) => {
    const { children, customCss, textColor, size, type, onClick } = props

    let customSize = 'text-[20px]'
    if (size) {
        customSize = size
    }

    let customTextColor
    if (!textColor) {
        customTextColor = 'text-black'
    } else {
        customTextColor = textColor
    }

    return (
        <button type={type} className={`justify-center inline-block py-3 px-6 rounded-xlg bg-yellow-green text-base ${customTextColor} ${customSize} group-invalid:pointer-events-none group-invalid:opacity-50 ${customCss ?? ''}`} onClick={onClick} disabled={props.disabled || props.isLoading}>{props.isLoading ? props.loadingText : children}</button>
    )
}


export default Button