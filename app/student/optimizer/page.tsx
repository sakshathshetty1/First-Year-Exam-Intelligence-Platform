import { supabase } from '@/lib/supabase'
import { analyzeQuestionsWithGemini } from '@/lib/gemini'
import { AlertTriangle, TrendingUp, CheckCircle, Shield } from 'lucide-react'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

export default async function OptimizerPage({ searchParams }: { searchParams: Promise<{ subject_id?: string, date: string, exam_type?: string }> }) {
    const { subject_id, date, exam_type } = await searchParams

    if (!subject_id) return <div className="container">Invalid Subject Request</div>

    // 1. Fetch Subject Metadata
    const { data: subjectData, error: subjectError } = await supabase
        .from('subjects')
        .select('*')
        .eq('id', subject_id)
        .single()

    if (subjectError || !subjectData) {
        return (
            <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
                <h2 style={{ marginBottom: '1rem' }}>Subject Not Found</h2>
                <p style={{ color: 'var(--text-muted)' }}>The requested subject ID invalid or missing.</p>
                <Link href="/student">
                    <button className="btn btn-primary">Back to Selector</button>
                </Link>
            </div>
        )
    }

    const subjectName = subjectData.name

    // 2. Fetch Exams by Subject ID
    let query = supabase
        .from('exams')
        .select('id, year, exam_type')
        .eq('subject_id', subject_id)

    // Apply Exam Type Filter if not 'all'
    if (exam_type === 'internal') {
        // Broad match for internal/midterm type exams
        query = query.or('exam_type.ilike.%internal%,exam_type.ilike.%mid%,exam_type.ilike.%quiz%,exam_type.ilike.%test%')
    } else if (exam_type === 'end_semester') {
        // Broad match for end semester/final exams
        query = query.or('exam_type.ilike.%end%,exam_type.ilike.%final%,exam_type.ilike.%sem%,exam_type.ilike.%external%')
    }

    const { data: exams } = await query

    if (!exams || exams.length === 0) {
        return (
            <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>
                <h2 style={{ marginBottom: '1rem' }}>No Data Found for "{subjectName}"</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                    We don't have any past papers for this subject yet.
                </p>
                <Link href="/faculty/upload">
                    <button className="btn btn-primary">Upload Papers</button>
                </Link>
            </div>
        )
    }

    const examIds = exams.map(e => e.id)

    const { data: questions } = await supabase
        .from('questions')
        .select('*, exams(year)')
        .in('exam_id', examIds)

    if (!questions || questions.length === 0) {
        return <div className="container">Found exams but no questions extracted.</div>
    }

    // 3. Analyze with Gemini
    const analysis = await analyzeQuestionsWithGemini(questions, subjectName, date)

    // Sort clusters by yield
    const sortedClusters = analysis.clusters.sort((a: any, b: any) => b.yield_score - a.yield_score)

    return (
        <div className="container" style={{ maxWidth: '1000px', padding: '2rem 1rem' }}>
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.8rem' }}>Study Optimizer: {subjectName}</h1>
                    <p style={{ color: 'var(--text-muted)' }}>Target Exam Date: {date} • {questions.length} Questions Analyzed</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--accent)' }}>
                        {sortedClusters.length}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>TOPICS IDENTIFIED</div>
                </div>
            </header>

            {/* Survival Guide / Highlights */}
            <section style={{ marginBottom: '2rem' }}>
                <div className="card" style={{ background: '#fff7ed', borderColor: '#fdba74' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#c2410c' }}>
                        <Shield size={24} />
                        <h2 style={{ fontSize: '1.25rem', color: '#c2410c' }}>Survival Mode: Absolute Must-Knows</h2>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                        {analysis.survival_guide.map((item: any, i: number) => (
                            <div key={i} style={{ background: 'white', padding: '1rem', borderRadius: 'var(--radius)', border: '1px solid #fed7aa' }}>
                                <div style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#c2410c' }}>#{i + 1} {item.topic}</div>
                                <p style={{ fontSize: '0.9rem', color: '#9a3412' }}>{item.reason}</p>
                            </div>
                        ))}
                    </div>
                    <p style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#c2410c', fontStyle: 'italic' }}>
                        Warning: Focusing only on these limits your maximum possible grade.
                    </p>
                </div>
            </section>

            {/* Main Clusters List */}
            <section>
                <h2 style={{ marginBottom: '1.5rem' }}>High-Yield Topic Priority</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {sortedClusters.map((cluster: any, i: number) => (
                        <div key={i} className="card" style={{ position: 'relative', overflow: 'hidden' }}>
                            <div style={{
                                position: 'absolute', top: 0, left: 0, bottom: 0, width: '6px',
                                background: i < 3 ? 'var(--accent)' : 'var(--border)'
                            }} />

                            <div style={{ marginLeft: '1rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
                                <div style={{ flex: 1, minWidth: '300px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                        <h3 style={{ fontSize: '1.2rem', color: 'var(--primary)' }}>{cluster.topic}</h3>
                                        {i < 3 && <span style={{ background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '600' }}>HIGH YIELD</span>}
                                    </div>
                                    <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>{cluster.summary}</p>

                                    <div style={{ padding: '0.75rem', background: 'var(--background)', borderRadius: 'var(--radius)' }}>
                                        <small style={{ fontWeight: '600', color: 'var(--text-muted)', display: 'block', marginBottom: '0.5rem' }}>EXAMPLE QUESTIONS</small>
                                        <ul style={{ paddingLeft: '1.2rem', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                                            {cluster.example_questions.map((q: string, j: number) => (
                                                <li key={j} style={{ marginBottom: '0.25rem' }}>{q}</li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>

                                <div style={{
                                    display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: '150px',
                                    borderLeft: '1px solid var(--border)', paddingLeft: '1rem'
                                }}>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                            <TrendingUp size={16} /> Frequency
                                        </div>
                                        <div style={{ fontWeight: '600', fontSize: '1.2rem' }}>{cluster.frequency} <span style={{ fontSize: '0.9rem', fontWeight: '400' }}>occurrences</span></div>
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                            <CheckCircle size={16} /> Avg. Marks
                                        </div>
                                        <div style={{ fontWeight: '600', fontSize: '1.2rem' }}>{Math.round(cluster.avg_marks)}m</div>
                                    </div>
                                    <div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                            <AlertTriangle size={16} /> Skip Risk
                                        </div>
                                        <div style={{
                                            fontWeight: '700',
                                            color: cluster.risk_of_skipping === 'High' ? '#dc2626' : cluster.risk_of_skipping === 'Medium' ? '#d97706' : '#166534'
                                        }}>
                                            {cluster.risk_of_skipping.toUpperCase()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <footer style={{ marginTop: '3rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                {analysis.disclaimer} • Confidence Level: Medium-High based on available data.
            </footer>
            <div style={{ position: 'fixed', bottom: '1rem', right: '1rem', background: 'var(--surface)', padding: '0.5rem 1rem', borderRadius: '20px', boxShadow: 'var(--shadow)', border: '1px solid var(--border)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }}></span>
                Gemini Flash Analysis Active
            </div>
        </div>
    )
}
