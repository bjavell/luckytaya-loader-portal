import { NextPage } from "next"
import Form from "./form"
import FormField from "./formField"
import { PATTERNS } from "@/classes/constants"
import { Dispatch, SetStateAction } from "react"
import Button from "./button"

interface LoadFormProps {
    loadTo: {
        value: string,
        onChange?: Dispatch<SetStateAction<string>>,
        onBlur?: (val: string) => void,
        isReadOnly: boolean
    },
    completeName: string,
    email: string,
    amount: {
        value: string,
        onBlur: (val: string) => void
    },
    fee: string,
    totalAmount: string,
    comment: {
        value: string,
        onChage: Dispatch<SetStateAction<string>>
    }
    isLoading: boolean,
    onHandleSubmit: () => void,
}

const LoadForm: NextPage<LoadFormProps> = (props) => {

    const { loadTo, completeName, email, amount, fee, totalAmount, comment, isLoading, onHandleSubmit } = props


    return <div className="flex w-1/2 bg-gray13 rounded-xl">
        <Form className="flex flex-row gap-2 w-full">
            <div className="flex flex-col p-4 gap-4 w-full">
                <FormField
                    name="loadTo"
                    label="Load to"
                    placeholder="Enter Load To"
                    value={loadTo.value}
                    onChange={(e) => loadTo.onChange ? loadTo.onChange(e.target.value) : null}
                    customLabelClass="text-xs"
                    onBlur={(e) => loadTo.onBlur ? loadTo.onBlur(e.target.value) : null}
                    readonly={loadTo.isReadOnly}
                    required
                />
                <FormField
                    name="completeName"
                    label="Complete Name"
                    value={completeName}
                    customLabelClass="text-xs"
                    readonly />
                <FormField
                    name="email"
                    label="Email Address"
                    value={email}
                    customLabelClass="text-xs"
                    type="email"
                    readonly
                />
                <FormField
                    name="amount"
                    label="Amount"
                    placeholder="Enter amount"
                    value={amount.value}
                    onBlur={(e) => amount.onBlur(e.target.value)}
                    customLabelClass="text-xs"
                    type="number"
                    pattern={PATTERNS.NUMBER}
                    min={1}
                    max={1000000}
                    errorMessage="Invalid Amount"
                    required
                />
                <FormField
                    name="comment"
                    label="Comment"
                    placeholder="Type your comment"
                    value={comment.value}
                    onChangeTextArea={(e) => comment.onChage(e.target.value)}
                    customLabelClass="text-xs"
                    type="textarea"
                />
                <Button
                    onClick={onHandleSubmit}
                    isLoading={isLoading}
                    loadingText="Loading..."
                    type={'button'}
                >
                    Submit
                </Button>
            </div>
        </Form>
    </div>
}


export default LoadForm