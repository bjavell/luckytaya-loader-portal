import { decrypt, encrypt } from "@/util/cryptoUtil";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI ?? 'mongodb://localhost:27017';
const MONGODB_DB = process.env.MONGODB_DB;



console.log(encrypt("mongodb://lucky_taya_stg:Luck_taya_stg_123@136.158.92.54:27017/lucky_taya_stg?retryWrites=true&loadBalanced=false&serverSelectionTimeoutMS=2000&connectTimeoutMS=10000&authSource=lucky_taya_stg&authMechanism=SCRAM-SHA-256"))

const client = MongoClient.connect(decrypt(MONGODB_URI), {
    ssl: false,
    directConnection: true,
    readPreference: 'primary'
})

const db = async () => {

    const clientInstance = await client
    return clientInstance.db(MONGODB_DB)
}

export default db