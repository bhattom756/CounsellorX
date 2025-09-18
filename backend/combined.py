# combined.py
from pydantic import BaseModel, Field
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
import google.generativeai as genai
import os
from dotenv import load_dotenv, find_dotenv

# Load .env from project root (search upwards) regardless of CWD
load_dotenv(find_dotenv(), override=False)

# Load API key from env, fail fast if missing
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_API_KEY")
if not GOOGLE_API_KEY:
    raise RuntimeError("GOOGLE_API_KEY (or GEMINI_API_KEY) not set in environment (.env)")

genai.configure(api_key=GOOGLE_API_KEY)

# Allow overriding model names via env for flexibility
GENAI_MODEL_NAME = os.getenv("GENAI_MODEL_NAME", "gemini-2.5-flash")
LANGCHAIN_MODEL_NAME = os.getenv("LANGCHAIN_MODEL_NAME", "gemini-2.5-flash")

genai_model = genai.GenerativeModel(GENAI_MODEL_NAME)

# --- Pydantic schema for structured output ---
class LegalSummary(BaseModel):
    key_clauses: list[str] = Field(description="Important clauses present in the content")
    obligations: list[str] = Field(description="Duties, responsibilities, or requirements described in the content")
    evidence: list[str] = Field(description="Supporting evidence, documents, or references from the content")

parser = PydanticOutputParser(pydantic_object=LegalSummary)
lc_model = ChatGoogleGenerativeAI(model=LANGCHAIN_MODEL_NAME, temperature=0.3)

# --- LangChain prompt & chain ---
template = PromptTemplate(
    template="""You are a legal document summarizer.
Summarize the following content into structured fields:
- Key Clauses
- Obligations
- Evidence

Content:
{content}

{format_instructions}
""",
    input_variables=["content"],
    partial_variables={"format_instructions": parser.get_format_instructions()}
)

chain = template | lc_model | parser

# --- Helper: detect mime type from file extension ---
def detect_mime_type(file_path: str) -> str:
    ext = file_path.lower().split(".")[-1]
    if ext == "pdf":
        return "application/pdf"
    elif ext in ("jpg", "jpeg"):
        return "image/jpeg"
    elif ext == "png":
        return "image/png"
    else:
        raise ValueError(f"Unsupported file type: {ext}")

# --- Step 1: Extract plain summary from PDF or image ---
def extract_plain_summary(file_path: str) -> str:
    with open(file_path, "rb") as f:
        file_bytes = f.read()

    mime_type = detect_mime_type(file_path)

    blob = {"mime_type": mime_type, "data": file_bytes}

    response = genai_model.generate_content(
        [
            "You are a legal assistant. Extract and summarize this document in plain English, highlighting risks.",
            blob,
        ]
    )
    return getattr(response, "text", str(response))

# --- Step 2: Run structured summarization with LangChain ---
def process_document_pipeline(file_path: str) -> LegalSummary:
    """
    Main pipeline: takes a dynamic file path (PDF/image), extracts summary,
    then generates structured output via LangChain.
    """
    plain_summary = extract_plain_summary(file_path)
    structured_summary = chain.invoke({"content": plain_summary})
    return structured_summary
