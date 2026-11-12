import React, { useState, useEffect } from 'react';

interface CardItem {
    id: string;
    card: string;
}

function CardUI() {
    const [card, setCard] = useState('');
    const [search, setSearch] = useState('');
    const [message, setMessage] = useState('');
    const [cardsList, setCardsList] = useState<CardItem[]>([]);

    // Inline editing state
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState('');

    // Retrieve logged-in user
    let userId = -1;
    try {
        const ud = localStorage.getItem('user_data');
        if (ud) {
            const parsed = JSON.parse(ud);
            userId = parsed.id || -1;
        }
    } catch (e) {
        console.error(e);
    }

    const app_name = 'cards.lamp.lilialvarado.com';
    function buildPath(route: string): string {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            return 'http://localhost:5000/' + route;
        }
        return 'https://' + app_name + '/' + route;
    }

    // Load cards on initial mount
    useEffect(() => {
        fetchCards('');
    }, []);

    async function fetchCards(searchTerm: string): Promise<void> {
        const obj = { userId: userId, search: searchTerm };
        const js = JSON.stringify(obj);

        try {
            const response = await fetch(buildPath('api/searchcards'), {
                method: 'POST',
                body: js,
                headers: { 'Content-Type': 'application/json' }
            });

            const res = await response.json();
            if (res.cardList && res.cardList.length > 0) {
                setCardsList(res.cardList);
            } else if (res.results) {
                // Fallback mapping if backend returned string array
                setCardsList(res.results.map((c: string, idx: number) => ({ id: String(idx), card: c })));
            } else {
                setCardsList([]);
            }
        } catch (error: any) {
            console.error(error);
        }
    }

    async function addCard(e: React.FormEvent): Promise<void> {
        e.preventDefault();
        if (!card.trim()) return;

        const obj = { userId: userId, card: card.trim() };
        const js = JSON.stringify(obj);

        try {
            const response = await fetch(buildPath('api/addcard'), {
                method: 'POST',
                body: js,
                headers: { 'Content-Type': 'application/json' }
            });

            const res = await response.json();
            if (res.error && res.error.length > 0) {
                setMessage('API Error: ' + res.error);
            } else {
                setMessage('Card has been added');
                setCard('');
                fetchCards(search);
            }
        } catch (error: any) {
            setMessage(error.toString());
        }
    }

    async function searchCard(e: React.FormEvent): Promise<void> {
        e.preventDefault();
        setMessage('');
        fetchCards(search);
    }

    async function saveEdit(cardItem: CardItem): Promise<void> {
        if (!editValue.trim()) return;

        const obj = {
            cardId: cardItem.id,
            newCard: editValue.trim(),
            userId: userId
        };
        const js = JSON.stringify(obj);

        try {
            const response = await fetch(buildPath('api/editcard'), {
                method: 'POST',
                body: js,
                headers: { 'Content-Type': 'application/json' }
            });

            const res = await response.json();
            if (res.error) {
                setMessage('Edit Error: ' + res.error);
            } else {
                setEditingId(null);
                setEditValue('');
                fetchCards(search);
            }
        } catch (error: any) {
            setMessage(error.toString());
        }
    }

    async function deleteCard(cardItem: CardItem): Promise<void> {
        const obj = {
            cardId: cardItem.id,
            card: cardItem.card,
            userId: userId
        };
        const js = JSON.stringify(obj);

        try {
            const response = await fetch(buildPath('api/deletecard'), {
                method: 'POST',
                body: js,
                headers: { 'Content-Type': 'application/json' }
            });

            const res = await response.json();
            if (res.error) {
                setMessage('Delete Error: ' + res.error);
            } else {
                fetchCards(search);
            }
        } catch (error: any) {
            setMessage(error.toString());
        }
    }

    return (
        <div
            id="cardUIDiv"
            className="app-container"
            style={{
                maxWidth: '560px',
                margin: '0 auto',
                textAlign: 'left'
            }}
        >
            <h2 className="card-title" style={{ textAlign: 'center' }}>Card Deck</h2>
            <div className="card-subtitle" style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                Manage Your Collection
            </div>

            {/* Add Card Form */}
            <form onSubmit={addCard} style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                    Add New Card
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="text"
                        id="cardText"
                        placeholder="e.g. Ace of Spades"
                        value={card}
                        onChange={(e) => setCard(e.target.value)}
                        style={{
                            flex: 1,
                            padding: '0.7rem 1rem',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            backgroundColor: 'rgba(15, 23, 42, 0.6)',
                            color: '#f8fafc'
                        }}
                    />
                    <button
                        type="submit"
                        id="cardAddButton"
                        style={{
                            padding: '0.7rem 1.25rem',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: '#38bdf8',
                            color: '#0f172a',
                            fontWeight: 700,
                            cursor: 'pointer'
                        }}
                    >
                        Add Card
                    </button>
                </div>
                {message && (
                    <span
                        id="cardAddResult"
                        style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.85rem', color: '#38bdf8' }}
                    >
                        {message}
                    </span>
                )}
            </form>

            <hr style={{ borderColor: 'rgba(255, 255, 255, 0.12)', margin: '1.5rem 0' }} />

            {/* Search Form */}
            <form onSubmit={searchCard} style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.35rem' }}>
                    Search Cards
                </label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                        type="text"
                        id="searchText"
                        placeholder="Search your collection..."
                        value={search}
                        onChange={(e) => {
                            setSearch(e.target.value);
                            fetchCards(e.target.value);
                        }}
                        style={{
                            flex: 1,
                            padding: '0.7rem 1rem',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.15)',
                            backgroundColor: 'rgba(15, 23, 42, 0.6)',
                            color: '#f8fafc'
                        }}
                    />
                    <button
                        type="submit"
                        id="cardSearchButton"
                        style={{
                            padding: '0.7rem 1.25rem',
                            borderRadius: '8px',
                            border: '1px solid rgba(255, 255, 255, 0.2)',
                            backgroundColor: 'rgba(255, 255, 255, 0.08)',
                            color: '#f8fafc',
                            fontWeight: 600,
                            cursor: 'pointer'
                        }}
                    >
                        Search
                    </button>
                </div>
            </form>

            {/* Card List with Edit & Delete */}
            <div id="cardSearchResult" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.25rem' }}>
                    Your Cards ({cardsList.length})
                </div>
                {cardsList.length === 0 ? (
                    <div style={{ color: '#64748b', fontSize: '0.9rem', padding: '1rem 0', textAlign: 'center' }}>
                        No cards found. Add one above!
                    </div>
                ) : (
                    cardsList.map((c) => (
                        <div
                            key={c.id}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '0.65rem 0.9rem',
                                borderRadius: '8px',
                                backgroundColor: 'rgba(15, 23, 42, 0.5)',
                                border: '1px solid rgba(255, 255, 255, 0.08)'
                            }}
                        >
                            {editingId === c.id ? (
                                <div style={{ display: 'flex', gap: '0.5rem', flex: 1, marginRight: '0.5rem' }}>
                                    <input
                                        type="text"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        style={{
                                            flex: 1,
                                            padding: '0.4rem 0.6rem',
                                            borderRadius: '6px',
                                            border: '1px solid #38bdf8',
                                            backgroundColor: '#0f172a',
                                            color: '#f8fafc'
                                        }}
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        onClick={() => saveEdit(c)}
                                        style={{
                                            padding: '0.4rem 0.75rem',
                                            borderRadius: '6px',
                                            border: 'none',
                                            backgroundColor: '#38bdf8',
                                            color: '#0f172a',
                                            fontWeight: 600,
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Save
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setEditingId(null)}
                                        style={{
                                            padding: '0.4rem 0.75rem',
                                            borderRadius: '6px',
                                            border: '1px solid rgba(255, 255, 255, 0.2)',
                                            backgroundColor: 'transparent',
                                            color: '#94a3b8',
                                            cursor: 'pointer'
                                        }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <span style={{ color: '#f8fafc', fontWeight: 500, fontSize: '0.95rem' }}>{c.card}</span>
                                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingId(c.id);
                                                setEditValue(c.card);
                                            }}
                                            style={{
                                                padding: '0.35rem 0.65rem',
                                                borderRadius: '6px',
                                                border: '1px solid rgba(56, 189, 248, 0.4)',
                                                backgroundColor: 'rgba(56, 189, 248, 0.1)',
                                                color: '#38bdf8',
                                                fontSize: '0.8rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => deleteCard(c)}
                                            style={{
                                                padding: '0.35rem 0.65rem',
                                                borderRadius: '6px',
                                                border: '1px solid rgba(248, 113, 113, 0.4)',
                                                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                                color: '#fca5a5',
                                                fontSize: '0.8rem',
                                                cursor: 'pointer'
                                            }}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default CardUI;