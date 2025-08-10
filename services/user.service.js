const BASE_URL = 'http://127.0.0.1:3030/api/auth'
import { eventBusService } from './event-bus.service.js'

export const userService = {
    login,
    signup,
    logout,
    getLoggedinUser
}

function login(credentials) {
    return fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(credentials)
    }).then(async res => {
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    }).then(miniUser => {
        sessionStorage.setItem('loggedinUser', JSON.stringify(miniUser))
        eventBusService.emit('user-changed', miniUser)
        return miniUser
    })
}

function signup(data) {
    return fetch(`${BASE_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(data)
    }).then(async res => {
        if (!res.ok) throw new Error(await res.text())
        return res.json()
    }).then(miniUser => {
        sessionStorage.setItem('loggedinUser', JSON.stringify(miniUser))
        eventBusService.emit('user-changed', miniUser)
        return miniUser
    })
}

function logout() {
    return fetch(`${BASE_URL}/logout`, {
        method: 'POST',
        credentials: 'include'
    }).then(() => {
        sessionStorage.removeItem('loggedinUser')
        eventBusService.emit('user-changed', null)
    })
}

function getLoggedinUser() {
    const str = sessionStorage.getItem('loggedinUser')
    if (!str) return null
    try {
        return JSON.parse(str)
    } catch (err) {
        return null
    }
}
