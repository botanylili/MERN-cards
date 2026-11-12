import React, { useState } from 'react';
import { buildPath } from '../Path';

function CardUI() {
    const _ud: any = localStorage.getItem('user_data');
    const ud = JSON.parse(_ud || '{}');
    const userId: string = ud.id;

    const [message, setMessage] = useState('');
    const [searchResults, setResults] = useState('');
    const [cardList, setCardList] = useState('');
    const [search, setSearchValue] = React.useState('');
    const [card, setCardNameValue] = React.useState('');

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
            setResults('Found ' + _results.length + ' card(s)');
            setCardList(_results.join(', '));
        } catch (error: any) {
            setResults(error.toString());
        }
    }

    return (
        <div className="app-container">
            <h1 className="title">Card Deck</h1>
            <div className="subtitle">Manage Your Collection</div>

            {/* Add Card Section */}
            <form onSubmit={addCard} style={{ marginBottom: '2rem' }}>
                <div className="form-group">
                    <label htmlFor="cardName">New Card Name</label>
                    <input
                        type="text"
                        id="cardName"
                        className="input-field"
                        placeholder="e.g. Ace of Spades"
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

            <hr style={{ borderColor: 'var(--border-color)', margin: '1.5rem 0' }} />

            {/* Search Cards Section */}
            <form onSubmit={searchCard}>
                <div className="form-group">
                    <label htmlFor="searchVal">Search Collection</label>
                    <input
                        type="text"
                        id="searchVal"
                        className="input-field"
                        placeholder="Type card name..."
                        value={search}
                        onChange={(e) => setSearchValue(e.target.value)}
                    />
                </div>
                <button type="submit" className="btn-secondary" style={{ width: '100%' }}>
                    Search Cards
                </button>
            </form>

            {searchResults && (
                <div style={{ marginTop: '1.5rem' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{searchResults}</div>
                    {cardList && <div className="card-item">{cardList}</div>}
                </div>
            )}
        </div>
    );
}

export default CardUI;