import * as CryptoJS from 'crypto-js'
import * as crypto from 'crypto'

const SECRET_PASSKEY = 'B3t@pploader123'

const encrypt = (message: string) => {
    return CryptoJS.AES.encrypt(message, SECRET_PASSKEY).toString()
}

const decrypt = (encryptedMessage: string) => {
    const bytes = CryptoJS.AES.decrypt(encryptedMessage, SECRET_PASSKEY)
    return bytes.toString(CryptoJS.enc.Utf8)
}

const sha256withRSAsign = (stringtoencrypt: string, privateKey: Buffer) => {
    const data = Buffer.from(stringtoencrypt)
    const signature = crypto.sign('RSA-SHA256', data, privateKey).toString("base64")

    return signature
}

const sha256withRSAverify = (stringtoencrypt: string, signature: string, publicKey: Buffer) => {
    const data = Buffer.from(stringtoencrypt)
    const verify = crypto.verify(
        'RSA-SHA256',
        data,
        publicKey,
        Buffer.from(signature, 'base64')
    )
    return verify
}

export {
    encrypt,
    decrypt,
    sha256withRSAsign,
    sha256withRSAverify
}