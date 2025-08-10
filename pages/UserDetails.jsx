const { useEffect, useState } = React
const { useParams } = ReactRouterDOM

import { bugService } from '../services/bug.service.js'
import { BugList } from '../cmps/BugList.jsx'
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service.js'

export function UserDetails() {
    const { userId } = useParams()
    const [bugs, setBugs] = useState(null)

    useEffect(() => {
        loadAllBugs()
    }, [userId])

    function loadAllBugs() {
        let pageIdx = 0
        let all = []
        function next() {
            return bugService.query({ pageIdx }).then(part => {
                if (!part || part.length === 0) return all
                all = all.concat(part)
                pageIdx++
                return next()
            })
        }
        next().then(res => {
            const filtered = res.filter(b => b.creator && b.creator._id === userId)
            setBugs(filtered)
        }).catch(() => showErrorMsg('Cannot load user bugs'))
    }

    function onRemoveBug(bugId) {
        bugService.remove(bugId).then(() => {
            setBugs(bugs.filter(b => b._id !== bugId))
            showSuccessMsg('Bug removed')
        }).catch(() => showErrorMsg('Cannot remove bug'))
    }

    function onEditBug(bug) {
        const description = prompt('New description?', bug.description || '')
        const severity = +prompt('New severity?', bug.severity)
        const labelStr = prompt('New labels? (comma separated)', bug.labels && bug.labels.join(', '))
        const labels = labelStr ? labelStr.split(',').map(l => l.trim()) : []
        const bugToSave = { ...bug, description, severity, labels }
        bugService.save(bugToSave).then(saved => {
            const updated = bugs.map(curr => curr._id === saved._id ? saved : curr)
            setBugs(updated)
            showSuccessMsg('Bug updated')
        }).catch(() => showErrorMsg('Cannot update bug'))
    }

    return <section className="user-details main-content">
        <h2>User Bugs</h2>
        <BugList bugs={bugs} onRemoveBug={onRemoveBug} onEditBug={onEditBug} />
    </section>
}
