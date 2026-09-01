/**
 * ResuMatch AI - Frontend Controller
 * Stitch Lumina Design System Integration
 */

const API_BASE_URL = "http://127.0.0.1:8000";

// State
let selectedResumeFile = null;
let currentAnalysisData = null;
let isBackendOnline = false;

// Role Presets Data
const PRESETS = {
    frontend: {
        title: "Senior Frontend Engineer (React / TypeScript)",
        content: `We are looking for a Senior Frontend Engineer to build high-performance, responsive web applications.

Required Qualifications:
- 4+ years of professional experience with modern JavaScript, TypeScript, React, and Next.js.
- Strong proficiency in HTML5, CSS3, TailwindCSS, CSS Modules, and responsive design systems.
- Experience with state management (Redux Toolkit, Zustand, or TanStack Query).
- Solid understanding of REST APIs, GraphQL, performance optimization, and web accessibility (a11y).
- Familiarity with unit and integration testing (Jest, React Testing Library, Cypress).
- Experience with CI/CD workflows, Git, and Agile/Scrum development methodologies.`
    },
    fullstack: {
        title: "Fullstack Developer (Python / FastAPI / React)",
        content: `We are seeking a Fullstack Developer to design, develop, and deploy scalable web services and intuitive client interfaces.

Key Requirements:
- Proven experience with Python (FastAPI or Django) and modern JavaScript/TypeScript (React, Vue, or Next.js).
- Strong knowledge of relational and NoSQL databases (PostgreSQL, MongoDB, Redis).
- Experience designing and consuming secure RESTful APIs, JWT authentication, and background task queues (Celery).
- Proficient in Docker, containerization, and cloud deployment (AWS, GCP, or Azure).
- Solid knowledge of Git version control, unit testing (pytest), and automated CI/CD pipelines.`
    },
    ai_ml: {
        title: "AI / Machine Learning Engineer (LLMs & NLP)",
        content: `We are looking for an AI/ML Engineer to build next-generation generative AI and LLM-powered applications.

Key Requirements:
- Strong background in Python, PyTorch, Hugging Face Transformers, and OpenAI/Groq/Anthropic APIs.
- Experience with LangChain, LlamaIndex, Vector Databases (ChromaDB, Pinecone, Qdrant), and RAG architectures.
- Solid understanding of NLP techniques, prompt engineering, embedding fine-tuning, and model evaluation metrics.
- Familiarity with FastAPI/Flask for serving ML models and deploying on Docker/Kubernetes.
- Experience with data preprocessing, pandas, numpy, and cloud ML infrastructure.`
    },
    data: {
        title: "Senior Data Scientist (Analytics & Modeling)",
        content: `Seeking an experienced Data Scientist to uncover actionable insights from complex datasets and build predictive models.

Requirements:
- Advanced degree in Computer Science, Statistics, Mathematics, or equivalent practical experience.
- Proficiency in Python, R, SQL, and data analysis packages (pandas, NumPy, SciPy, scikit-learn).
- Experience building predictive machine learning models, regression, classification, and clustering.
- Experience with business intelligence and data visualization tools (Tableau, PowerBI, Plotly, Seaborn).
- Strong understanding of A/B testing, hypothesis testing, and statistical significance.`
    },
    devops: {
        title: "DevOps & Cloud Infrastructure Engineer",
        content: `Looking for a DevOps Engineer to manage cloud infrastructure, automate deployment pipelines, and ensure high availability.

Requirements:
- Strong hands-on experience with Linux, Bash scripting, and Cloud Providers (AWS / GCP / Azure).
- Deep expertise in Docker, Kubernetes, Helm charts, and container orchestration.
- Infrastructure as Code (IaC) using Terraform or Ansible.
- Experience designing and maintaining automated CI/CD pipelines (GitHub Actions, GitLab CI, Jenkins).
- Knowledge of monitoring, logging, and observability tools (Prometheus, Grafana, ELK stack).`
    }
};

