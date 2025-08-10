import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const filePath = path.resolve(__dirname, '../data/user.json')

export const userService = {
    query,
    add,
    getByCredentials,
    getByUsername
}

async function query() {
    const txt = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(txt)
}

async function add(user) {
    const users = await query()
    const newUser = { _id: makeId(), username: user.username, password: user.password, fullname: user.fullname }
    users.push(newUser)
    await fs.writeFile(filePath, JSON.stringify(users, null, 2))
    return newUser
}

async function getByCredentials(username, password) {
    const users = await query()
    return users.find(u => u.username === username && u.password === password) || null
}

async function getByUsername(username) {
    const users = await query()
    return users.find(u => u.username === username) || null
}

function makeId(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let txt = ''
    for (let i = 0; i < length; i++) txt += chars.charAt(Math.floor(Math.random() * chars.length))
    return txt
}
