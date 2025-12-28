'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Calendar, BookOpen, ChevronRight, AlertCircle } from 'lucide-react'

export default function StudentForm({ subjects }: { subjects: { id: string, name: string }[] }) {
    const router = useRouter()
    const [subjectId, setSubjectId] = useState('')
    const [examDate, setExamDate] = useState('')
    const [examType, setExamType] = useState('all')

    function handleOptimize(e: React.FormEvent) {
        e.preventDefault()
        if (!subjectId || !examDate) return
        router.push(`/student/optimizer?subject_id=${encodeURIComponent(subjectId)}&date=${encodeURIComponent(examDate)}&exam_type=${encodeURIComponent(examType)}`)
    }

    const hasSubjects = subjects && subjects.length > 0;

    return (
        <div className="card">
            <form onSubmit={handleOptimize}>
                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Subject Name</label>
                    <div style={{ position: 'relative' }}>
                        <BookOpen size={20} style={{ position: 'absolute', top: '10px', left: '10px', color: 'var(--text-muted)' }} />

                        {hasSubjects ? (
                            <select
                                className="input"
                                style={{ paddingLeft: '2.5rem', appearance: 'none', background: 'white' }}
                                value={subjectId}
                                onChange={e => setSubjectId(e.target.value)}
                                required
                            >
                                <option value="" disabled>Select a subject...</option>
                                {subjects.map((s) => (
                                    <option key={s.id} value={s.id}>{s.name}</option>
                                ))}
                            </select>
                        ) : (
                            <div className="input" style={{ paddingLeft: '2.5rem', background: '#f5f5f5', color: 'var(--text-muted)', cursor: 'not-allowed' }}>
                                No subjects available
                            </div>
                        )}

                        {hasSubjects && (
                            <ChevronRight
                                size={16}
                                style={{ position: 'absolute', top: '12px', right: '10px', transform: 'rotate(90deg)', pointerEvents: 'none', color: 'var(--text-muted)' }}
                            />
                        )}
                    </div>
                    {!hasSubjects ? (
                        <div style={{ marginTop: '0.8rem', fontSize: '0.8rem', color: '#dc2626', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <AlertCircle size={14} />
                            No exam data available yet. Please wait for faculty uploads.
                        </div>
                    ) : (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                            Select your subject from the available exam database.
                        </p>
                    )}
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Exam Type</label>
                    <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                            <input
                                type="radio"
                                name="examType"
                                value="all"
                                checked={examType === 'all'}
                                onChange={e => setExamType(e.target.value)}
                                style={{ accentColor: 'var(--primary)' }}
                            />
                            <span>All</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                            <input
                                type="radio"
                                name="examType"
                                value="internal"
                                checked={examType === 'internal'}
                                onChange={e => setExamType(e.target.value)}
                                style={{ accentColor: 'var(--primary)' }}
                            />
                            <span>Internal</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                            <input
                                type="radio"
                                name="examType"
                                value="end_semester"
                                checked={examType === 'end_semester'}
                                onChange={e => setExamType(e.target.value)}
                                style={{ accentColor: 'var(--primary)' }}
                            />
                            <span>End Sem</span>
                        </label>
                    </div>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Exam Date</label>
                    <div style={{ position: 'relative' }}>
                        <Calendar size={20} style={{ position: 'absolute', top: '10px', left: '10px', color: 'var(--text-muted)' }} />
                        <input
                            type="date"
                            className="input"
                            style={{ paddingLeft: '2.5rem' }}
                            value={examDate}
                            onChange={e => setExamDate(e.target.value)}
                            required
                        />
                    </div>
                </div>

                <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: '100%', padding: '1rem', opacity: (!subjectId || !hasSubjects) ? 0.7 : 1, cursor: (!subjectId || !hasSubjects) ? 'not-allowed' : 'pointer' }}
                    disabled={!subjectId || !hasSubjects}
                >
                    Generate Study Optimizer
                    <ChevronRight size={20} style={{ marginLeft: '0.5rem' }} />
                </button>
            </form>
        </div>
    )
}