// Sample Demo Data for Instant Offline Testing
const DEMO_ANALYSIS = {
    score: 84,
    matched_skills: [
        "Python",
        "FastAPI",
        "React",
        "TypeScript",
        "REST APIs",
        "Docker",
        "Git",
        "PostgreSQL",
        "Responsive Web Design",
        "CI/CD Pipelines"
    ],
    missing_skills: [
        "Kubernetes Orchestration",
        "GraphQL Integration",
        "End-to-End Automated Testing (Cypress)"
    ],
    suggestions: [
        "Quantify your backend achievements by highlighting specific API performance improvements (e.g. 'Reduced endpoint response latency by 35% using FastAPI async handlers').",
        "Explicitly add hands-on projects or certifications covering Kubernetes or container orchestration to match the senior cloud requirements.",
        "Include a dedicated section showcasing TypeScript & React production components and state management patterns.",
        "Mention unit and integration testing coverage metrics (e.g. 'Maintained 85%+ test coverage with Pytest and Jest')."
    ],
    extracted_text: `John Doe - Senior Software Engineer
Email: john.doe@example.com | GitHub: github.com/johndoe | LinkedIn: linkedin.com/in/johndoe

SUMMARY:
Results-driven Fullstack & Backend Engineer with 5+ years of experience designing scalable RESTful APIs in Python (FastAPI/Django) and modern responsive user interfaces with React and TypeScript. Passionate about AI applications and robust cloud architectures.

TECHNICAL SKILLS:
- Languages: Python, JavaScript (ES6+), TypeScript, SQL, HTML5, CSS3
- Frameworks & Libraries: FastAPI, React.js, Next.js, Redux, TailwindCSS, Express.js
- Databases & Tools: PostgreSQL, MongoDB, Redis, Docker, Git, Linux, Postman
- Cloud & DevOps: AWS (EC2, S3), GitHub Actions, CI/CD, Nginx

EXPERIENCE:
Senior Software Engineer | Tech Innovations Inc. (2022 - Present)
- Architected and deployed 12+ microservices using FastAPI and PostgreSQL, serving 500k+ active users.
- Built reusable frontend design system components in React and TypeScript.
- Integrated AI LLM endpoints reducing document processing time from hours to seconds.

Software Engineer | Alpha Cloud Solutions (2019 - 2022)
- Developed REST APIs and database schema migrations using Python and PostgreSQL.
- Implemented Docker containerization and automated testing pipelines.`
};

/* ==========================================================================
   DOM Initialization & Event Listeners
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    initDropzone();
    checkBackendHealth();
    updateJobDescCharCount();
    
    // Auto refresh icons
    if (window.lucide) {
        lucide.createIcons();
    }
});

/* ==========================================================================
   Backend Health Monitoring
   ========================================================================== */

async function checkBackendHealth(showToastNotice = false) {
    const statusPill = document.getElementById("backend-status-pill");
    const statusText = document.getElementById("backend-status-text");

    statusText.textContent = "Connecting...";
    statusPill.className = "status-pill";

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        const response = await fetch(`${API_BASE_URL}/`, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
            isBackendOnline = true;
            statusPill.className = "status-pill online";
            statusText.textContent = "FastAPI Online";
            if (showToastNotice) {
                showToast("FastAPI Backend is running & connected!", "success");
            }
        } else {
            throw new Error(`HTTP ${response.status}`);
        }
    } catch (err) {
        isBackendOnline = false;
        statusPill.className = "status-pill offline";
        statusText.textContent = "Backend Offline";
        if (showToastNotice) {
            showToast("Cannot connect to FastAPI backend at http://127.0.0.1:8000. (You can still use Demo Mode!)", "error");
        }
    }
}

/* ==========================================================================
   Drag & Drop Resume Uploader
   ========================================================================== */

function initDropzone() {
    const dropzone = document.getElementById("dropzone");

    ["dragenter", "dragover"].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.add("dragover");
        }, false);
    });

    ["dragleave", "drop"].forEach(eventName => {
        dropzone.addEventListener(eventName, (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropzone.classList.remove("dragover");
        }, false);
    });

    dropzone.addEventListener("drop", (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files && files.length > 0) {
            processSelectedFile(files[0]);
        }
    });
}

function triggerFileInput() {
    document.getElementById("resume-file-input").click();
}

