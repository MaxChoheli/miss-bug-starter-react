import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { bugService } from './services/bug.service.local.js'
import { userService } from './services/user.service.server.js'

const app = express()
const tokens = new Map()

app.use(cors({
    origin: 'http://127.0.0.1:5500',
    credentials: true
}))
app.use(cookieParser())
app.use(express.json())

function getLoggedinUser(req) {
    const token = req.cookies.loginToken
    if (!token) return null
    return tokens.get(token) || null
}

function makeToken() {
    return 't' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}

app.get('/', (req, res) => res.send('Hello there'))

app.post('/api/auth/signup', async (req, res) => {
    try {
        const { username, password, fullname } = req.body
        if (!username || !password || !fullname) return res.status(400).send({ error: 'Missing fields' })
        const exists = await userService.getByUsername(username)
        if (exists) return res.status(409).send({ error: 'Username taken' })
        const user = await userService.add({ username, password, fullname })
        const miniUser = { _id: user._id, fullname: user.fullname }
        const token = makeToken()
        tokens.set(token, miniUser)
        res.cookie('loginToken', token, { httpOnly: true, sameSite: 'Lax', secure: false, path: '/' })
        res.send(miniUser)
    } catch (err) {
        res.status(500).send({ error: 'Signup failed' })
    }
})

app.post('/api/auth/login', async (req, res) => {
    try {
        const { username, password } = req.body
        if (!username || !password) return res.status(400).send({ error: 'Missing fields' })
        const user = await userService.getByCredentials(username, password)
        if (!user) return res.status(401).send({ error: 'Invalid credentials' })
        const miniUser = { _id: user._id, fullname: user.fullname }
        const token = makeToken()
        tokens.set(token, miniUser)
        res.cookie('loginToken', token, { httpOnly: true, sameSite: 'Lax', secure: false, path: '/' })
        res.send(miniUser)
    } catch (err) {
        res.status(500).send({ error: 'Login failed' })
    }
})

app.post('/api/auth/logout', (req, res) => {
    const token = req.cookies.loginToken
    if (token) tokens.delete(token)
    res.clearCookie('loginToken', { path: '/' })
    res.send({ msg: 'Logged out' })
})

app.get('/api/bug', async (req, res) => {
    try {
        const { txt, minSeverity, labels, sortBy, sortDir, pageIdx } = req.query
        const filterBy = {
            txt: txt || '',
            minSeverity: +minSeverity || 0,
            labels: labels ? labels.split(',') : []
        }
        const sortOptions = {
            sortBy: sortBy || 'createdAt',
            sortDir: sortDir === '-1' ? -1 : 1
        }
        const paging = {
            pageIdx: +pageIdx || 0,
            pageSize: 3
        }
        const bugs = await bugService.query(filterBy, sortOptions, paging)
        res.send(bugs)
    } catch (err) {
        res.status(500).send({ error: 'Failed to get bugs' })
    }
})

app.get('/api/bug/:bugId', async (req, res) => {
    try {
        const bugId = req.params.bugId
        let visitedBugIds = []
        if (req.cookies.visitedBugs) {
            try {
                visitedBugIds = JSON.parse(req.cookies.visitedBugs)
            } catch {
                visitedBugIds = []
            }
        }
        if (!visitedBugIds.includes(bugId)) {
            visitedBugIds = [...visitedBugIds, bugId]
        }
        if (visitedBugIds.length > 3) {
            return res.status(401).send('Wait for a bit')
        }
        res.cookie('visitedBugs', JSON.stringify(visitedBugIds), {
            maxAge: 7000,
            sameSite: 'Lax',
            secure: false,
            httpOnly: false,
            path: '/',
        })
        const bug = await bugService.getById(bugId)
        if (!bug) return res.status(404).send({ error: 'Bug not found' })
        res.send(bug)
    } catch (err) {
        res.status(500).send({ error: 'Failed to get bug' })
    }
})

app.post('/api/bug', async (req, res) => {
    try {
        const loggedinUser = getLoggedinUser(req)
        if (!loggedinUser) return res.status(401).send({ error: 'Not logged in' })
        const bug = req.body
        bug.createdAt = Date.now()
        bug.creator = { _id: loggedinUser._id, fullname: loggedinUser.fullname }
        const savedBug = await bugService.save(bug)
        res.send(savedBug)
    } catch (err) {
        res.status(500).send({ error: 'Failed to add bug' })
    }
})

app.put('/api/bug/:bugId', async (req, res) => {
    try {
        const loggedinUser = getLoggedinUser(req)
        if (!loggedinUser) return res.status(401).send({ error: 'Not logged in' })
        const bugId = req.params.bugId
        const existing = await bugService.getById(bugId)
        if (!existing) return res.status(404).send({ error: 'Bug not found' })
        if (existing.creator && existing.creator._id !== loggedinUser._id) return res.status(403).send({ error: 'Not owner' })
        const updatable = {}
        if ('title' in req.body) updatable.title = req.body.title
        if ('description' in req.body) updatable.description = req.body.description
        if ('severity' in req.body) updatable.severity = req.body.severity
        if ('labels' in req.body) updatable.labels = req.body.labels
        const bugToSave = { ...existing, ...updatable, _id: bugId, createdAt: existing.createdAt, creator: existing.creator }
        const savedBug = await bugService.save(bugToSave)
        res.send(savedBug)
    } catch (err) {
        res.status(500).send({ error: 'Failed to update bug' })
    }
})

app.delete('/api/bug/:bugId', async (req, res) => {
    try {
        const loggedinUser = getLoggedinUser(req)
        if (!loggedinUser) return res.status(401).send({ error: 'Not logged in' })
        const bugId = req.params.bugId
        const existing = await bugService.getById(bugId)
        if (!existing) return res.status(404).send({ error: 'Bug not found' })
        if (existing.creator && existing.creator._id !== loggedinUser._id) return res.status(403).send({ error: 'Not owner' })
        await bugService.remove(bugId)
        res.send({ msg: 'Bug removed' })
    } catch (err) {
        res.status(500).send({ error: 'Failed to remove bug' })
    }
})

app.listen(3030, () => console.log('Server ready at port 3030'))
