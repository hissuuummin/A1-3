import json
import os
import urllib.request
import urllib.error
from http.server import BaseHTTPRequestHandler

def generate_mock_plan(destination, duration, travelers, theme, budget, notes):
    """API 키가 없거나 테스트 환경일 때 반환하는 현실적이고 지능적인 시뮬레이션 데이터"""
    theme_str = ", ".join(theme) if isinstance(theme, list) else str(theme)
    return {
        "success": True,
        "is_mock": True,
        "message": "현재 스마트 시뮬레이션 모드로 생성되었습니다. Vercel 환경 변수(OPENAI_API_KEY 또는 GEMINI_API_KEY)를 설정하면 실시간 최신 AI 모델과 바로 연동됩니다.",
        "data": {
            "title": f"✨ {destination} {duration} 맞춤 여행 코스 ({travelers})",
            "summary": f"{destination}(으)로 떠나는 맞춤형 여행입니다. {theme_str} 테마를 중심으로 {budget} 예산에 최적화된 동선과 감성 스팟을 엄선했습니다.",
            "destination": destination,
            "duration": duration,
            "travelers": travelers,
            "theme": theme,
            "budget": budget,
            "days": [
                {
                    "day": 1,
                    "title": "설레는 첫걸음 & 랜드마크 탐방",
                    "schedule": [
                        {
                            "time": "오전 (10:00 - 12:00)",
                            "place": f"{destination} 도착 및 대표 랜드마크",
                            "activity": f"{destination} 주요 명소 산책 및 포토존에서 인생샷 남기기",
                            "tip": "대중교통 또는 렌터카 이동 시 주차 공간을 사전 확인하세요."
                        },
                        {
                            "time": "점심 (12:30 - 14:00)",
                            "place": f"{destination} 로컬 시그니처 맛집",
                            "activity": f"현지인들이 추천하는 대표 먹거리와 제철 별미 즐기기",
                            "tip": "웨이팅이 있을 수 있으니 테이블링/캐치테이블 현장 등록을 추천합니다."
                        },
                        {
                            "time": "오후 (14:30 - 17:30)",
                            "place": f"감성 오션뷰/마운틴뷰 카페 & {theme_str} 명소",
                            "activity": "여유로운 커피 타임과 함께 현지 감성 골목 둘러보기",
                            "tip": "시그니처 음료와 디저트를 주문해보세요."
                        },
                        {
                            "time": "저녁 (18:00 - 20:30)",
                            "place": f"{destination} 야경 명소 및 감성 디너",
                            "activity": "일몰 감상 후 분위기 좋은 식당에서 저녁 식사",
                            "tip": "일몰 30분 전 도착하여 노을을 감상하면 가장 아름답습니다."
                        },
                        {
                            "time": "숙소 (21:00 이후)",
                            "place": f"{destination} 인근 아늑한 숙소 체크인",
                            "activity": "하루의 피로를 풀며 야식 및 다음 날 일정 정리",
                            "tip": "다음 날 이른 일정을 위해 꿀잠 준비!"
                        }
                    ]
                },
                {
                    "day": 2,
                    "title": "자연과 힐링 & 완벽한 마무리",
                    "schedule": [
                        {
                            "time": "오전 (09:30 - 11:30)",
                            "place": "피톤치드 숲길 or 해안 산책로",
                            "activity": "상쾌한 아침 공기를 마시며 힐링 산책",
                            "tip": "편안한 운동화 착용을 권장합니다."
                        },
                        {
                            "time": "점심 (12:00 - 13:30)",
                            "place": "든든한 향토 한식당",
                            "activity": "속 편하고 든든한 점심 식사",
                            "tip": "기념품/지역 특산물 구입도 함께 챙겨보세요."
                        },
                        {
                            "time": "오후 (14:00 - 16:30)",
                            "place": "지역 기념품 샵 & 복귀 준비",
                            "activity": "소품샵 투어 후 아쉬운 여행 마무리",
                            "tip": "교통편 시간 40분 전에는 역/터미널/공항으로 이동하세요."
                        }
                    ]
                }
            ],
            "budget_breakdown": {
                "transport": "약 30% (교통비/주유/대중교통)",
                "food": "약 40% (맛집 탐방 및 감성 카페)",
                "accommodation": "약 20% (가성비 및 분위기 숙소)",
                "etc": "약 10% (입장료, 체험비 및 기념품)"
            },
            "packing_checklist": [
                "신분증 및 카드/교통카드",
                "보조배터리 및 스마트폰 충전기",
                "카메라 또는 휴대폰 여유 용량 확보",
                "날씨에 맞는 여벌 옷 및 편한 신발",
                "상비약 (소화제, 두통약, 밴드)"
            ],
            "ai_advice": f"{travelers} 여행에 걸맞게 무리한 이동을 줄이고 만족도를 극대화했습니다. {notes if notes else '현지 사정에 따라 날씨와 휴무일을 꼭 확인하세요.'}"
        }
    }