function handleFileSelected(event) {
    const files = event.target.files;
    if (files && files.length > 0) {
        processSelectedFile(files[0]);
    }
}

function processSelectedFile(file) {
    if (!file.name.toLowerCase().endsWith(".pdf")) {
        showToast("Please upload a valid PDF document (.pdf)", "error");
        return;
    }

    if (file.size > 15 * 1024 * 1024) {
        showToast("File size exceeds 15MB limit. Please upload a smaller PDF.", "error");
        return;
    }

    selectedResumeFile = file;

    // Update UI
    document.getElementById("selected-file-name").textContent = file.name;
    document.getElementById("selected-file-size").textContent = formatFileSize(file.size);
    document.getElementById("file-selected-box").style.display = "flex";
    document.getElementById("dropzone").style.display = "none";

    showToast(`Loaded "${file.name}"`, "info");
    if (window.lucide) lucide.createIcons();
}

function removeSelectedFile() {
    selectedResumeFile = null;
    document.getElementById("resume-file-input").value = "";
    document.getElementById("file-selected-box").style.display = "none";
    document.getElementById("dropzone").style.display = "block";
    showToast("Resume removed", "info");
}

function formatFileSize(bytes) {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

/* ==========================================================================
   Presets & Job Description Controls
   ========================================================================== */

function applyPreset(presetKey) {
    const preset = PRESETS[presetKey];
    if (preset) {
        const textarea = document.getElementById("job-description-input");
        textarea.value = preset.content;
        updateJobDescCharCount();
        showToast(`Loaded preset: ${preset.title}`, "info");
    }
}

function clearJobDescription() {
    document.getElementById("job-description-input").value = "";
    updateJobDescCharCount();
}

function updateJobDescCharCount() {
    const text = document.getElementById("job-description-input").value;
    const charCount = text.length;
    const wordCount = text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
    document.getElementById("job-char-count").textContent = `${charCount.toLocaleString()} characters | ${wordCount.toLocaleString()} words`;
}

async function pasteFromClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        if (text) {
            document.getElementById("job-description-input").value = text;
            updateJobDescCharCount();
            showToast("Pasted job description from clipboard!", "success");
        }
    } catch (err) {
        showToast("Clipboard access denied. Please paste manually using Ctrl+V.", "info");
    }
}

/* ==========================================================================
   Analysis Trigger & Execution
   ========================================================================== */

async function startResumeAnalysis() {
    const jobDescription = document.getElementById("job-description-input").value.trim();

    if (!selectedResumeFile) {
        showToast("Please upload your PDF resume first.", "error");
        return;
    }

    if (!jobDescription) {
        showToast("Please enter or select a target job description.", "error");
        return;
    }

    // Set Loading State
    setAnalyzingState(true);

    const formData = new FormData();
    formData.append("resume", selectedResumeFile);
    formData.append("job_description", jobDescription);

    try {
        // Step Simulation updates for pleasant UX
        updateLoadingStep(1, "Reading & parsing resume PDF...");
        
        const response = await fetch(`${API_BASE_URL}/analyze-resume`, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            const errData = await response.json().catch(() => ({}));
            throw new Error(errData.detail || `Server responded with status ${response.status}`);
        }

        updateLoadingStep(3, "Evaluating skills & generating recommendations...");
        const data = await response.json();

        // Check if analysis payload exists
        if (data && data.analysis) {
            currentAnalysisData = {
                score: data.analysis.score ?? 0,
                matched_skills: data.analysis.matched_skills ?? [],
                missing_skills: data.analysis.missing_skills ?? [],
                suggestions: data.analysis.suggestions ?? [],
                extracted_text: data.text || `Resume Analyzed: ${data.filename || "Uploaded PDF"}`
            };
            displayAnalysisResults(currentAnalysisData);
            showToast("Analysis completed successfully!", "success");
        } else {
            throw new Error("Invalid response structure from backend.");
        }

    } catch (error) {
        console.error("Analysis error:", error);
        showToast(`Backend Error: ${error.message}. Switching to Demo View.`, "error");
        // Fallback to sample analysis with note
        loadSampleAnalysis(true);
    } finally {
        setAnalyzingState(false);
    }
}

