import Link from 'next/link'
import { BookOpen, UploadCloud, ShieldAlert, Zap } from 'lucide-react'

export default function Home() {
  return (
    <main style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Hero Section */}
      <section style={{
        background: 'var(--primary)',
        color: 'white',
        padding: '5rem 1rem',
        textAlign: 'center'
      }}>
        <div className="container">
          <h1 style={{ color: 'white', fontSize: '2.5rem', marginBottom: '1rem' }}>First-Year Exam Intelligence</h1>
          <p style={{ fontSize: '1.25rem', opacity: 0.9, marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
            A Time-Constrained Study Optimizer for Engineering Students.
            Leverage AI to identify high-yield topics from past papers.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/student" style={{ textDecoration: 'none' }}>
              <button className="btn" style={{
                background: 'white',
                color: 'var(--primary)',
                padding: '1rem 2rem',
                fontSize: '1.1rem'
              }}>
                <Zap size={20} style={{ marginRight: '0.5rem' }} />
                Student Portal
              </button>
            </Link>
            <Link href="/faculty/upload" style={{ textDecoration: 'none' }}>
              <button className="btn" style={{
                background: 'rgba(255,255,255,0.1)',
                color: 'white',
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                border: '1px solid rgba(255,255,255,0.3)'
              }}>
                <UploadCloud size={20} style={{ marginRight: '0.5rem' }} />
                Faculty Upload
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container" style={{ padding: '4rem 1rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        <div className="card">
          <BookOpen size={32} color="var(--accent)" style={{ marginBottom: '1rem' }} />
          <h3>Intelligent Clustering</h3>
          <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>
            We semantic-match questions across years (2018-2024) to find recurring patterns and high-value modules.
          </p>
        </div>
        <div className="card">
          <UploadCloud size={32} color="var(--accent)" style={{ marginBottom: '1rem' }} />
          <h3>Zero-Tagging Upload</h3>
          <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>
            Faculty simply drop raw PDF/Images. Our OCR + Vision engine structures the data instantly.
          </p>
        </div>
        <div className="card">
          <ShieldAlert size={32} color="#dc2626" style={{ marginBottom: '1rem' }} />
          <h3>Survival Mode</h3>
          <p style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }}>
            Short on time? View the "Critical Path" – a risk-disclosed list of topics that mathematically maximize passing probability.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ marginTop: 'auto', borderTop: '1px solid var(--border)', padding: '2rem 0', textAlign: 'center', background: 'var(--surface)' }}>
        <div className="container">
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            © 2025 Exam Intelligence Group. Built for Hackathon Demo. <br />
            Disclaimer: This tool optimizes probability, not certainty.
          </p>
        </div>
      </footer>
    </main>
  )
}