def call_openai_api(api_key, destination, duration, travelers, theme, budget, notes):
    """OpenAI API (gpt-4o-mini)를 호출하여 구조화된 여행 계획을 생성"""
    theme_str = ", ".join(theme) if isinstance(theme, list) else str(theme)
    prompt = f"""
당신은 최고의 여행 플래너 AI '트립스파크'입니다. 아래 사용자의 여행 조건에 맞춰 실용적이고 매력적인 상세 여행 계획을 세워주세요.

[사용자 입력 정보]
- 여행 목적지: {destination}
- 여행 기간: {duration}
- 동행자: {travelers}
- 여행 테마: {theme_str}
- 1인당 예상 예산: {budget}
- 추가 요청사항: {notes if notes else '없음'}

반드시 아래 JSON 포맷을 정확히 지켜서 순수 JSON 문자열만 응답하세요. 백틱(```json)이나 다른 설명 텍스트를 포함하지 마세요.

{{
  "title": "매력적인 여행 코스 제목",
  "summary": "코스 전체를 아우르는 2~3줄 요약 설명",
  "destination": "{destination}",
  "duration": "{duration}",
  "travelers": "{travelers}",
  "theme": "{theme_str}",
  "budget": "{budget}",
  "days": [
    {{
      "day": 1,
      "title": "1일차 테마/소제목",
      "schedule": [
        {{
          "time": "오전 (10:00 - 12:00)",
          "place": "구체적인 장소명",
          "activity": "구체적인 활동 내용",
          "tip": "방문 팁 또는 이동 팁"
        }},
        {{
          "time": "점심 (12:00 - 13:30)",
          "place": "추천 식당 또는 음식 종류",
          "activity": "식사 내용",
          "tip": "웨이팅/예약 팁"
        }},
        {{
          "time": "오후 (14:00 - 17:30)",
          "place": "오후 명소 및 카페",
          "activity": "체험 및 휴식",
          "tip": "사진 스팟 팁"
        }},
        {{
          "time": "저녁 (18:00 - 20:30)",
          "place": "저녁 식사 및 야경",
          "activity": "저녁 활동",
          "tip": "야경 관람 팁"
        }}
      ]
    }}
  ],
  "budget_breakdown": {{
    "transport": "예상 교통비 비율 및 설명",
    "food": "예상 식음료비 비율 및 설명",
    "accommodation": "예상 숙박비 비율 및 설명",
    "etc": "예상 입장료 및 기타비용"
  }},
  "packing_checklist": [
    "준비물 항목 1",
    "준비물 항목 2",
    "준비물 항목 3",
    "준비물 항목 4",
    "준비물 항목 5"
  ],
  "ai_advice": "여행자를 위한 특별 맞춤 조언 (1~2줄)"
}}
"""
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {api_key}"
    }
    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": "You are TripSpark, a travel concierge AI. Always respond in valid JSON without markdown fences."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.7,
        "max_tokens": 2000
    }
    
    req = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=json.dumps(payload).encode("utf-8"),
        headers=headers,
        method="POST"
    )
    
    with urllib.request.urlopen(req, timeout=25) as response:
        res_body = response.read().decode("utf-8")
        parsed = json.loads(res_body)
        raw_content = parsed["choices"][0]["message"]["content"].strip()
        
        # 혹시 마크다운 코드블록(```json ... ```)으로 감싸져 있는 경우 제거
        if raw_content.startswith("```json"):
            raw_content = raw_content[7:]
        if raw_content.startswith("```"):
            raw_content = raw_content[3:]
        if raw_content.endswith("```"):
            raw_content = raw_content[:-3]
        raw_content = raw_content.strip()
        
        plan_data = json.loads(raw_content)
        return {
            "success": True,
            "is_mock": False,
            "data": plan_data
        }


