import { NextPage } from "next"
import { useState } from "react"

interface FormFieldProps {
    name: string,
    value?: any,
    type?: 'text' | 'password' | 'email' | 'textarea' | 'date' | 'number' | 'datetime-local', // add more types if necessary
    label?: string
    errorMessage?: string,
    placeholder?: string,
    onChange?: React.ChangeEventHandler<HTMLInputElement>
    onChangeTextArea?: React.ChangeEventHandler<HTMLTextAreaElement>,
    onBlur?: React.ChangeEventHandler<HTMLInputElement>,
    customLabelClass?: string,
    pattern?: string,
    required?: boolean,
    readonly?: boolean,
    min?: number,
    max?: number,
}

const FormField: NextPage<FormFieldProps> = (props) => {
    const [isVisited, setIsVisited] = useState(false)

    const { label, name, type, customLabelClass, value, errorMessage, readonly, onChangeTextArea, onBlur, ...inputProps } = props

    let defaultClass = 'flex flex-col flex-1 gap-4'
    const labelClassName = `text-white font-sans font-light text-nowrap ${customLabelClass ?? ''}`

    const handleOnBlur = async (e: any) => {
        e.preventDefault()
        setIsVisited(true)
        if (onBlur) {
            onBlur(e)
        }
    }

    const handleOnKeyDown = async (e: any) => {
        if (type === 'number') {
            const invalidKeys = ['e', 'E', '+', '-']
            if (invalidKeys.includes(e.key)) {
                e.preventDefault();
            }
        }

        return e
    }

    if (type === 'date' || type === 'datetime-local') {
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

    let formField = <input {...inputProps} type={type} id={name} name={name} className={`peer rounded-xlg py-4 px-4 bg-semiBlack shadow-sm font-sans font-light text-[13px] tacking-[5%] text-white invalid:border-red-500 invalid:[&.visited]:border invalid:[&.visited]:border-[#E74C3C] ${isVisited ? 'visited' : ''} `} onBlur={handleOnBlur} onKeyDown={handleOnKeyDown} defaultValue={value} />

    if (readonly) {
        formField = <>
            <span className="break-words">{value ?? '-'}</span>
            <input {...inputProps} type="hidden" value={value} className="peer visited" />
        </>
    }


    return (
        <div className={defaultClass}>
            {label ? <label htmlFor={name} className={labelClassName}>{label}</label> : null}
            {formField}
            <span className={`text-sm max-w-[300px] text-[#E74C3C] hidden peer-[.visited:invalid]:block transition-all`}>{props.required && !value ? "Field is required" : errorMessage}</span>

        </div>

    )
}

export default FormField