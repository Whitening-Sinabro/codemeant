import asyncio
from typing import Any

import httpx
from openai import AsyncOpenAI
from anthropic import AsyncAnthropic
import google.generativeai as genai

from app.config import get_settings

settings = get_settings()


class AIAnalyzer:
    """멀티 AI 분석 오케스트레이터"""

    def __init__(self):
        self.openai_client = AsyncOpenAI(api_key=settings.openai_api_key) if settings.openai_api_key else None
        self.anthropic_client = AsyncAnthropic(api_key=settings.anthropic_api_key) if settings.anthropic_api_key else None
        if settings.google_api_key:
            genai.configure(api_key=settings.google_api_key)
            self.gemini_model = genai.GenerativeModel("gemini-1.5-flash")
        else:
            self.gemini_model = None

    async def analyze(self, metadata: dict) -> dict:
        """메타데이터를 기반으로 가격 추정 및 판매 전략 생성"""
        prompt = self._build_prompt(metadata)

        # 병렬로 GPT, Gemini 호출
        tasks = []
        if self.openai_client:
            tasks.append(self._call_gpt(prompt))
        if self.gemini_model:
            tasks.append(self._call_gemini(prompt))

        results = await asyncio.gather(*tasks, return_exceptions=True)

        # 결과 수집
        analyses = []
        for result in results:
            if isinstance(result, Exception):
                continue
            if result:
                analyses.append(result)

        if not analyses:
            return self._fallback_analysis(metadata)

        # Claude로 종합
        if self.anthropic_client:
            final_result = await self._synthesize_with_claude(analyses, metadata)
            return final_result

        # Claude 없으면 첫 번째 결과 반환
        return analyses[0]

    def _build_prompt(self, metadata: dict) -> str:
        return f"""다음 소프트웨어 프로젝트의 시장 가치를 분석해주세요.

## 프로젝트 정보

### 기술 스택
- 언어: {', '.join(metadata.get('tech_stack', {}).get('languages', []))}
- 프레임워크: {', '.join(metadata.get('tech_stack', {}).get('frameworks', []))}
- 데이터베이스: {', '.join(metadata.get('tech_stack', {}).get('databases', []))}

### 의존성
```json
{metadata.get('dependencies', {})}
```

### 파일 구조
```
{self._format_file_tree(metadata.get('file_tree', {}))}
```

### README 요약
{metadata.get('readme_content', '없음')[:1000]}

## 요청사항

JSON 형식으로 다음 정보를 제공해주세요:

```json
{{
  "price_estimation": {{
    "minimum": 숫자(USD),
    "maximum": 숫자(USD),
    "recommended": 숫자(USD),
    "reasoning": "가격 책정 근거"
  }},
  "sales_strategy": {{
    "recommended_platforms": ["플랫폼1", "플랫폼2"],
    "target_customers": ["타겟1", "타겟2"],
    "positioning": "포지셔닝 전략",
    "key_selling_points": ["셀링포인트1", "셀링포인트2"]
  }}
}}
```"""

    def _format_file_tree(self, tree: dict, indent: int = 0) -> str:
        if not tree:
            return ""

        result = "  " * indent + tree.get("name", "")
        if tree.get("type") == "directory":
            result += "/"
            for child in tree.get("children", [])[:10]:
                result += "\n" + self._format_file_tree(child, indent + 1)
        return result

    async def _call_gpt(self, prompt: str) -> dict | None:
        try:
            response = await self.openai_client.chat.completions.create(
                model="gpt-4o-mini",
                messages=[
                    {"role": "system", "content": "당신은 소프트웨어 프로젝트 가치 평가 전문가입니다. JSON 형식으로만 응답하세요."},
                    {"role": "user", "content": prompt},
                ],
                response_format={"type": "json_object"},
                max_tokens=2000,
            )
            import json
            return json.loads(response.choices[0].message.content)
        except Exception as e:
            print(f"GPT 호출 실패: {e}")
            return None

    async def _call_gemini(self, prompt: str) -> dict | None:
        try:
            response = await asyncio.to_thread(
                self.gemini_model.generate_content,
                prompt + "\n\n반드시 JSON 형식으로만 응답하세요.",
            )
            import json
            text = response.text
            # JSON 블록 추출
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0]
            elif "```" in text:
                text = text.split("```")[1].split("```")[0]
            return json.loads(text.strip())
        except Exception as e:
            print(f"Gemini 호출 실패: {e}")
            return None

    async def _synthesize_with_claude(self, analyses: list[dict], metadata: dict) -> dict:
        """여러 AI 분석 결과를 Claude로 종합"""
        synthesis_prompt = f"""다음은 여러 AI가 분석한 소프트웨어 프로젝트 가치 평가입니다.
이를 종합하여 최종 분석 결과를 제공해주세요.

## AI 분석 결과들
{analyses}

## 원본 프로젝트 정보
- 기술 스택: {metadata.get('tech_stack', {})}
- 의존성 수: {len(metadata.get('dependencies', {}).get('npm', {}))} (npm), {len(metadata.get('dependencies', {}).get('python', []))} (python)

## 요청사항
각 AI의 분석을 종합하여 가장 합리적인 가격대와 판매 전략을 JSON 형식으로 제시해주세요.
특히 가격 범위가 다를 경우, 근거를 바탕으로 조율해주세요.

JSON 형식:
```json
{{
  "price_estimation": {{
    "minimum": 숫자(USD),
    "maximum": 숫자(USD),
    "recommended": 숫자(USD),
    "currency": "USD",
    "reasoning": "종합적인 가격 책정 근거",
    "comparable_projects": [
      {{"name": "예시 프로젝트", "price": 숫자, "platform": "플랫폼명", "similarity": "유사점"}}
    ]
  }},
  "sales_strategy": {{
    "recommended_platforms": [
      {{"name": "플랫폼명", "url": "URL", "pros": ["장점"], "cons": ["단점"], "estimated_reach": "예상 도달률"}}
    ],
    "target_customers": ["타겟1", "타겟2"],
    "positioning": "포지셔닝 전략",
    "key_selling_points": ["셀링포인트1", "셀링포인트2"]
  }}
}}
```"""

        try:
            response = await self.anthropic_client.messages.create(
                model="claude-3-5-haiku-latest",
                max_tokens=2000,
                messages=[
                    {"role": "user", "content": synthesis_prompt},
                ],
            )
            import json
            text = response.content[0].text
            if "```json" in text:
                text = text.split("```json")[1].split("```")[0]
            elif "```" in text:
                text = text.split("```")[1].split("```")[0]
            return json.loads(text.strip())
        except Exception as e:
            print(f"Claude 종합 실패: {e}")
            # 폴백: 첫 번째 분석 결과 반환
            return analyses[0] if analyses else self._fallback_analysis(metadata)

    def _fallback_analysis(self, metadata: dict) -> dict:
        """AI 호출 실패 시 기본 분석 반환"""
        frameworks = metadata.get("tech_stack", {}).get("frameworks", [])
        languages = metadata.get("tech_stack", {}).get("languages", [])

        base_price = 50
        if "Next.js" in frameworks or "React" in frameworks:
            base_price += 50
        if "FastAPI" in frameworks or "Django" in frameworks:
            base_price += 30
        if "TypeScript" in languages:
            base_price += 20

        return {
            "price_estimation": {
                "minimum": base_price,
                "maximum": base_price * 3,
                "recommended": base_price * 2,
                "currency": "USD",
                "reasoning": "기술 스택 기반 자동 추정 (AI 분석 실패로 인한 폴백)",
                "comparable_projects": [],
            },
            "sales_strategy": {
                "recommended_platforms": [
                    {
                        "name": "Gumroad",
                        "url": "https://gumroad.com",
                        "pros": ["쉬운 설정", "글로벌 접근"],
                        "cons": ["높은 수수료"],
                        "estimated_reach": "중간",
                    }
                ],
                "target_customers": ["1인 개발자", "스타트업"],
                "positioning": "빠른 시작을 위한 보일러플레이트",
                "key_selling_points": frameworks[:3] if frameworks else ["빠른 개발"],
            },
        }


# 싱글톤 인스턴스
_analyzer: AIAnalyzer | None = None


def get_ai_analyzer() -> AIAnalyzer:
    global _analyzer
    if _analyzer is None:
        _analyzer = AIAnalyzer()
    return _analyzer
