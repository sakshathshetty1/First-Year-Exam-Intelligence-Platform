'use server'

import { supabase } from '@/lib/supabase'
import { extractExamContent, generateEmbedding, generateTopicClusters } from '@/lib/gemini'
import { revalidatePath } from 'next/cache'

export async function uploadExamAction(formData: FormData) {
    const file = formData.get('file') as File
    if (!file) {
        return { success: false, error: 'No file uploaded' }
    }

    try {
        const buffer = await file.arrayBuffer()
        const base64 = Buffer.from(buffer).toString('base64')
        const mimeType = file.type

        // 1. Extract Content using Gemini
        const extractedData = await extractExamContent(base64, mimeType)

        // 2. Insert or Get Subject
        const subjectName = extractedData.subject || 'Unknown Subject'

        // Check if subject exists
        const { data: existingSubject } = await supabase
            .from('subjects')
            .select('id')
            .eq('name', subjectName)
            .single()

        let subjectId = existingSubject?.id

        if (!subjectId) {
            const { data: newSubject, error: subjectError } = await supabase
                .from('subjects')
                .insert({ name: subjectName })
                .select('id')
                .single()

            if (subjectError) {
                console.error('Database Error (Subject):', subjectError)
                // Fallback: Try to fetch again in case of race condition
                const { data: retrySubject } = await supabase
                    .from('subjects')
                    .select('id')
                    .eq('name', subjectName)
                    .single()

                if (retrySubject) {
                    subjectId = retrySubject.id
                } else {
                    return { success: false, error: 'Failed to create subject' }
                }
            } else {
                subjectId = newSubject.id
            }
        }

        // 3. Insert Exam Record
        const { data: examData, error: examError } = await supabase
            .from('exams')
            .insert({
                subject_id: subjectId,
                subject: subjectName, // Legacy
                year: extractedData.year || new Date().getFullYear(),
                exam_type: extractedData.exam_type || 'Unknown Type'
            })
            .select('id')
            .single()

        if (examError) {
            console.error('Database Error (Exams):', examError)
            return { success: false, error: 'Failed to save exam metadata' }
        }

        const examId = examData.id

        // 4. Generate Embeddings & Insert Questions
        const embeddingPromises = extractedData.questions.map(async (q: any) => {
            const embedding = await generateEmbedding(q.question_text)
            return {
                exam_id: examId,
                question_text: q.question_text,
                marks: q.marks || 0,
                question_number: q.question_number || '',
                embedding: embedding
            }
        })

        const questionsWithEmbeddings = await Promise.all(embeddingPromises)

        const { error: questionsError } = await supabase
            .from('questions')
            .insert(questionsWithEmbeddings)

        if (questionsError) {
            console.error('Database Error (Questions):', questionsError)
            return { success: false, error: 'Failed to save questions' }
        }

        // 5. Automatic Clustering (Persisted)
        // Fetch all questions for this subject to re-cluster
        const { data: allQuestions } = await supabase
            .from('questions')
            .select('id, question_text, marks, exams!inner(subject_id)')
            .eq('exams.subject_id', subjectId)

        if (allQuestions && allQuestions.length > 0) {
            const clustersData = await generateTopicClusters(allQuestions)

            // Wipe existing clusters for this subject to avoid duplicates/stale data
            await supabase.from('clusters').delete().eq('subject_id', subjectId)

            // Insert new clusters
            if (clustersData.clusters) {
                for (const cluster of clustersData.clusters) {
                    // Validate IDs and calculate stats
                    const validQuestionIds = cluster.question_ids.filter((id: string) =>
                        allQuestions.some(q => q.id === id)
                    )

                    if (validQuestionIds.length === 0) continue

                    const clusterQuestions = allQuestions.filter(q => validQuestionIds.includes(q.id))
                    const totalMarks = clusterQuestions.reduce((sum, q) => sum + (q.marks || 0), 0)
                    const avgMarks = totalMarks / validQuestionIds.length

                    const { data: clusterRecord, error: clusterError } = await supabase
                        .from('clusters')
                        .insert({
                            subject_id: subjectId,
                            topic_summary: `${cluster.topic_name}: ${cluster.summary}`,
                            risk_level: cluster.risk_level,
                            frequency: validQuestionIds.length,
                            avg_marks: avgMarks
                        })
                        .select('id')
                        .single()

                    if (!clusterError && clusterRecord) {
                        const junctionRows = validQuestionIds.map((qid: string) => ({
                            question_id: qid,
                            cluster_id: clusterRecord.id
                        }))

                        if (junctionRows.length > 0) {
                            await supabase.from('question_clusters').insert(junctionRows)
                        }
                    }
                }
            }
        }

        revalidatePath('/faculty/upload')
        return {
            success: true,
            data: {
                examId,
                questionsCount: questionsWithEmbeddings.length,
                extracted: extractedData
            }
        }

    } catch (error: any) {
        console.error('Upload Action Error:', error)
        return { success: false, error: error.message || 'Processing failed' }
    }
}

export async function getUniqueSubjectsAction() {
    try {
        const { data, error } = await supabase
            .from('subjects')
            .select('id, name')
            .order('name')

        if (error) {
            console.error('Error fetching subjects:', error)
            return { success: false, error: 'Failed to fetch subjects' }
        }

        return { success: true, data: data }

    } catch (error: any) {
        console.error('getUniqueSubjectsAction Error:', error)
        return { success: false, error: error.message }
    }
}
