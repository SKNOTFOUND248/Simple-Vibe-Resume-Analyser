from fastapi import FastAPI, File, Form, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import json
import os

from groq import Groq
from resume_parser import extract_text_from_pdf

app = FastAPI()
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def home():
    return {"message": "AI Resume Analyzer Backend is working!"}


@app.get("/hello/{name}")
def hello(name):
    return {"message": f"Hello {name}!"}


@app.post("/upload-resume")
async def upload_resume(resume: UploadFile = File(...)):
    contents = await resume.read()
    file_path = "temp_resume.pdf"

    with open(file_path, "wb") as file:
        file.write(contents)

    resume_text = extract_text_from_pdf(file_path)

    return {
        "filename": resume.filename,
        "message": "Resume read successfully!",
        "text": resume_text,
    }


@app.post("/analyze-resume")
async def analyze_resume(
    resume: UploadFile = File(...),
    job_description: str = Form(...),
):
    contents = await resume.read()
    file_path = "temp_resume.pdf"

    with open(file_path, "wb") as file:
        file.write(contents)

    resume_text = extract_text_from_pdf(file_path)

    prompt = f"""
You are an expert professional resume analyzer.

Compare the resume against the job description.

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

Analyze the candidate carefully.

Return ONLY valid JSON.

Do NOT use markdown.
Do NOT use ```json.
Do NOT add any explanation outside the JSON.

Use exactly this structure:

{{
    "score": 0,
    "matched_skills": [],
    "missing_skills": [],
    "suggestions": []
}}

Rules:

1. "score" must be an integer from 0 to 100.
2. "matched_skills" must contain skills found in both the resume and job requirements.
3. "missing_skills" must contain important job requirements that are missing or not clearly demonstrated in the resume.
4. "suggestions" must contain 3 to 5 useful recommendations for improving the resume for this particular job.
5. Be honest. Do not assume a skill exists if the resume does not demonstrate it.
"""

    response = client.chat.completions.create(
        model="openai/gpt-oss-20b",
        messages=[
            {
                "role": "user",
                "content": prompt,
            }
        ],
    )

    result = response.choices[0].message.content

    try:
        analysis = json.loads(result)
    except json.JSONDecodeError:
        analysis = {
            "score": 0,
            "matched_skills": [],
            "missing_skills": [],
            "suggestions": ["The model returned invalid JSON. Please try again."],
        }

    return {
        "filename": resume.filename,
        "analysis": analysis,
    }