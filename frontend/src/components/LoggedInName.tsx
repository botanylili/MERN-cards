function LoggedInName() {
    let user: { firstName?: string; lastName?: string } = {};

    try {
        const userData = localStorage.getItem('user_data');
        if (userData) {
            user = JSON.parse(userData);
        }
    } catch (e) {
        console.error(e);
    }

    function doLogout(event: React.MouseEvent<HTMLButtonElement>): void {
        event.preventDefault();
        localStorage.removeItem('user_data');
        window.location.href = '/';
    }

    return (
        <div
            id="loggedInDiv"
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(30, 41, 59, 0.7)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '0.85rem 1.5rem',
                maxWidth: '560px',
                margin: '0 auto 1.5rem auto',
                boxSizing: 'border-box'
            }}
        >
            <span
                id="userName"
                style={{
                    color: '#f8fafc',
                    fontWeight: 600,
                    fontSize: '1rem',
                    letterSpacing: '0.01em'
                }}
            >
                Logged in as <strong style={{ color: '#38bdf8' }}>{user.firstName} {user.lastName}</strong>
            </span>
            <button
                type="button"
                id="logoutButton"
                onClick={doLogout}
                style={{
                    padding: '0.5rem 1.1rem',
                    borderRadius: '8px',
                    border: '1px solid rgba(248, 113, 113, 0.3)',
                    backgroundColor: 'rgba(239, 68, 68, 0.15)',
                    color: '#fca5a5',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                }}
            >
                Log Out
            </button>
        </div>
    );
}

export default LoggedInName;