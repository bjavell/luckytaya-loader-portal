const CryptoJS = require('crypto-js')

const SECRET_PASSKEY = 'B3t@pploader123'

const encrypt = (message: string) => {
    return CryptoJS.AES.encrypt(message, SECRET_PASSKEY).toString()
}

const decrypt = (encryptedMessage: string) => {
    console.log(SECRET_PASSKEY, ' ', encryptedMessage)
    const bytes =  CryptoJS.AES.decrypt(encryptedMessage, SECRET_PASSKEY)
    return bytes.toString(CryptoJS.enc.Utf8)
}

export {
    encrypt,
    decrypt
}