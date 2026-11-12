import { useState } from 'react';
import { buildPath } from '../Path';

function Login() {
    const [message, setMessage] = useState('');
    const [loginName, setLoginName] = useState('');
    const [loginPassword, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    async function doLogin(event: any): Promise<void> {
        event.preventDefault();
        setLoading(true);
        setMessage('');

        const obj = { login: loginName, password: loginPassword };
        const js = JSON.stringify(obj);

        try {
            const response = await fetch(buildPath('api/login'), {
                method: 'POST',
                body: js,
                headers: { 'Content-Type': 'application/json' },
            });

            const res = JSON.parse(await response.text());

            if (res.id <= 0) {
                setMessage('User/Password combination incorrect');
            } else {
                const user = {
                    firstName: res.firstName,
                    lastName: res.lastName,
                    id: res.id,
                };
                localStorage.setItem('user_data', JSON.stringify(user));
                window.location.href = '/cards';
            }
        } catch (error: any) {
            setMessage(error.toString());
        } finally {
            setLoading(false);
        }
    }

    return (
        <main className="app-container">
            <h1 className="title">Card Keeper</h1>
            <p className="subtitle">Sign in to your account</p>

            <form onSubmit={doLogin} noValidate={false}>
                <div className="form-group">
                    <label htmlFor="loginName">Username</label>
                    <input
                        type="text"
                        id="loginName"
                        className="input-field"
                        placeholder="e.g. RickL"
                        value={loginName}
                        onChange={(e) => setLoginName(e.target.value)}
                        autoComplete="username"
                        required
                        aria-required="true"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="loginPassword">Password</label>
                    <input
                        type="password"
                        id="loginPassword"
                        className="input-field"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setPassword(e.target.value)}
                        autoComplete="current-password"
                        required
                        aria-required="true"
                    />
                </div>

                <button
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                    aria-busy={loading}
                >
                    {loading ? 'Signing in...' : 'Log In'}
                </button>
            </form>

            {message && (
                <div
                    role="alert"
                    aria-live="assertive"
                    className="status-message error"
                >
                    {message}
                </div>
            )}
        </main>
    );
}

export default Login;