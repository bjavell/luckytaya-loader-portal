import { NextPage } from "next"
import { useState } from "react"

interface FormFieldProps {
    name: string,
    value?: any,
    type?: 'text' | 'password' | 'email' | 'textarea' | 'date', // add more types if necessary
    label?: string
    errorMessage?: string,
    placeholder?: string,
    onChange?: React.ChangeEventHandler<HTMLInputElement>
    onChangeTextArea?: React.ChangeEventHandler<HTMLTextAreaElement>,
    customLabelClass?: string,
    pattern?: string,
    required?: boolean
}

const FormField: NextPage<FormFieldProps> = (props) => {
    const [isVisited, setIsVisited] = useState(false)

    const { label, name, type, customLabelClass, value, errorMessage, onChangeTextArea, ...inputProps } = props

    let defaultClass = 'flex flex-col flex-1 gap-4'
    const labelClassName = `text-white font-sans font-light text-nowrap ${customLabelClass ?? ''}`

    const handleOnBlur = async (e: any) => {
        e.preventDefault()
        setIsVisited(true)
    }

    if (type === 'date') {
        defaultClass = 'flex flex-row flex-1 gap-4 items-center'
    }

    if (type === 'textarea') {
        return (
            <div className="flex flex-col flex-1 gap-4">
                <label htmlFor={name} className={labelClassName}>{label}</label>
                <textarea cols={45} rows={4} value={value} id={name} name={name} onChange={onChangeTextArea} className="rounded-xlg py-4 px-4 bg-semiBlack font-sans font-light text-[13px] tacking-[5%] text-white invalid:border-red-500" style={{ resize: 'none' }} />
            </div>
        )
    }

    return (
        <div className={defaultClass}>
            <label htmlFor={name} className={labelClassName}>{label}</label>
            <input {...inputProps} type={type} id={name} name={name} className={`peer rounded-xlg py-4 px-4 bg-semiBlack shadow-sm font-sans font-light text-[13px] tacking-[5%] text-white invalid:border-red-500 invalid:[&.visited]:border invalid:[&.visited]:border-[#E74C3C] ${isVisited ? 'visited' : ''} `} onBlur={handleOnBlur} />
            <span className={`text-sm max-w-[300px] text-[#E74C3C] hidden peer-[.visited:invalid]:block transition-all`}>{props.required && !value ? "Field is required" : errorMessage}</span>

        </div>

    )
}

export default FormField