function setAnalyzingState(isAnalyzing) {
    const btn = document.getElementById("btn-analyze");
    const btnText = document.getElementById("btn-analyze-text");
    const emptyState = document.getElementById("results-empty-state");
    const loadingState = document.getElementById("analysis-loading-state");
    const resultsContainer = document.getElementById("results-active-container");

    if (isAnalyzing) {
        btn.disabled = true;
        btnText.textContent = "Analyzing with AI...";
        emptyState.style.display = "none";
        resultsContainer.style.display = "none";
        loadingState.style.display = "block";
    } else {
        btn.disabled = false;
        btnText.textContent = "Analyze Resume Match";
        loadingState.style.display = "none";
    }
}

function updateLoadingStep(stepNum, statusText) {
    const statusEl = document.getElementById("loading-progress-status");
    if (statusEl) statusEl.textContent = statusText;

    for (let i = 1; i <= 4; i++) {
        const pill = document.getElementById(`step-pill-${i}`);
        if (pill) {
            if (i <= stepNum) {
                pill.classList.add("active");
            } else {
                pill.classList.remove("active");
            }
        }
    }
}

/* ==========================================================================
   Load Demo Sample Analysis
   ========================================================================== */

function loadSampleAnalysis(isFallback = false) {
    // Populate form if empty
    if (!document.getElementById("job-description-input").value.trim()) {
        applyPreset("fullstack");
    }

    if (!selectedResumeFile) {
        document.getElementById("selected-file-name").textContent = "sample_senior_engineer_resume.pdf";
        document.getElementById("selected-file-size").textContent = "384 KB";
        document.getElementById("file-selected-box").style.display = "flex";
        document.getElementById("dropzone").style.display = "none";
    }

    currentAnalysisData = { ...DEMO_ANALYSIS };
    displayAnalysisResults(currentAnalysisData);

    if (!isFallback) {
        showToast("Loaded interactive Demo Analysis preview!", "success");
    }
}

/* ==========================================================================
   Display Results & Render Visuals
   ========================================================================== */

function displayAnalysisResults(analysis) {
    const emptyState = document.getElementById("results-empty-state");
    const loadingState = document.getElementById("analysis-loading-state");
    const resultsContainer = document.getElementById("results-active-container");

    emptyState.style.display = "none";
    loadingState.style.display = "none";
    resultsContainer.style.display = "flex";

    const score = Math.max(0, Math.min(100, Math.round(analysis.score || 0)));

    // 1. Animate Score Counter & Gauge
    animateScoreGauge(score);

    // 2. Verdict Headline & Badge
    updateScoreVerdict(score);

    // 3. Metric Strip Counts
    document.getElementById("metric-matched-count").textContent = analysis.matched_skills.length;
    document.getElementById("metric-missing-count").textContent = analysis.missing_skills.length;
    document.getElementById("metric-suggestions-count").textContent = analysis.suggestions.length;

    // 4. Matched Skills List
    renderSkillsList(
        document.getElementById("matched-skills-list"),
        document.getElementById("matched-count-pill"),
        analysis.matched_skills,
        "matched"
    );

    // 5. Missing Skills List
    renderSkillsList(
        document.getElementById("missing-skills-list"),
        document.getElementById("missing-count-pill"),
        analysis.missing_skills,
        "missing"
    );

    // 6. Suggestions List
    renderSuggestionsList(analysis.suggestions);

    // 7. Extracted Resume Text
    document.getElementById("extracted-resume-text").textContent = 
        analysis.extracted_text || "Resume parsed successfully. Full extracted text is ready.";

    // Refresh Lucide Icons
    if (window.lucide) {
        lucide.createIcons();
    }
}

/* ==========================================================================
   SVG Score Progress Ring Animation
   ========================================================================== */

