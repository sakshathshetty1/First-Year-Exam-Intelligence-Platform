import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

export const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
export const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

export async function extractExamContent(fileBase64: string, mimeType: string) {
  const prompt = `
    Analyze this exam paper. Extract the following details:
    - Subject Name
    - Year (if not explicitly stated, infer or return null)
    - Exam Type (Strictly classify as "Internal" or "End Semester". If unsure, use "Internal" for tests/quizzes and "End Semester" for finals/external)
    - List of Questions. For each question:
      - Question Text (maintain full context, include sub-questions if they are part of the main logic)
      - Marks (if available)
      - Question Number (e.g. 1a, 2)
    
    Return the output in purely JSON format:
    {
      "subject": string,
      "year": number,
      "exam_type": string,
      "questions": [
        {
          "question_number": string,
          "question_text": string,
          "marks": number
        }
      ]
    }
  `;

  const result = await geminiModel.generateContent([
    prompt,
    {
      inlineData: {
        data: fileBase64,
        mimeType: mimeType,
      },
    },
  ]);

  const response = await result.response;
  let text = response.text();

  // Clean markdown json fences
  text = text.replace(/```json/g, "").replace(/```/g, "").trim();

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse Gemini response", text);
    throw new Error("Failed to parse exam content");
  }
}

export async function generateEmbedding(text: string) {
  const result = await embeddingModel.embedContent(text);
  return result.embedding.values;
}

export async function analyzeQuestionsWithGemini(questions: any[], subject: string, examDate: string) {
  // Limit questions to avoid token limits (e.g. last 50 questions)
  const recentQuestions = questions.slice(0, 100);

  const questionsList = recentQuestions.map(q =>
    `- Q: "${q.question_text}" (${q.marks} marks) [Year: ${q.exams?.year || 'Unknown'}]`
  ).join('\n');

  const prompt = `
    Role: Expert Exam Strategist.
    Task: specific analysis of past exam questions for subject "${subject}".
    Context: The student's exam is on ${examDate}.
    
    Input Data:
    ${questionsList}

    Instructions:
    1. Group these questions into semantic clusters (topics). E.g., "Thermodynamics Laws", "Beam Deflection", etc.
    2. For each cluster:
       - Calculate Frequency (how many questions fall into this).
       - Calculate Average Marks.
       - Assign a 'Yield' score (Frequency * Marks).
       - Assess Risk Level (Low/Medium/High) of skipping this topic.
    3. Generate a "Survival Guide": The top 3 absolute critical topics that MUST be studied to pass.
    4. Suggested Order: A prioritized list of topics to study.
    
    Return pure JSON:
    {
      "clusters": [
        {
          "topic": string,
          "summary": string,
          "frequency": number,
          "avg_marks": number,
          "yield_score": number,
          "risk_of_skipping": "High" | "Medium" | "Low",
          "example_questions": string[] (pick 2-3 short examples)
        }
      ],
      "survival_guide": [
        { "topic": string, "reason": string }
      ],
      "disclaimer": "Probabilistic model based on past data. Not a guarantee."
    }
  `;

  const result = await geminiModel.generateContent(prompt);
  const response = await result.response;
  let text = response.text();
  text = text.replace(/```json/g, "").replace(/```/g, "").trim();

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse analysis", text);
    // Return a fallback or throw
    return { clusters: [], survival_guide: [], disclaimer: "Analysis failed." };
  }
}

export async function generateTopicClusters(questions: { id: string, question_text: string }[]) {
  // If too many questions, maybe sample or limit? For MVP, we pass all (up to reasonable token limit).
  // 50 questions * 50 tokens = 2500 tokens. Gemini Flash context is 1M. We are fine for hundreds of questions.

  const questionsInput = questions.map((q, i) => `[ID: ${q.id}] ${q.question_text}`).join('\n');

  const prompt = `
    Role: Academic Curator.
    Task: Group the following questions into distinct academic topics (Clusters).
    
    Input:
    ${questionsInput}

    Instructions:
    1. Identify recurring topics (e.g. "Thermodynamics", "Matrices", "Java Classes").
    2. Assign each question ID to the most relevant Topic.
    3. Provide a brief summary of the topic.
    4. Estimate the risk level (Low/Medium/High) of skipping this topic based on its complexity/frequency (infer from context).
    
    Return pure JSON:
    {
      "clusters": [
        {
          "topic_name": string,
          "summary": string,
          "risk_level": "Low" | "Medium" | "High",
          "question_ids": string[] 
        }
      ]
    }
  `;

  const result = await geminiModel.generateContent(prompt);
  const response = await result.response;
  let text = response.text();
  text = text.replace(/```json/g, "").replace(/```/g, "").trim();

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse cluster response", text);
    return { clusters: [] };
  }
}



