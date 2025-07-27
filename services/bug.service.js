const BASE_URL = 'http://localhost:3030/api/bug'

export const bugService = {
    query,
    getById,
    remove,
    save,
    getDefaultFilter
}

function query(filterBy = {}) {
    return fetch(BASE_URL).then(res => res.json())
}

function getById(bugId) {
    return fetch(`${BASE_URL}/${bugId}`).then(res => res.json())
}

function remove(bugId) {
    return fetch(`${BASE_URL}/${bugId}/remove`).then(res => res.json())
}

function save(bug) {
    const params = new URLSearchParams()
    if (bug._id) params.append('_id', bug._id)
    params.append('title', bug.title)
    params.append('description', bug.description || 'No description')
    params.append('severity', bug.severity)

    return fetch(`${BASE_URL}/save?${params.toString()}`).then(res => res.json())
}

function getDefaultFilter() {
    return { txt: '', minSeverity: 0 }
}
