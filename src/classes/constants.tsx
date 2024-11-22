const SESSION_COOKIE_NAME = 'session'

const PATTERNS = {
    EMAIL: '^[^@\\s]+@[a-zA-Z]+[.]{1}[a-zA-Z]+$',
    NUMBER: '[^0-9.-]*$'
}

const QR_TRANSACTION_STATUS = {
    CREATED: 'Created',
    COMPLETED: 'Completed',    
    FAILED: 'Failed'
}

const DB_COLLECTIONS = {
    CONFIG: 'config',
    QR_TRANSACITON: 'qr_transactions',
    TAYA_USERS: 'taya_user'
}

const TRAN_TYPE = {
    CASHIN: 'cashin',
    CASHOUT: 'cashout'
}

const BANK_DETAILS = [
    {
      "swiftCode": "APHIPHM2XXX",
      "bankName": "Alipay / Lazada Wallet",
      "bankCode": "7021",
      "maintenanceStartTime": "Jun 6, 4:20 PM",
      "maintenanceEndTime": "Jun 6, 4:50 PM",
      "underMaintenance": "false"
    },
    {
      "swiftCode": "OPDVPHM1XXX",
      "bankName": "AllBank (A Thrift Bank), Inc.",
      "bankCode": "0210",
      "maintenanceStartTime": "Aug 24, 1:00 AM",
      "maintenanceEndTime": "Aug 24, 11:20 AM",
      "underMaintenance": "false"
    }
  ];

const ACCOUNT_TYPE = {
  MASTER: 'master',
  COMMISSION: 'commission',
  FEE: 'fee'
}

export {
    SESSION_COOKIE_NAME,
    PATTERNS,
    QR_TRANSACTION_STATUS,
    DB_COLLECTIONS,
    TRAN_TYPE,
    BANK_DETAILS,
    ACCOUNT_TYPE
}