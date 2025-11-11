from datetime import datetime
from typing import List
from fastapi import APIRouter, UploadFile, File, Form
from ..schemas import ApiResponse, OCRResponse, ProcessedFile

router = APIRouter()

@router.post('/upload', response_model=ApiResponse)
async def upload(files: List[UploadFile] = File(...), patient_id: str = Form(...), document_type: str = Form(...)):
    processed = [
        ProcessedFile(
            file_id=f"f_{i}",
            original_name=f.filename,
            file_url=f"https://files.example.com/{f.filename}",
            status="completed",
            ocr_result={"text": "示例OCR文本", "confidence": 0.93},
        )
        for i, f in enumerate(files, start=1)
    ]
    data = OCRResponse(upload_id="up_001", files=processed, ocr_status="completed")
    return ApiResponse(success=True, data=data.model_dump(), timestamp=datetime.utcnow().isoformat())