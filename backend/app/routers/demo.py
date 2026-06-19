from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.security import get_current_user, require_min_role
from app.db.session import get_db
from app.models import User
from app.schemas import AMIFEventIn
from app.services.document_service import document_service
from app.services.event_service import event_service
from app.connectors.camera_connector import forklift_detected_event
from app.connectors.iot_connector import temperature_event

router = APIRouter(prefix='/api/demo', tags=['demo'])

DEMO_MANUAL = """
Machine A Safety and Maintenance Manual. If operating temperature exceeds 85°C, immediately inspect coolant flow, ventilation, and machine load. Restricted-zone vehicle activity near Machine A requires supervisor review because it can block emergency access and increase collision risk. If overheating coincides with nearby forklift activity, create a high-priority maintenance ticket, notify the floor supervisor, and restrict the affected zone until inspected. Previous incidents show blocked coolant valves and airflow obstruction as common causes of rapid temperature increase.
"""


@router.post('/seed', dependencies=[Depends(require_min_role('Analyst'))])
def seed_demo(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    doc = document_service.create_document(
        db,
        file_name='machine_a_safety_manual.txt',
        text=DEMO_MANUAL,
        actor=user.email,
        document_type='maintenance_manual',
        asset_id='machine_a',
    )
    forklift = event_service.ingest(db, AMIFEventIn(**forklift_detected_event()), actor=user.email)
    temp = event_service.ingest(db, AMIFEventIn(**temperature_event()), actor=user.email)
    return {
        'status': 'seeded',
        'document_id': doc.document_id,
        'events': [forklift.event_id, temp.event_id],
        'message': 'Demo data inserted. Check incidents, alerts, and agent runs.'
    }
