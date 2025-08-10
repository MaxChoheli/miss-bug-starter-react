const { NavLink, useNavigate } = ReactRouterDOM
import { userService } from '../services/user.service.js'
import { eventBusService } from '../services/event-bus.service.js'

export function AppHeader() {
    const navigate = useNavigate()
    const [user, setUser] = React.useState(userService.getLoggedinUser() || null)

    React.useEffect(() => {
        const off = eventBusService.on('user-changed', u => setUser(u))
        return off
    }, [])

    function onLogout() {
        userService.logout().then(() => navigate('/'))
    }

    return <header className="app-header main-content single-row">
        <h1>Miss Bug</h1>
        <nav>
            <NavLink to="/">Home</NavLink>
            <NavLink to="/bug">Bugs</NavLink>
            <NavLink to="/about">About</NavLink>
            {user ? <span>
                <NavLink to={`/user/${user._id}`}>Profile</NavLink>
                <button onClick={onLogout}>Logout</button>
            </span> : <NavLink to="/login">Login</NavLink>}
        </nav>
    </header>
}
