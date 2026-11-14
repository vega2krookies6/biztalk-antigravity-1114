import logging
from fastapi import APIRouter, HTTPException, status
from models.schemas import ConvertRequest, ConvertResponse
from services.tone_converter import convert_tone

logger = logging.getLogger("biztalk.routers.convert")

router = APIRouter(tags=["Tone Conversion"])


@router.post(
    "/convert",
    response_model=ConvertResponse,
    status_code=status.HTTP_200_OK,
    summary="업무 말투 변환",
    description="입력된 원문 텍스트를 대상(상사, 타팀 동료, 고객, 팀 내 동료)에 적합한 업무 말투로 변환합니다.",
)
async def convert_text(request: ConvertRequest):
    try:
        converted = await convert_tone(
            text=request.text,
            target_audience=request.target_audience
        )
        return ConvertResponse(
            converted_text=converted,
            target_audience=request.target_audience,
            original_text=request.text,
        )
    except ValueError as ve:
        logger.warning(f"잘못된 요청 인자: {ve}")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(ve)
        )
    except Exception as e:
        logger.error(f"말투 변환 처리 에러: {e}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="LLM API 호출 중 오류가 발생했습니다."
        )
