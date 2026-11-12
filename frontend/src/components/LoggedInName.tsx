function LoggedInName() {
    const _ud: any = localStorage.getItem('user_data');
    const ud = JSON.parse(_ud || '{}');
    const firstName: string = ud.firstName || 'User';
    const lastName: string = ud.lastName || '';

    function doLogout(): void {
        localStorage.removeItem('user_data');
        window.location.href = '/';
    }

    return (
        <div
            style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                paddingBottom: '1rem',
                borderBottom: '1px solid var(--border-color)',
            }}
        >
            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                Signed in as <strong style={{ color: '#fff' }}>{firstName} {lastName}</strong>
            </span>
            <button onClick={doLogout} className="btn-secondary">
                Log Out
            </button>
        </div>
    );
}

export default LoggedInName;