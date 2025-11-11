from datetime import datetime
from fastapi import APIRouter, Query
from ..schemas import ApiResponse

router = APIRouter()

CATEGORIES = ["guideline", "literature", "case_study", "protocol"]

@router.get('/categories', response_model=ApiResponse)
def get_categories():
    return ApiResponse(success=True, data=CATEGORIES, timestamp=datetime.utcnow().isoformat())

@router.get('/search', response_model=ApiResponse)
def search(query: str = Query(...), category: str | None = None):
    items = [
        {
            "id": "k_001",
            "content": f"关于 {query} 的医学文献摘要",
            "content_type": category or "literature",
            "category": category or "endocrinology",
            "source": "PubMed",
            "created_at": datetime.utcnow().isoformat(),
        }
    ]
    return ApiResponse(success=True, data=items, timestamp=datetime.utcnow().isoformat())