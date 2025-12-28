export default function Loading() {
    return (
        <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
            <div className="loader" style={{ width: '40px', height: '40px', margin: '0 auto 2rem' }}></div>
            <h2>Analyzing Past Papers...</h2>
            <p style={{ color: 'var(--text-muted)' }}>
                Finding semantic clusters and calculating yield scores.<br />
                This may take a few seconds.
            </p>
        </div>
    )
}
