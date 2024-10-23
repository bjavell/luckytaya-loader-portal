import { NextPage } from "next";

interface FormFieldProps {
    name: string,
    value?: any,
    type?: 'text' | 'password', // add more types if necessary
    label?: string
    errorMessage?: string,
    placeholder?: string,
    onChange?: React.ChangeEventHandler<HTMLInputElement>,
    customLabelClass?: string
}

const FormField: NextPage<FormFieldProps> = (props) => {

    const { label, name, type, customLabelClass, ...inputProps } = props

    return (
        <div className="flex flex-col flex-1 gap-4">
            <label htmlFor={name} className={`text-white font-sans font-light ${customLabelClass}`}>{label}</label>
            <input type={type} className="rounded-xlg py-4 px-4 bg-semiBlack font-sans font-light text-[13px] tacking-[5%] text-white " {...inputProps} />
        </div>

    )
}

export default FormField