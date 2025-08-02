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
        labels: ['critical', 'performance']
    },
    {
        _id: 'K3YB0RD',
        title: 'Keyboard Not Found',
        description: 'User keyboard disappeared!',
        severity: 3,
        createdAt: Date.now(),
        labels: ['hardware', 'investigate']
    },
    {
        _id: 'C0FF33',
        title: '404 Coffee Not Found',
        description: 'The coffee machine is empty!',
        severity: 2,
        createdAt: Date.now(),
        labels: ['funny', 'low-priority']
    },
    {
        _id: 'G0053',
        title: 'Unexpected Response',
        description: 'The server sent back an alien format',
        severity: 1,
        createdAt: Date.now(),
        labels: ['bug', 'api']
    }
]

function query() {
    return Promise.resolve(bugs)
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
