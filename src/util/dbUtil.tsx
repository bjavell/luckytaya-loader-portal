import db from "@/lib/mongodb"


const findOne = async (collection: string, query: any) => {

    const database = await db()
    const dbCollection = database.collection(collection)
    const data = await dbCollection.findOne(query)

    return data
}

const findAll = async (collection: string, query: any) => {

    const database = await db()
    const dbCollection = database.collection(collection)
    const cursor = dbCollection.find(query)

    return await cursor.toArray()
}

const insert = async (collection: string, query: any) => {

    const database = await db()
    const dbCollection = database.collection(collection)
    const data = await dbCollection.insertOne(query)

    return data
}

const update = async (collection: string, query: any, newDocument: any) => {
    const database = await db()
    const dbCollection = database.collection(collection)
    const data = await dbCollection.updateOne(query, { $set: newDocument })

    return data
}

export {
    findOne,
    insert,
    update,
    findAll
}