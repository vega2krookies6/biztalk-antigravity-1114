import os
import logging
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_upstage import ChatUpstage
from prompts.templates import PROMPTS

logger = logging.getLogger("biztalk.tone_converter")

# Upstage Solar-Pro4 모델 초기화 (환경 변수 UPSTAGE_API_KEY 자동 로드)
MODEL_NAME = "solar-pro4"


def get_chat_model() -> ChatUpstage:
    api_key = os.getenv("UPSTAGE_API_KEY")
    if not api_key:
        logger.error("UPSTAGE_API_KEY 환경 변수가 설정되지 않았습니다.")
        raise ValueError("UPSTAGE_API_KEY 환경 변수가 설정되지 않았습니다.")
    return ChatUpstage(model_name=MODEL_NAME, api_key=api_key)


async def convert_tone(text: str, target_audience: str) -> str:
    """원문 텍스트를 수신 대상에 맞는 비즈니스 말투로 변환합니다."""
    system_prompt = PROMPTS.get(target_audience)
    if not system_prompt:
        raise ValueError(f"지원하지 않는 수신 대상입니다: {target_audience}")

    chat_model = get_chat_model()

    messages = [
        SystemMessage(content=system_prompt),
        HumanMessage(content=f"다음 내용을 변환해 주세요:\n{text}"),
    ]

    try:
        # 비동기 LLM 호출 (LangChain ainvoke 지원)
        response = await chat_model.ainvoke(messages)
        converted_text = response.content.strip()
        return converted_text
    except Exception as e:
        logger.error(f"Solar-Pro4 API 호출 실패: {str(e)}", exc_info=True)
        raise RuntimeError(f"말투 변환 처리 중 오류가 발생했습니다: {str(e)}") from e
