'use client'

import { useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Lock, Mail, Loader2, AlertCircle } from 'lucide-react'

export default function FacultyLoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null)
    const router = useRouter()

    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                setMessage({ type: 'error', text: error.message })
            } else if (data.user) {
                // Check if email is verified (Auth usually handles this, but we can enforce check)
                // If 'Require email confirmation' is on in Supabase, signIn fails or user object has details.
                router.push('/faculty/upload')
                router.refresh()
            }
        } catch (err: any) {
            setMessage({ type: 'error', text: 'An unexpected error occurred.' })
        } finally {
            setLoading(false)
        }
    }

    async function handleSignUp(e: React.MouseEvent) {
        e.preventDefault()
        setLoading(true)
        setMessage(null)

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    emailRedirectTo: `${location.origin}/auth/callback`,
                }
            })

            if (error) {
                setMessage({ type: 'error', text: error.message })
            } else if (data.user && !data.session) {
                setMessage({ type: 'success', text: 'Please check your email to verify your account.' })
            } else {
                router.push('/faculty/upload')
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Signup failed.' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <div className="card" style={{ maxWidth: '400px', width: '100%', padding: '2rem' }}>
                <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                    <div style={{ background: '#eff6ff', width: '50px', height: '50px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
                        <Lock color="var(--primary)" />
                    </div>
                    <h1>Faculty Access</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Secure login for exam management</p>
                </div>

                <form onSubmit={handleLogin}>
                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Email Address</label>
                        <div style={{ position: 'relative' }}>
                            <Mail size={18} style={{ position: 'absolute', top: '12px', left: '12px', color: 'var(--text-muted)' }} />
                            <input
                                type="email"
                                className="input"
                                style={{ paddingLeft: '2.5rem' }}
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                required
                                placeholder="faculty@college.edu"
                            />
                        </div>
                    </div>

                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', fontWeight: '500' }}>Password</label>
                        <input
                            type="password"
                            className="input"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
                        {loading ? <Loader2 className="spin" /> : 'Sign In'}
                    </button>

                    <button
                        type="button"
                        onClick={handleSignUp}
                        style={{
                            width: '100%',
                            marginTop: '1rem',
                            background: 'none',
                            border: 'none',
                            color: 'var(--text-muted)',
                            cursor: 'pointer',
                            fontSize: '0.9rem'
                        }}
                        disabled={loading}
                    >
                        New faculty? Create account
                    </button>
                </form>

                {message && (
                    <div style={{
                        marginTop: '1.5rem',
                        padding: '0.75rem',
                        borderRadius: 'var(--radius)',
                        fontSize: '0.9rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        background: message.type === 'error' ? '#fee2e2' : '#dcfce7',
                        color: message.type === 'error' ? '#dc2626' : '#166534'
                    }}>
                        <AlertCircle size={16} />
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    )
}
