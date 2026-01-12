from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# OpenAI setup
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class QuizQuestion(BaseModel):
    question: str
    options: List[str]
    correct_answer: str

class Quiz(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    subject: str
    difficulty: str
    questions: List[QuizQuestion]
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class QuizGenerateRequest(BaseModel):
    subject: str
    difficulty: str = "medium"
    num_questions: int = 5

class StudySession(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    concept: str
    explanation: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StudyRequest(BaseModel):
    concept: str

class Translation(BaseModel):
    model_config = ConfigDict(extra="ignore")
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    phrase: str
    source_lang: str
    target_lang: str
    translation: str
    cultural_context: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TranslationRequest(BaseModel):
    phrase: str
    source_lang: str = "English"
    target_lang: str = "Spanish"

class ProgressStats(BaseModel):
    total_quizzes: int
    total_study_sessions: int
    total_translations: int
    recent_activities: List[dict]


# Helper function to create LLM chat
def create_llm_chat(system_message: str) -> LlmChat:
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=str(uuid.uuid4()),
        system_message=system_message
    ).with_model("openai", "gpt-5.2")
    return chat


# Routes
@api_router.get("/")
async def root():
    return {"message": "Lumina Learning API"}


@api_router.post("/quiz/generate", response_model=Quiz)
async def generate_quiz(request: QuizGenerateRequest):
    try:
        system_message = f"You are an educational quiz generator. Generate exactly {request.num_questions} multiple-choice questions about the given subject at {request.difficulty} difficulty level. Format your response as valid JSON with this structure: {{\"questions\": [{{\"question\": \"...\", \"options\": [\"A\", \"B\", \"C\", \"D\"], \"correct_answer\": \"...\"}}]}}. Make sure the correct_answer matches one of the options exactly."
        
        chat = create_llm_chat(system_message)
        user_message = UserMessage(
            text=f"Generate {request.num_questions} quiz questions about: {request.subject}"
        )
        
        response = await chat.send_message(user_message)
        
        # Parse response
        import json
        # Remove markdown code blocks if present
        response_text = response.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:]
        if response_text.startswith("```"):
            response_text = response_text[3:]
        if response_text.endswith("```"):
            response_text = response_text[:-3]
        response_text = response_text.strip()
        
        data = json.loads(response_text)
        questions = [
            QuizQuestion(**q) for q in data["questions"]
        ]
        
        quiz = Quiz(
            subject=request.subject,
            difficulty=request.difficulty,
            questions=questions
        )
        
        # Save to database
        doc = quiz.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        await db.quizzes.insert_one(doc)
        
        return quiz
    except Exception as e:
        logging.error(f"Error generating quiz: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate quiz: {str(e)}")


@api_router.get("/quiz/history", response_model=List[Quiz])
async def get_quiz_history():
    quizzes = await db.quizzes.find({}, {"_id": 0}).sort("timestamp", -1).limit(20).to_list(20)
    
    for quiz in quizzes:
        if isinstance(quiz['timestamp'], str):
            quiz['timestamp'] = datetime.fromisoformat(quiz['timestamp'])
    
    return quizzes


@api_router.post("/study/explain", response_model=StudySession)
async def explain_concept(request: StudyRequest):
    try:
        system_message = "You are a patient and knowledgeable tutor. Explain concepts step-by-step in simple, clear terms that anyone can understand. Use analogies and examples where helpful. Structure your explanation with clear numbered steps."
        
        chat = create_llm_chat(system_message)
        user_message = UserMessage(
            text=f"Explain this concept step-by-step: {request.concept}"
        )
        
        explanation = await chat.send_message(user_message)
        
        session = StudySession(
            concept=request.concept,
            explanation=explanation
        )
        
        # Save to database
        doc = session.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        await db.study_sessions.insert_one(doc)
        
        return session
    except Exception as e:
        logging.error(f"Error explaining concept: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to explain concept: {str(e)}")


