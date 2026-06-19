from sqlalchemy import Column, Integer, String, JSON, DateTime, ForeignKey
from sqlalchemy.orm import declarative_base
from datetime import datetime

Base = declarative_base()

class HumanFeedback(Base):
    """
    Data Flywheel: Captures operator corrections to AI reasoning 
    for offline prompt-regression testing and fine-tuning.
    """
    __tablename__ = "human_feedback"

    id = Column(Integer, primary_key=True, index=True)
    incident_id = Column(String, index=True)
    operator_email = Column(String, index=True)
    
    # What the AI originally thought
    original_ai_reasoning = Column(JSON, nullable=False)
    original_risk_score = Column(Integer, nullable=False)
    
    # What the human corrected it to
    corrected_reasoning = Column(String, nullable=False)
    corrected_risk_score = Column(Integer, nullable=False)
    
    created_at = Column(DateTime, default=datetime.utcnow)
