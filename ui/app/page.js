'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isRegister, setIsRegister] = useState(false);
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const endpoint = isRegister ? '/api/users/register' : '/api/users/login';
        const body = isRegister
            ? { email, password, fullName, passwordHash: password }
            : { email, password };

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) {
                throw new Error('Authentication failed');
            }

            const user = await res.json();
            localStorage.setItem('user', JSON.stringify(user));
            router.push('/dashboard');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: 'radial-gradient(circle at center, #1e1e24 0%, #09090b 100%)' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '2rem' }} className="text-gradient">
                    {isRegister ? 'Create Account' : 'Welcome Back'}
                </h1>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label className="label">Email Address</label>
                        <input
                            className="input"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    {isRegister && (
                        <div className="input-group">
                            <label className="label">Full Name</label>
                            <input
                                className="input"
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                required
                            />
                        </div>
                    )}

                    <div className="input-group">
                        <label className="label">Password</label>
                        <input
                            className="input"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                        {isRegister ? 'Sign Up' : 'Log In'}
                    </button>
                </form>

                {error && <div style={{ color: '#ef4444', marginTop: '1rem', textAlign: 'center', fontSize: '0.9rem' }}>{error}</div>}

                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <span
                        style={{ cursor: 'pointer', color: 'var(--primary)', fontSize: '0.9rem' }}
                        onClick={() => setIsRegister(!isRegister)}
                    >
                        {isRegister ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
                    </span>
                </div>
            </div>
        </div>
    );
}