@api_router.get("/study/history", response_model=List[StudySession])
async def get_study_history():
    sessions = await db.study_sessions.find({}, {"_id": 0}).sort("timestamp", -1).limit(20).to_list(20)
    
    for session in sessions:
        if isinstance(session['timestamp'], str):
            session['timestamp'] = datetime.fromisoformat(session['timestamp'])
    
    return sessions


@api_router.post("/translate", response_model=Translation)
async def translate_phrase(request: TranslationRequest):
    try:
        system_message = f"You are a language expert specializing in {request.target_lang}. Translate phrases from {request.source_lang} to {request.target_lang} and provide rich cultural context, usage notes, and interesting facts about the phrase. Be detailed and educational."
        
        chat = create_llm_chat(system_message)
        user_message = UserMessage(
            text=f"Translate this phrase and provide cultural context: '{request.phrase}'. Provide the response in this format:\n\nTranslation: [translated phrase]\n\nCultural Context: [detailed explanation]"
        )
        
        response = await chat.send_message(user_message)
        
        # Parse the response
        parts = response.split("Cultural Context:")
        translation_text = parts[0].replace("Translation:", "").strip()
        cultural_context = parts[1].strip() if len(parts) > 1 else "No additional context provided."
        
        translation = Translation(
            phrase=request.phrase,
            source_lang=request.source_lang,
            target_lang=request.target_lang,
            translation=translation_text,
            cultural_context=cultural_context
        )
        
        # Save to database
        doc = translation.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        await db.translations.insert_one(doc)
        
        return translation
    except Exception as e:
        logging.error(f"Error translating phrase: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to translate phrase: {str(e)}")


@api_router.get("/translate/history", response_model=List[Translation])
async def get_translation_history():
    translations = await db.translations.find({}, {"_id": 0}).sort("timestamp", -1).limit(20).to_list(20)
    
    for translation in translations:
        if isinstance(translation['timestamp'], str):
            translation['timestamp'] = datetime.fromisoformat(translation['timestamp'])
    
    return translations


@api_router.get("/progress", response_model=ProgressStats)
async def get_progress():
    total_quizzes = await db.quizzes.count_documents({})
    total_study = await db.study_sessions.count_documents({})
    total_trans = await db.translations.count_documents({})
    
    # Get recent activities from all collections
    recent_activities = []
    
    # Get recent quizzes
    recent_quizzes = await db.quizzes.find({}, {"_id": 0, "id": 1, "subject": 1, "timestamp": 1}).sort("timestamp", -1).limit(5).to_list(5)
    for quiz in recent_quizzes:
        recent_activities.append({
            "type": "quiz",
            "title": f"Quiz: {quiz.get('subject', 'Unknown')}",
            "timestamp": quiz.get('timestamp')
        })
    
    # Get recent study sessions
    recent_studies = await db.study_sessions.find({}, {"_id": 0, "id": 1, "concept": 1, "timestamp": 1}).sort("timestamp", -1).limit(5).to_list(5)
    for study in recent_studies:
        recent_activities.append({
            "type": "study",
            "title": f"Studied: {study.get('concept', 'Unknown')}",
            "timestamp": study.get('timestamp')
        })
    
    # Get recent translations
    recent_trans = await db.translations.find({}, {"_id": 0, "id": 1, "phrase": 1, "timestamp": 1}).sort("timestamp", -1).limit(5).to_list(5)
    for trans in recent_trans:
        recent_activities.append({
            "type": "translation",
            "title": f"Translated: {trans.get('phrase', 'Unknown')}",
            "timestamp": trans.get('timestamp')
        })
    
    # Sort by timestamp
    recent_activities.sort(key=lambda x: x.get('timestamp', ''), reverse=True)
    recent_activities = recent_activities[:10]
    
    return ProgressStats(
        total_quizzes=total_quizzes,
        total_study_sessions=total_study,
        total_translations=total_trans,
        recent_activities=recent_activities
    )


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()