function animateScoreGauge(targetScore) {
    const scoreNumberEl = document.getElementById("result-score-num");
    const progressCircle = document.getElementById("gauge-progress-circle");
    
    // Circle radius is 52 -> Circumference = 2 * Math.PI * 52 ≈ 326.72
    const circumference = 2 * Math.PI * 52;
    progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;

    // Color shift based on score
    let strokeColor = "#10b981"; // Emerald
    if (targetScore < 40) {
        strokeColor = "#f43f5e"; // Rose
    } else if (targetScore < 60) {
        strokeColor = "#f59e0b"; // Amber
    } else if (targetScore < 75) {
        strokeColor = "#06b6d4"; // Cyan
    }
    progressCircle.style.stroke = strokeColor;

    // Animate offset
    const offset = circumference - (targetScore / 100) * circumference;
    setTimeout(() => {
        progressCircle.style.strokeDashoffset = offset;
    }, 100);

    // Animate Number Counter
    let current = 0;
    const duration = 1000;
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = targetScore / steps;

    const timer = setInterval(() => {
        current += increment;
        if (current >= targetScore) {
            current = targetScore;
            clearInterval(timer);
        }
        scoreNumberEl.textContent = Math.round(current);
    }, stepTime);
}

function updateScoreVerdict(score) {
    const verdictBadge = document.getElementById("result-verdict-badge");
    const verdictText = document.getElementById("result-verdict-text");
    const headline = document.getElementById("result-headline");
    const summary = document.getElementById("result-summary-text");

    if (score >= 80) {
        verdictBadge.style.background = "rgba(16, 185, 129, 0.15)";
        verdictBadge.style.borderColor = "rgba(16, 185, 129, 0.3)";
        verdictBadge.style.color = "#34d399";
        verdictText.textContent = "Exceptional Fit";
        headline.textContent = "Outstanding ATS Match";
        summary.textContent = "Your resume demonstrates the key competencies and requirements requested for this role. You are a prime candidate for an interview.";
    } else if (score >= 60) {
        verdictBadge.style.background = "rgba(6, 182, 212, 0.15)";
        verdictBadge.style.borderColor = "rgba(6, 182, 212, 0.3)";
        verdictBadge.style.color = "#22d3ee";
        verdictText.textContent = "Strong Contender";
        headline.textContent = "Solid Alignment with Growth Room";
        summary.textContent = "You meet most essential qualifications. Addressing the few missing skills below can push your resume into top priority.";
    } else if (score >= 40) {
        verdictBadge.style.background = "rgba(245, 158, 11, 0.15)";
        verdictBadge.style.borderColor = "rgba(245, 158, 11, 0.3)";
        verdictBadge.style.color = "#fbbf24";
        verdictText.textContent = "Moderate Fit";
        headline.textContent = "Partial Match - Optimization Required";
        summary.textContent = "Several critical requirements or keywords are missing or unmentioned. Revise your experience bullet points using the recommendations.";
    } else {
        verdictBadge.style.background = "rgba(244, 63, 94, 0.15)";
        verdictBadge.style.borderColor = "rgba(244, 63, 94, 0.3)";
        verdictBadge.style.color = "#fb7185";
        verdictText.textContent = "Skill Gap Alert";
        headline.textContent = "Low Match for this Role";
        summary.textContent = "The resume does not demonstrate sufficient overlap with this position's core requirements. Consider tailoring your experience heavily.";
    }
}

/* ==========================================================================
   Render Skills & Suggestions
   ========================================================================== */

function renderSkillsList(container, countPill, skills, type) {
    container.innerHTML = "";
    countPill.textContent = `${skills.length} ${skills.length === 1 ? "Skill" : "Skills"}`;

    if (!skills || skills.length === 0) {
        container.innerHTML = `<p class="empty-skill-note">No ${type} skills detected in this comparison.</p>`;
        return;
    }

    skills.forEach(skill => {
        const pill = document.createElement("span");
        pill.className = type === "matched" ? "skill-pill-matched" : "skill-pill-missing";
        
        const iconName = type === "matched" ? "check" : "x";
        pill.innerHTML = `<i data-lucide="${iconName}" style="width: 13px; height: 13px;"></i><span>${escapeHtml(skill)}</span>`;
        
        pill.title = "Click to copy skill";
        pill.style.cursor = "pointer";
        pill.addEventListener("click", () => {
            navigator.clipboard.writeText(skill);
            showToast(`Copied skill: "${skill}"`, "info");
        });

        container.appendChild(pill);
    });
}