def call_gemini_api(api_key, destination, duration, travelers, theme, budget, notes):
    """Google Gemini API를 호출하여 구조화된 여행 계획을 생성"""
    theme_str = ", ".join(theme) if isinstance(theme, list) else str(theme)
    prompt = f"""
당신은 최고의 여행 플래너 AI '트립스파크'입니다. 아래 사용자의 여행 조건에 맞춰 실용적이고 매력적인 상세 여행 계획을 세워주세요.

[사용자 입력 정보]
- 여행 목적지: {destination}
- 여행 기간: {duration}
- 동행자: {travelers}
- 여행 테마: {theme_str}
- 1인당 예상 예산: {budget}
- 추가 요청사항: {notes if notes else '없음'}

반드시 아래 JSON 포맷을 정확히 지켜서 순수 JSON 문자열만 응답하세요. 백틱(```json)이나 다른 설명 텍스트를 포함하지 마세요.

{{
  "title": "매력적인 여행 코스 제목",
  "summary": "코스 전체를 아우르는 2~3줄 요약 설명",
  "destination": "{destination}",
  "duration": "{duration}",
  "travelers": "{travelers}",
  "theme": "{theme_str}",
  "budget": "{budget}",
  "days": [
    {{
      "day": 1,
      "title": "1일차 테마/소제목",
      "schedule": [
        {{
          "time": "오전 (10:00 - 12:00)",
          "place": "구체적인 장소명",
          "activity": "구체적인 활동 내용",
          "tip": "방문 팁 또는 이동 팁"
        }},
        {{
          "time": "점심 (12:00 - 13:30)",
          "place": "추천 식당 또는 음식 종류",
          "activity": "식사 내용",
          "tip": "웨이팅/예약 팁"
        }},
        {{
          "time": "오후 (14:00 - 17:30)",
          "place": "오후 명소 및 카페",
          "activity": "체험 및 휴식",
          "tip": "사진 스팟 팁"
        }},
        {{
          "time": "저녁 (18:00 - 20:30)",
          "place": "저녁 식사 및 야경",
          "activity": "저녁 활동",
          "tip": "야경 관람 팁"
        }}
      ]
    }}
  ],
  "budget_breakdown": {{
    "transport": "예상 교통비 비율 및 설명",
    "food": "예상 식음료비 비율 및 설명",
    "accommodation": "예상 숙박비 비율 및 설명",
    "etc": "예상 입장료 및 기타비용"
  }},
  "packing_checklist": [
    "준비물 항목 1",
    "준비물 항목 2",
    "준비물 항목 3",
    "준비물 항목 4",
    "준비물 항목 5"
  ],
  "ai_advice": "여행자를 위한 특별 맞춤 조언 (1~2줄)"
}}
"""
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={api_key}"
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }],
        "generationConfig": {
            "response_mime_type": "application/json"
        }
    }
    
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers=headers,
        method="POST"
    )
    
    with urllib.request.urlopen(req, timeout=25) as response:
        res_body = response.read().decode("utf-8")
        parsed = json.loads(res_body)
        raw_text = parsed["candidates"][0]["content"]["parts"][0]["text"].strip()
        plan_data = json.loads(raw_text)
        return {
            "success": True,
            "is_mock": False,
            "data": plan_data
        }


