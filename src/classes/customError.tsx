class CustomError extends Error {
    response?: {
        data: {
            errors: Record<string, string[]>
        }
    }

    constructor(message: string, errors: Record<string, string[]>) {
        super(message)
        this.response = {
            data: {
                errors,
            },
        }
        // Set the prototype explicitly
        Object.setPrototypeOf(this, CustomError.prototype)
    }
}

export default CustomError