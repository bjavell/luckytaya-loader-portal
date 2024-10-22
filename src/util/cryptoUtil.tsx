const CryptoJS = require('crypto-js')

const SECRET_PASSKEY = 'B3t@pploader123'

const encrypt = (message: string) => {
    console.log(message)
    return CryptoJS.AES.encrypt(message, SECRET_PASSKEY).toString()
}


const decrypt = (encryptedMessage: string) => {
    return CryptoJS.AES.decrypt(encryptedMessage, SECRET_PASSKEY).toString()
}

export {
    encrypt,
    decrypt
}