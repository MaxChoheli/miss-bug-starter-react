const { useState } = React
const { useNavigate } = ReactRouterDOM

import { userService } from '../services/user.service.js'
import { showErrorMsg, showSuccessMsg } from '../services/event-bus.service.js'

export function LoginSignup() {
    const [mode, setMode] = useState('login')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [fullname, setFullname] = useState('')
    const navigate = useNavigate()

    function onSubmit(ev) {
        ev.preventDefault()
        if (mode === 'login') {
            userService.login({ username, password }).then(() => {
                showSuccessMsg('Logged in')
                navigate('/bug')
            }).catch(() => showErrorMsg('Login failed'))
        } else {
            if (!fullname) return showErrorMsg('Full name required')
            userService.signup({ username, password, fullname }).then(() => {
                showSuccessMsg('Signed up')
                navigate('/bug')
            }).catch(() => showErrorMsg('Signup failed'))
        }
    }

    return <section className="login-signup">
        <h2>{mode === 'login' ? 'Login' : 'Signup'}</h2>
        <form onSubmit={onSubmit}>
            <label>Username</label>
            <input value={username} onChange={ev => setUsername(ev.target.value)} type="text" />
            <label>Password</label>
            <input value={password} onChange={ev => setPassword(ev.target.value)} type="password" />
            {mode === 'signup' && <span>
                <label>Full name</label>
                <input value={fullname} onChange={ev => setFullname(ev.target.value)} type="text" />
            </span>}
            <button type="submit">{mode === 'login' ? 'Login' : 'Signup'}</button>
        </form>
        <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>
            {mode === 'login' ? 'Need an account? Sign up' : 'Have an account? Log in'}
        </button>
    </section>
}
