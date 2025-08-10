export const bugService = {
    query,
    getById,
    save,
    remove,
}

let bugs = [
    {
        _id: '1NF1N1T3',
        title: 'Infinite Loop Detected',
        description: 'Looping forever in main thread',
        severity: 4,
        createdAt: Date.now(),
        labels: ['critical', 'performance'],
        creator: { _id: 'u101', fullname: 'Puki Ja' }
    },
    {
        _id: 'K3YB0RD',
        title: 'Keyboard Not Found',
        description: 'User keyboard disappeared!',
        severity: 3,
        createdAt: Date.now(),
        labels: ['hardware', 'investigate'],
        creator: { _id: 'u101', fullname: 'Puki Ja' }
    },
    {
        _id: 'C0FF33',
        title: '404 Coffee Not Found',
        description: 'The coffee machine is empty!',
        severity: 2,
        createdAt: Date.now(),
        labels: ['funny', 'low-priority'],
        creator: { _id: 'u101', fullname: 'Puki Ja' }
    },
    {
        _id: 'G0053',
        title: 'Unexpected Response',
        description: 'The server sent back an alien format',
        severity: 1,
        createdAt: Date.now(),
        labels: ['bug', 'api'],
        creator: { _id: 'u101', fullname: 'Puki Ja' }
    }
]

function query(filterBy = {}, sortOptions = {}, paging = {}) {
    let filteredBugs = [...bugs]

    if (filterBy.txt) {
        const regex = new RegExp(filterBy.txt, 'i')
        filteredBugs = filteredBugs.filter(bug =>
            regex.test(bug.title) || regex.test(bug.description)
        )
    }

    if (filterBy.minSeverity) {
        filteredBugs = filteredBugs.filter(bug => bug.severity >= filterBy.minSeverity)
    }

    if (filterBy.labels && filterBy.labels.length) {
        filteredBugs = filteredBugs.filter(bug =>
            bug.labels && bug.labels.some(label => filterBy.labels.includes(label))
        )
    }

    if (sortOptions.sortBy) {
        const dir = sortOptions.sortDir === -1 ? -1 : 1
        filteredBugs.sort((a, b) => {
            if (a[sortOptions.sortBy] < b[sortOptions.sortBy]) return -1 * dir
            if (a[sortOptions.sortBy] > b[sortOptions.sortBy]) return 1 * dir
            return 0
        })
    }

    const startIdx = paging.pageIdx * paging.pageSize
    const pagedBugs = paging.pageSize ? filteredBugs.slice(startIdx, startIdx + paging.pageSize) : filteredBugs

    return Promise.resolve(pagedBugs)
}

function getById(bugId) {
    const bug = bugs.find(b => b._id === bugId)
    return Promise.resolve(bug)
}

function remove(bugId) {
    bugs = bugs.filter(b => b._id !== bugId)
    return Promise.resolve()
}

function save(bug) {
    if (bug._id) {
        const idx = bugs.findIndex(b => b._id === bug._id)
        bugs[idx] = bug
    } else {
        bug._id = _makeId()
        bug.createdAt = Date.now()
        bug.labels = bug.labels || []
        bug.creator = bug.creator || { _id: 'u101', fullname: 'Puki Ja' }
        bugs.push(bug)
    }
    return Promise.resolve(bug)
}

function _makeId(length = 6) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let txt = ''
    for (let i = 0; i < length; i++) {
        txt += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return txt
}
