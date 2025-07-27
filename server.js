import express from 'express'
import cookieParser from 'cookie-parser'
import { bugService } from './services/bug.service.js'

const app = express()

app.use(cookieParser())
app.use(express.json())

app.get('/', (req, res) => res.send('Hello there'))

app.get('/api/bug', async (req, res) => {
    const bugs = await bugService.query()
    res.send(bugs)
})

app.get('/api/bug/:bugId', async (req, res) => {
    const bug = await bugService.getById(req.params.bugId)
    res.send(bug)
})

app.get('/api/bug/save', async (req, res) => {
    const bug = {
        _id: req.query._id,
        title: req.query.title,
        description: req.query.description,
        severity: +req.query.severity,
        createdAt: req.query._id ? undefined : Date.now()
    }
    const savedBug = await bugService.save(bug)
    res.send(savedBug)
})

app.get('/api/bug/:bugId/remove', async (req, res) => {
    await bugService.remove(req.params.bugId)
    res.send({ msg: 'Bug removed' })
})

app.listen(3030, () => console.log('Server ready at port 3030'))
