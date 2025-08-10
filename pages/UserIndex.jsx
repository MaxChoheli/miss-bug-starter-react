const { useEffect, useState } = React
import { userService } from '../services/user.service.js'
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service.js'

export function UserIndex() {
    const [users, setUsers] = useState(null)

    useEffect(() => {
        loadUsers()
    }, [])

    function loadUsers() {
        userService.queryUsers()
            .then(setUsers)
            .catch(() => showErrorMsg('Cannot load users'))
    }

    function onRemove(userId) {
        userService.removeUser(userId)
            .then(() => {
                setUsers(users.filter(u => u._id !== userId))
                showSuccessMsg('User removed')
            })
            .catch(async err => {
                showErrorMsg('Cannot remove user')
            })
    }

    if (!users) return <div className="main-content">Loading...</div>

    return <section className="main-content">
        <h2>Users</h2>
        <ul className="user-list">
            {users.map(u => (
                <li key={u._id}>
                    <span>{u.fullname} ({u.username}) {u.isAdmin ? '• Admin' : ''}</span>
                    <button onClick={() => onRemove(u._id)}>Delete</button>
                </li>
            ))}
        </ul>
    </section>
}
