const { useState, useEffect } = React
const { Link, useParams } = ReactRouterDOM

import { bugService } from '../services/bug.service.js'
import { showErrorMsg } from '../services/event-bus.service.js'

export function BugDetails() {
    const [bug, setBug] = useState(null)
    const { bugId } = useParams()

    useEffect(() => {
        bugService.getById(bugId)
            .then(setBug)
            .catch(err => {
                if (err.message === 'Wait for a bit') {
                    showErrorMsg("You've viewed too many bugs. Please wait 7 seconds.")
                } else {
                    showErrorMsg('Cannot load bug')
                }
            })
    }, [bugId])

    return <div className="bug-details">
        <h3>Bug Details</h3>
        {!bug && <p className="loading">Loading....</p>}
        {
            bug &&
            <div>
                <h4>{bug.title}</h4>
                <h5>Severity: <span>{bug.severity}</span></h5>
                <p>{bug.description}</p>
                {bug.labels && bug.labels.length > 0 && (
                    <p>Labels: {bug.labels.join(', ')}</p>
                )}
                {bug.creator && <p>Creator: {bug.creator.fullname}</p>}
            </div>
        }
        <hr />
        <Link to="/bug">Back to List</Link>
    </div>
}
