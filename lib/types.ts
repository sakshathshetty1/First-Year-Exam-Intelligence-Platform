export interface Subject {
    id: string;
    name: string;
}

export interface Exam {
    id: string;
    subject_id?: string;
    subject: string; // Deprecated but type kept for now
    year: number;
    exam_type: string;
    created_at: string;
}

export interface Question {
    id: string;
    exam_id: string;
    question_text: string;
    marks: number;
    question_number: string;
    embedding?: number[];
}

export interface Cluster {
    id: string;
    subject_id?: string;
    subject: string;
    topic_summary: string;
    risk_level: string;
    avg_marks: number;
    frequency: number;
}
