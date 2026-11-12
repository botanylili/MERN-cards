import { useState } from 'react';
import { buildPath } from '../Path';

function CardUI() {
    const _ud: any = localStorage.getItem('user_data');
    const ud = JSON.parse(_ud || '{}');
    const userId: string = ud.id;

    const [message, setMessage] = useState('');
    const [searchResults, setResults] = useState('');
    const [cardList, setCardList] = useState('');
    const [search, setSearchValue] = useState('');
    const [card, setCardNameValue] = useState('');

    async function addCard(e: any): Promise<void> {
        e.preventDefault();
        const obj = { userId: userId, card: card };
        const js = JSON.stringify(obj);

        try {
            const response = await fetch(buildPath('api/addcard'), {
                method: 'POST',
                body: js,
                headers: { 'Content-Type': 'application/json' },
            });

            const res = JSON.parse(await response.text());

            if (res.error && res.error.length > 0) {
                setMessage('API Error: ' + res.error);
            } else {
                setMessage('Card has been added');
                setCardNameValue('');
            }
        } catch (error: any) {
            setMessage(error.toString());
        }
    }

    async function searchCard(e: any): Promise<void> {
        e.preventDefault();
        const obj = { userId: userId, search: search };
        const js = JSON.stringify(obj);

        try {
            const response = await fetch(buildPath('api/searchcards'), {
                method: 'POST',
                body: js,
                headers: { 'Content-Type': 'application/json' },
            });

            const res = JSON.parse(await response.text());
            const _results = res.results || [];
            setResults(`Found ${_results.length} card(s)`);
            setCardList(_results.join(', '));
        } catch (error: any) {
            setResults(error.toString());
        }
    }

    return (
        <div className="app-container">
            <h2 className="card-title">Card Deck</h2>
            <div className="card-subtitle">Manage Your Collection</div>

            {/* Add Card Section */}
            <form onSubmit={addCard} style={{ marginBottom: '1.5rem' }}>
                <div className="form-group">
                    <label htmlFor="cardName">New Card Name</label>
                    <input
                        type="text"
                        id="cardName"
                        className="input-field"
                        placeholder="e.g. Blue-Eyes White Dragon"
                        value={card}
                        onChange={(e) => setCardNameValue(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn-primary">
                    Add Card
                </button>
                {message && <div className="status-message success">{message}</div>}
            </form>

            <hr style={{ borderColor: 'rgba(255, 255, 255, 0.12)', margin: '1.5rem 0' }} />

            {/* Search Cards Section */}
            <form onSubmit={searchCard}>
                <div className="form-group">
                    <label htmlFor="searchVal">Search Collection</label>
                    <input
                        type="text"
                        id="searchVal"
                        className="input-field"
                        placeholder="Search by card name..."
                        value={search}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                </div>
                <button type="submit" className="btn-secondary" style={{ width: '100%' }}>
                    Search Cards
                </button>
            </form>

            {searchResults && (
                <div style={{ marginTop: '1.25rem' }}>
                    <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>{searchResults}</div>
                    {cardList && <div className="card-item-box">{cardList}</div>}
                </div>
            )}
        </div>
    );
}

export default CardUI;