import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { bugService } from './services/bug.service.local.js'

const app = express()

app.use(cors({
    origin: 'http://127.0.0.1:5500',
    credentials: true
}))
app.use(cookieParser())
app.use(express.json())

app.get('/', (req, res) => res.send('Hello there'))

app.get('/api/bug', async (req, res) => {
    try {
        const bugs = await bugService.query()
        res.send(bugs)
    } catch (err) {
        console.error('Failed to get bugs', err)
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

        console.log('User visited the following bugs:', visitedBugIds)

        const bug = await bugService.getById(bugId)
        if (!bug) return res.status(404).send({ error: 'Bug not found' })
        res.send(bug)

    } catch (err) {
        console.error('Failed to get bug', err)
        res.status(500).send({ error: 'Failed to get bug' })
    }
})

app.get('/api/bug/save', async (req, res) => {
    try {
        const bug = {
            _id: req.query._id,
            title: req.query.title,
            description: req.query.description,
            severity: +req.query.severity,
            createdAt: req.query._id ? undefined : Date.now()
        }
        const savedBug = await bugService.save(bug)
        res.send(savedBug)
    } catch (err) {
        console.error('Failed to save bug', err)
        res.status(500).send({ error: 'Failed to save bug' })
    }
})

app.get('/api/bug/:bugId/remove', async (req, res) => {
    try {
        await bugService.remove(req.params.bugId)
        res.send({ msg: 'Bug removed' })
    } catch (err) {
        console.error('Failed to remove bug', err)
        res.status(500).send({ error: 'Failed to remove bug' })
    }
})

app.listen(3030, () => console.log('Server ready at port 3030'))
