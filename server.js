import express from 'express'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { bugService } from './services/bug.service.local.js'

const app = express()
app.use(cors())
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
        console.log('Getting bug with ID:', bugId)

        const bug = await bugService.getById(bugId)
        console.log('Bug found:', bug)

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