function renderSuggestionsList(suggestions) {
    const container = document.getElementById("suggestions-list-container");
    container.innerHTML = "";

    if (!suggestions || suggestions.length === 0) {
        container.innerHTML = `<p class="empty-skill-note">No suggestions generated.</p>`;
        return;
    }

    suggestions.forEach((item, index) => {
        const card = document.createElement("div");
        card.className = "suggestion-card-item";

        card.innerHTML = `
            <div class="suggestion-num">${index + 1}</div>
            <div class="suggestion-text">${escapeHtml(item)}</div>
            <button class="btn-copy-suggestion" title="Copy recommendation" onclick="copySingleSuggestion('${escapeHtml(item.replace(/'/g, "\\'"))}')">
                <i data-lucide="copy" style="width: 14px; height: 14px;"></i>
            </button>
        `;

        container.appendChild(card);
    });
}

function copySingleSuggestion(text) {
    navigator.clipboard.writeText(text);
    showToast("Recommendation copied to clipboard!", "info");
}

function copyAllSuggestions() {
    if (!currentAnalysisData || !currentAnalysisData.suggestions || currentAnalysisData.suggestions.length === 0) {
        showToast("No recommendations to copy.", "error");
        return;
    }

    const text = currentAnalysisData.suggestions.map((s, i) => `${i + 1}. ${s}`).join("\n\n");
    navigator.clipboard.writeText(text);
    showToast("All recommendations copied to clipboard!", "success");
}

/* ==========================================================================
   Accordion & Export Actions
   ========================================================================== */

function toggleExtractedTextAccordion() {
    const body = document.getElementById("extracted-text-body");
    const icon = document.getElementById("accordion-icon");
    const isOpen = body.classList.toggle("open");
    icon.style.transform = isOpen ? "rotate(180deg)" : "rotate(0deg)";
}

function exportAnalysisReport(format) {
    if (!currentAnalysisData) {
        showToast("Run an analysis first before exporting.", "error");
        return;
    }

    if (format === "markdown") {
        const mdContent = `# ResuMatch AI Analysis Report
Generated: ${new Date().toLocaleString()}
Match Score: ${currentAnalysisData.score}/100

## Matched Skills (${currentAnalysisData.matched_skills.length})
${currentAnalysisData.matched_skills.map(s => `- [x] ${s}`).join("\n")}

## Missing Skills (${currentAnalysisData.missing_skills.length})
${currentAnalysisData.missing_skills.map(s => `- [ ] ${s}`).join("\n")}

## AI Improvement Recommendations
${currentAnalysisData.suggestions.map((s, i) => `${i + 1}. ${s}`).join("\n\n")}
`;

        navigator.clipboard.writeText(mdContent);
        showToast("Markdown report copied to clipboard!", "success");

    } else if (format === "json") {
        const blob = new Blob([JSON.stringify(currentAnalysisData, null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `resume_analysis_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast("JSON report downloaded successfully!", "success");
    }
}

function resetForm() {
    removeSelectedFile();
    clearJobDescription();
    currentAnalysisData = null;
    document.getElementById("results-active-container").style.display = "none";
    document.getElementById("analysis-loading-state").style.display = "none";
    document.getElementById("results-empty-state").style.display = "block";
    showToast("Workspace reset to initial state.", "info");
}

/* ==========================================================================
   Toast Notification System
   ========================================================================== */

function showToast(message, type = "info") {
    const container = document.getElementById("toast-container");
    if (!container) return;

    const toast = document.createElement("div");
    toast.className = `toast ${type}`;

    let iconName = "info";
    if (type === "success") iconName = "check-circle";
    if (type === "error") iconName = "alert-circle";

    toast.innerHTML = `
        <i data-lucide="${iconName}" style="width: 16px; height: 16px; flex-shrink: 0;"></i>
        <span>${escapeHtml(message)}</span>
    `;

    container.appendChild(toast);
    if (window.lucide) lucide.createIcons();

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateY(10px)";
        toast.style.transition = "all 0.3s ease";
        setTimeout(() => {
            if (toast.parentNode) toast.parentNode.removeChild(toast);
        }, 300);
    }, 3800);
}

function escapeHtml(str) {
    if (!str) return "";
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