class handler(BaseHTTPRequestHandler):
    def _send_json(self, data, status=200):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()
        self.wfile.write(body)

    def do_OPTIONS(self):
        """CORS Preflight 대응"""
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.send_header("Content-Length", "0")
        self.end_headers()

    def do_GET(self):
        """API 헬스체크 또는 정적 웹 파일 서빙"""
        clean_path = self.path.split("?")[0].strip()
        
        # 1. API 헬스체크 요청
        if clean_path in ("/api", "/api/", "/api/generate", "/api/generate/"):
            res = {
                "service": "TripSpark AI API",
                "status": "online",
                "usage": "POST /api/generate with JSON body"
            }
            self._send_json(res, 200)
            return

        # 2. 정적 웹 파일 (index.html, css, js 등) 서빙
        file_subpath = clean_path.lstrip("/")
        if not file_subpath:
            file_subpath = "index.html"

        # 프로젝트 루트 디렉토리 탐색
        root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        target_file = os.path.join(root_dir, file_subpath)
        if not os.path.isfile(target_file):
            target_file = os.path.join(os.getcwd(), file_subpath)

        if os.path.isfile(target_file):
            import mimetypes
            mime_type, _ = mimetypes.guess_type(target_file)
            if not mime_type:
                mime_type = "application/octet-stream"
            try:
                with open(target_file, "rb") as f:
                    content = f.read()
                self.send_response(200)
                content_type = f"{mime_type}; charset=utf-8" if ("text" in mime_type or "javascript" in mime_type or "json" in mime_type) else mime_type
                self.send_header("Content-Type", content_type)
                self.send_header("Content-Length", str(len(content)))
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(content)
                return
            except Exception as e:
                self._send_json({"error": f"Failed to read file: {str(e)}"}, 500)
                return

        # 파일이 없을 경우 404
        self.send_error(404, f"File Not Found: {file_subpath}")

    def do_POST(self):
        """AI 여행 일정 생성 요청 처리"""
        try:
            content_length = int(self.headers.get("Content-Length", 0))
            if content_length == 0:
                self._send_json({
                    "success": False,
                    "error": "요청 본문(Body)이 비어있습니다. 필수 정보를 전송해주세요."
                }, status=400)
                return

            body = self.rfile.read(content_length).decode("utf-8")
            try:
                data = json.loads(body)
            except json.JSONDecodeError:
                self._send_json({
                    "success": False,
                    "error": "올바른 JSON 형식이 아닙니다."
                }, status=400)
                return

            # 필수값 유효성 검증
            destination = data.get("destination", "").strip()
            if not destination:
                self._send_json({
                    "success": False,
                    "error": "여행 목적지(destination)는 필수 입력 항목입니다."
                }, status=400)
                return

            duration = data.get("duration", "1박 2일").strip()
            travelers = data.get("travelers", "친구와 함께").strip()
            theme = data.get("theme", ["힐링/자연", "맛집 투어"])
            budget = data.get("budget", "1인 20만원대").strip()
            notes = data.get("notes", "").strip()

            # API 키 확인 (OpenAI 우선, 다음 Gemini, 없으면 Mock 시뮬레이션)
            openai_key = os.environ.get("OPENAI_API_KEY", "").strip()
            gemini_key = os.environ.get("GEMINI_API_KEY", "").strip()
            force_mock = os.environ.get("ENABLE_MOCK", "false").lower() == "true"

            if openai_key and not force_mock:
                try:
                    result = call_openai_api(openai_key, destination, duration, travelers, theme, budget, notes)
                    self._send_json(result, status=200)
                    return
                except urllib.error.HTTPError as e:
                    error_body = e.read().decode("utf-8")
                    print(f"OpenAI API error: {e.code} - {error_body}")
                    # 키 에러 또는 쿼터 제한인 경우
                    if e.code == 401:
                        self._send_json({
                            "success": False,
                            "error": "등록된 OpenAI API 키가 유효하지 않습니다. Vercel 환경 변수를 확인해주세요."
                        }, status=500)
                        return
                    elif e.code == 429:
                        self._send_json({
                            "success": False,
                            "error": "AI API 호출 한도(Quota)를 초과했습니다. 잠시 후 다시 시도해주세요."
                        }, status=500)
                        return
                    else:
                        self._send_json({
                            "success": False,
                            "error": f"AI 서비스 응답 오류가 발생했습니다. (코드: {e.code})"
                        }, status=502)
                        return
                except Exception as ex:
                    print(f"OpenAI general error: {str(ex)}")
                    self._send_json({
                        "success": False,
                        "error": f"AI 처리 중 예기치 않은 오류가 발생했습니다: {str(ex)}"
                    }, status=500)
                    return

            elif gemini_key and not force_mock:
                try:
                    result = call_gemini_api(gemini_key, destination, duration, travelers, theme, budget, notes)
                    self._send_json(result, status=200)
                    return
                except Exception as ex:
                    print(f"Gemini error: {str(ex)}")
                    self._send_json({
                        "success": False,
                        "error": f"Gemini API 호출 중 오류가 발생했습니다: {str(ex)}"
                    }, status=500)
                    return

            else:
                # API 키가 등록되지 않았을 때 안전하고 즉각적인 스마트 시뮬레이션 응답 제공
                result = generate_mock_plan(destination, duration, travelers, theme, budget, notes)
                self._send_json(result, status=200)

        except Exception as e:
            self._send_json({
                "success": False,
                "error": f"서버 내부 처리 오류: {str(e)}"
            }, status=500)
