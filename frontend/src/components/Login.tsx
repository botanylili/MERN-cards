import React, { useState } from 'react';

function Login() {
    const [isRegister, setIsRegister] = useState(false);
    const [message, setMessage] = useState('');

    // Login fields
    const [loginName, setLoginName] = useState('');
    const [loginPassword, setLoginPassword] = useState('');

    // Register fields
    const [regFirstName, setRegFirstName] = useState('');
    const [regLastName, setRegLastName] = useState('');
    const [regLogin, setRegLogin] = useState('');
    const [regPassword, setRegPassword] = useState('');

    // Determine correct base URL for API requests
    const app_name = 'cards.lamp.lilialvarado.com';
    function buildPath(route: string): string {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:5000/' + route;
        }
        return 'https://' + app_name + '/' + route;
    }

    // Handle Log In
    async function doLogin(event: React.FormEvent): Promise<void> {
        event.preventDefault();
        setMessage('');

        const obj = { login: loginName.trim(), password: loginPassword.trim() };
        const js = JSON.stringify(obj);

        try {
            const response = await fetch(buildPath('api/login'), {
                method: 'POST',
                body: js,
                headers: { 'Content-Type': 'application/json' }
            });

            const res = await response.json();

            if (res.id <= 0 || res.error) {
                setMessage(res.error || 'User/Password combination incorrect');
            } else {
                const user = { firstName: res.firstName, lastName: res.lastName, id: res.id };
                localStorage.setItem('user_data', JSON.stringify(user));
                setMessage('');
                window.location.href = '/cards';
            }
        } catch (error: any) {
            setMessage(error.toString());
        }
    }

    // Handle Registration
    async function doRegister(event: React.FormEvent): Promise<void> {
        event.preventDefault();
        setMessage('');

        if (!regFirstName.trim() || !regLastName.trim() || !regLogin.trim() || !regPassword.trim()) {
            setMessage('All fields are required');
            return;
        }

        const obj = {
            firstName: regFirstName.trim(),
            lastName: regLastName.trim(),
            login: regLogin.trim(),
            password: regPassword.trim()
        };
        const js = JSON.stringify(obj);

        try {
            const response = await fetch(buildPath('api/register'), {
                method: 'POST',
                body: js,
                headers: { 'Content-Type': 'application/json' }
            });

            const res = await response.json();

            if (res.error) {
                setMessage(res.error);
            } else {
                // Automatically save session and navigate into the app
                const user = { firstName: res.firstName, lastName: res.lastName, id: res.id };
                localStorage.setItem('user_data', JSON.stringify(user));
                setMessage('');
                window.location.href = '/cards';
            }
        } catch (error: any) {
            setMessage(error.toString());
        }
    }

    return (
        <div id="loginDiv" className="app-container" style={{ maxWidth: '420px', margin: '0 auto' }}>
            {/* Tab switcher */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <button
                    type="button"
                    onClick={() => { setIsRegister(false); setMessage(''); }}
                    style={{
                        flex: 1,
                        padding: '0.6rem 1rem',
                        borderRadius: '8px',
                        border: 'none',
                        fontWeight: 600,
                        cursor: 'pointer',
                        backgroundColor: !isRegister ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)',
                        color: !isRegister ? '#0f172a' : '#94a3b8',
                        transition: 'all 0.2s ease'
                    }}
                >
                    Sign In
                </button>
                <button
                    type="button"
                    onClick={() => { setIsRegister(true); setMessage(''); }}
                    style={{
                        flex: 1,
                        padding: '0.6rem 1rem',
                        borderRadius: '8px',
                        border: 'none',
                        fontWeight: 600,
                        cursor: 'pointer',
                        backgroundColor: isRegister ? '#38bdf8' : 'rgba(255, 255, 255, 0.08)',
                        color: isRegister ? '#0f172a' : '#94a3b8',
                        transition: 'all 0.2s ease'
                    }}
                >
                    Register
                </button>
            </div>

            {!isRegister ? (
                /* Login Form */
                <form onSubmit={doLogin}>
                    <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                            Username
                        </label>
                        <input
                            type="text"
                            id="loginName"
                            placeholder="e.g. RickL"
                            value={loginName}
                            onChange={(e) => setLoginName(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                                color: '#f8fafc',
                                boxSizing: 'border-box'
                            }}
                            required
                        />
                    </div>

                    <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                            Password
                        </label>
                        <input
                            type="password"
                            id="loginPassword"
                            placeholder="••••••••"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                                color: '#f8fafc',
                                boxSizing: 'border-box'
                            }}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        id="loginButton"
                        style={{
                            width: '100%',
                            padding: '0.8rem',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#38bdf8',
                            color: '#0f172a',
                            fontWeight: 700,
                            fontSize: '1rem',
                            cursor: 'pointer'
                        }}
                    >
                        Log In
                    </button>
                </form>
            ) : (
                /* Register Form */
                <form onSubmit={doRegister}>
                    <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div style={{ flex: 1, textAlign: 'left' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                                First Name
                            </label>
                            <input
                                type="text"
                                id="regFirstName"
                                placeholder="Jane"
                                value={regFirstName}
                                onChange={(e) => setRegFirstName(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                                    color: '#f8fafc',
                                    boxSizing: 'border-box'
                                }}
                                required
                            />
                        </div>

                        <div style={{ flex: 1, textAlign: 'left' }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                                Last Name
                            </label>
                            <input
                                type="text"
                                id="regLastName"
                                placeholder="Doe"
                                value={regLastName}
                                onChange={(e) => setRegLastName(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem 1rem',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(255, 255, 255, 0.15)',
                                    backgroundColor: 'rgba(15, 23, 42, 0.6)',
                                    color: '#f8fafc',
                                    boxSizing: 'border-box'
                                }}
                                required
                            />
                        </div>
                    </div>

                    <div style={{ textAlign: 'left', marginBottom: '1rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                            Username
                        </label>
                        <input
                            type="text"
                            id="regLogin"
                            placeholder="Pick a username"
                            value={regLogin}
                            onChange={(e) => setRegLogin(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                                color: '#f8fafc',
                                boxSizing: 'border-box'
                            }}
                            required
                        />
                    </div>

                    <div style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.3rem' }}>
                            Password
                        </label>
                        <input
                            type="password"
                            id="regPassword"
                            placeholder="Create password"
                            value={regPassword}
                            onChange={(e) => setRegPassword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.75rem 1rem',
                                borderRadius: '8px',
                                border: '1px solid rgba(255, 255, 255, 0.15)',
                                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                                color: '#f8fafc',
                                boxSizing: 'border-box'
                            }}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        id="registerButton"
                        style={{
                            width: '100%',
                            padding: '0.8rem',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#38bdf8',
                            color: '#0f172a',
                            fontWeight: 700,
                            fontSize: '1rem',
                            cursor: 'pointer'
                        }}
                    >
                        Create Account
                    </button>
                </form>
            )}

            {message && (
                <span
                    id="loginResult"
                    style={{
                        display: 'block',
                        marginTop: '1.25rem',
                        color: message.toLowerCase().includes('incorrect') || message.toLowerCase().includes('already') || message.toLowerCase().includes('required')
                            ? '#f87171'
                            : '#38bdf8',
                        fontSize: '0.9rem',
                        fontWeight: 500
                    }}
                >
                    {message}
                </span>
            )}
        </div>
    );
}

export default Login;