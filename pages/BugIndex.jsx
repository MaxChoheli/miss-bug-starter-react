const { useState, useEffect } = React

import { bugService } from '../services/bug.service.js'
import { userService } from '../services/user.service.js'
import { showSuccessMsg, showErrorMsg } from '../services/event-bus.service.js'

import { BugFilter } from '../cmps/BugFilter.jsx'
import { BugList } from '../cmps/BugList.jsx'

export function BugIndex() {
    const [bugs, setBugs] = useState(null)
    const [filterBy, setFilterBy] = useState(bugService.getDefaultFilter())

    useEffect(loadBugs, [filterBy])

    function loadBugs() {
        bugService.query(filterBy)
            .then(bugs => {
                if (filterBy.label) {
                    bugs = bugs.filter(bug => bug.labels && bug.labels.includes(filterBy.label))
                }
                setBugs(bugs)
            })
            .catch(err => showErrorMsg(`Couldn't load bugs - ${err}`))
    }

    function onRemoveBug(bugId) {
        bugService.remove(bugId)
            .then(() => {
                const bugsToUpdate = bugs.filter(bug => bug._id !== bugId)
                setBugs(bugsToUpdate)
                showSuccessMsg('Bug removed')
            })
            .catch(err => showErrorMsg(`Cannot remove bug`, err))
    }

    function onAddBug() {
        const user = userService.getLoggedinUser()
        if (!user) return showErrorMsg('Please log in first')
        const title = prompt('Bug title?', 'Bug ' + Date.now())
        const description = prompt('Bug description?', '')
        const severity = +prompt('Bug severity?', 3)
        const labelStr = prompt('Labels? (comma separated)', '')
        const labels = labelStr ? labelStr.split(',').map(l => l.trim()) : []
        const creator = { _id: user._id, fullname: user.fullname }
        const bug = { title, description, severity, labels, creator }
        bugService.save(bug)
            .then(savedBug => {
                setBugs([...bugs, savedBug])
                showSuccessMsg('Bug added')
            })
            .catch(err => showErrorMsg(`Cannot add bug`, err))
    }

    function onEditBug(bug) {
        const description = prompt('New description?', bug.description || '')
        const severity = +prompt('New severity?', bug.severity)
        const labelStr = prompt('New labels? (comma separated)', (bug.labels && bug.labels.join(', ')) || '')
        const labels = labelStr ? labelStr.split(',').map(l => l.trim()) : []
        const bugToSave = { ...bug, description, severity, labels }
        bugService.save(bugToSave)
            .then(savedBug => {
                const bugsToUpdate = bugs.map(currBug =>
                    currBug._id === savedBug._id ? savedBug : currBug)
                setBugs(bugsToUpdate)
                showSuccessMsg('Bug updated')
            })
            .catch(err => showErrorMsg('Cannot update bug', err))
    }

    function onSetFilterBy(filterBy) {
        setFilterBy(prevFilter => ({ ...prevFilter, ...filterBy }))
    }

    return <section className="bug-index main-content">
        <BugFilter filterBy={filterBy} onSetFilterBy={onSetFilterBy} />
        <header>
            <h3>Bug List</h3>
            <button onClick={onAddBug}>Add Bug</button>
        </header>
        <BugList
            bugs={bugs}
            onRemoveBug={onRemoveBug}
            onEditBug={onEditBug} />
    </section>
}
