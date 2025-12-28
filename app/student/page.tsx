import { getUniqueSubjectsAction } from '../actions'
import StudentForm from './StudentForm'

// Force dynamic because we are fetching data from DB that might change
export const dynamic = 'force-dynamic'

export default async function StudentDashboardPage() {
    const { data: subjects } = await getUniqueSubjectsAction()

    return (
        <div className="container" style={{ maxWidth: '600px', padding: '4rem 1rem' }}>
            <header style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h1 style={{ marginBottom: '0.5rem' }}>Student Portal</h1>
                <p style={{ color: 'var(--text-muted)' }}>Configure your exam parameters to generate a study strategy.</p>
            </header>

            <StudentForm subjects={subjects || []} />

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    "This tool saved my semester. Focus on the high-yield topics first!" - Senior Alum
                </p>
            </div>
        </div>
    )
}
