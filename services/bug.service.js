const BASE_URL = 'http://127.0.0.1:3030/api/bug'

export const bugService = {
    query,
    getById,
    remove,
    save,
    getDefaultFilter
}

function query(filterBy = {}) {
    const queryParams = new URLSearchParams()

    if (filterBy.txt) queryParams.set('txt', filterBy.txt)
    if (filterBy.minSeverity) queryParams.set('minSeverity', filterBy.minSeverity)
    if (filterBy.label) queryParams.set('labels', filterBy.label)
    if (filterBy.sortBy) queryParams.set('sortBy', filterBy.sortBy)
    if (filterBy.sortDir) queryParams.set('sortDir', filterBy.sortDir)
    if (filterBy.pageIdx !== undefined) queryParams.set('pageIdx', filterBy.pageIdx)

    return fetch(`${BASE_URL}?${queryParams.toString()}`, {
        credentials: 'include'
    }).then(res => res.json())
}

function getById(bugId) {
    return fetch(`${BASE_URL}/${bugId}`, {
        credentials: 'include'
    }).then(async res => {
        if (!res.ok) {
            const text = await res.text()
            throw new Error(text)
        }
        return res.json()
    })
}

function remove(bugId) {
    return fetch(`${BASE_URL}/${bugId}`, {
        method: 'DELETE',
        credentials: 'include'
    }).then(res => res.json())
}

function save(bug) {
    const method = bug._id ? 'PUT' : 'POST'
    const url = bug._id ? `${BASE_URL}/${bug._id}` : BASE_URL

    return fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bug),
        credentials: 'include'
    }).then(res => res.json())
}

function getDefaultFilter() {
    return { txt: '', minSeverity: 0, label: '', sortBy: '', sortDir: '', pageIdx: 0 }
}
