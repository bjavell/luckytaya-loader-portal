const SESSION_COOKIE_NAME = 'session'

const PATTERNS = {
    EMAIL: '^[^@\\s]+@[a-zA-Z]+[.]{1}[a-zA-Z]+$',
    NUMBER: '[^0-9.-]*$'
}

const QR_TRANSACTION_STATUS = {
    CREATED: 'Created',
    COMPLETED: 'Completed'
}

const DB_COLLECTIONS = {
    CONFIG: 'config',
    QR_TRANSACITON: 'qr_transactions'
}

export {
    SESSION_COOKIE_NAME,
    PATTERNS,
    QR_TRANSACTION_STATUS,
    DB_COLLECTIONS
}