/**
 * TripSpark - API Communication & Validation Layer
 * 프론트엔드와 Vercel Serverless Function(Python: /api/generate) 간의 통신 및 예외 처리
 */

const API_CONFIG = {
  ENDPOINT: '/api/generate',
  TIMEOUT_MS: 30000 // 30초 타임아웃
};

const ApiService = {
  /**
   * 사용자 폼 입력값 유효성 사전 검사 (UX 필수 기준 1: 빈 입력/필수값 누락 대응)
   */
  validateInputs(formData) {
    if (!formData.destination || formData.destination.trim() === '') {
      return {
        isValid: false,
        field: 'destination',
        message: '여행 목적지(도시 또는 지역)를 입력해주세요. (예: 제주도, 강릉, 부산)'
      };
    }

    const dest = formData.destination.trim();
    if (dest.length < 2) {
      return {
        isValid: false,
        field: 'destination',
        message: '목적지는 최소 2글자 이상 입력해주세요.'
      };
    }

    // 한글 자음/모음만 연속 입력된 경우 (ㅋㅋㅋ, ㅎㅎㅎ 등)
    if (/^[ㄱ-ㅎㅏ-ㅣ]+$/.test(dest)) {
      return {
        isValid: false,
        field: 'destination',
        message: `'${dest}'은(는) 올바른 지역명이 아닙니다. 실제 존재하는 도시나 지역명을 입력해주세요.`
      };
    }

    // 명백한 테스트어 / 비여행 단어 필터링
    const obviousInvalid = ['다인', '테스트', 'test', 'asdf', 'qwerty', '아무거나', '아무데나', '어딘가', '모름', '없음', '집', '우리집', '회사', '학교'];
    if (obviousInvalid.includes(dest.toLowerCase())) {
      return {
        isValid: false,
        field: 'destination',
        message: `'${dest}'은(는) 실제 존재하는 여행지로 확인되지 않습니다. 올바른 도시나 지역명을 입력해주세요 (예: 제주도, 강릉, 부산, 경주, 도쿄 등).`
      };
    }

    return { isValid: true };
  },

  /**
   * AI 여행 일정 생성 API 호출
   * @param {Object} payload 폼 입력 데이터
   * @param {Function} onProgressUpdate 진행 단계별 콜백
   */
  async generateTripPlan(payload, onProgressUpdate = () => {}) {
    // 1. 클라이언트 측 사전 유효성 검사
    const validation = this.validateInputs(payload);
    if (!validation.isValid) {
      throw new Error(validation.message);
    }

    // 2. AbortController를 이용한 타임아웃 처리 (UX 필수 기준 3: 지연/타임아웃 대응)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, API_CONFIG.TIMEOUT_MS);

    // 진행 단계 시뮬레이션 인터벌
    let progressStep = 0;
    const progressInterval = setInterval(() => {
      progressStep++;
      if (progressStep === 1) {
        onProgressUpdate({ percent: 35, text: '목적지 인기 명소와 최신 날씨를 분석하는 중입니다...' });
      } else if (progressStep === 2) {
        onProgressUpdate({ percent: 70, text: '동행자 및 테마에 맞춘 최적 이동 동선을 설계하는 중입니다...' });
      } else if (progressStep === 3) {
        onProgressUpdate({ percent: 90, text: '시간대별 상세 일정과 예상 예산을 최종 계산하는 중입니다...' });
      }
    }, 1800);

    try {
      onProgressUpdate({ percent: 15, text: 'AI 컨시어지 엔진에 요청을 전달하는 중입니다...' });

      const response = await fetch(API_CONFIG.ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      clearInterval(progressInterval);

      // 3. HTTP 응답 코드 분석 (UX 필수 기준 2: API 4xx/5xx 오류 처리)
      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch (_) {
          errorData = null;
        }

        const extractErrorMessage = (data, defaultMsg) => {
          if (!data) return defaultMsg;
          if (typeof data.error === 'string') return data.error;
          if (data.error && typeof data.error === 'object') {
            return data.error.message || data.error.code || JSON.stringify(data.error);
          }
          if (typeof data.message === 'string') return data.message;
          return defaultMsg;
        };

        if (response.status === 400) {
          const msg = extractErrorMessage(errorData, '입력하신 요청 정보가 올바르지 않습니다. 확인 후 다시 시도해주세요.');
          throw new Error(`[입력 오류] ${msg}`);
        } else if (response.status === 429) {
          throw new Error('AI 서비스 사용량이 많아 호출 한도를 초과했습니다. 잠시 후 1~2분 뒤에 다시 시도해주세요.');
        } else if (response.status === 500 || response.status === 502) {
          const msg = extractErrorMessage(errorData, '서버 처리 중 일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
          throw new Error(`[서버 오류] ${msg}`);
        } else if (response.status === 404) {
          // 로컬 정적 서버 등에서 /api/generate 가 서빙되지 않는 환경일 때 스마트 Fallback 지원
          console.warn('/api/generate 엔드포인트를 찾을 수 없어 클라이언트 스마트 시뮬레이션으로 대체합니다.');
          return this.generateFallbackPlan(payload);
        } else {
          throw new Error(`요청 실패 (HTTP ${response.status}): 잠시 후 다시 시도해주세요.`);
        }
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || '일정을 생성할 수 없습니다.');
      }

      onProgressUpdate({ percent: 100, text: '맞춤형 여행 일정이 완성되었습니다!' });
      return result;

    } catch (error) {
      clearTimeout(timeoutId);
      clearInterval(progressInterval);

      // 타임아웃 감지
      if (error.name === 'AbortError') {
        throw new Error('서버 응답 시간이 초과되었습니다 (30초). 네트워크 연결 상태를 확인하시거나 잠시 후 다시 시도해주세요.');
      }

      // 네트워크 오프라인 / 연결 끊김 감지
      if (!navigator.onLine) {
        throw new Error('인터넷 연결이 오프라인 상태입니다. 네트워크 연결을 확인해주세요.');
      }

      // 만약 fetch 실패(TypeError: Failed to fetch)가 발생했고 로컬 파일/정적 서버 환경인 경우
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.warn('API 서버 연결 불가로 브라우저 내장 스마트 플래너로 즉시 생성합니다.');
        return this.generateFallbackPlan(payload);
      }

      throw error;
    }
  },

  /**
   * 로컬 단독 실행(file://)이나 정적 호스팅 등 백엔드가 미구동된 환경에서도
   * 끊김 없이 UI/UX 전체를 테스트할 수 있도록 제공하는 스마트 클라이언트 시뮬레이션
   */
  generateFallbackPlan(payload) {
    const validation = this.validateInputs(payload);
    if (!validation.isValid) {
      throw new Error(`[입력 오류] ${validation.message}`);
    }
    const themeStr = Array.isArray(payload.theme) ? payload.theme.join(', ') : payload.theme;
    return {
      success: true,
      is_mock: true,
      message: "현재 브라우저 오프라인/시뮬레이션 모드로 동작 중입니다. Vercel 배포 후 환경 변수(OPENAI_API_KEY)를 등록하시면 실시간 AI로 연동됩니다.",
      data: {
        title: `✨ ${payload.destination} ${payload.duration} 맞춤 여행 코스 (${payload.travelers})`,
        summary: `${payload.destination}(으)로 떠나는 맞춤형 여행입니다. ${themeStr} 테마를 중심으로 ${payload.budget} 예산에 최적화된 동선과 감성 스팟을 엄선했습니다.`,
        destination: payload.destination,
        duration: payload.duration,
        travelers: payload.travelers,
        theme: payload.theme,
        budget: payload.budget,
        days: [
          {
            day: 1,
            title: "설레는 첫걸음 & 대표 명소 탐방",
            schedule: [
              {
                time: "오전 (10:00 - 12:00)",
                place: `${payload.destination} 도착 및 대표 랜드마크`,
                activity: `${payload.destination} 주요 명소 산책 및 포토존에서 기념사진 촬영`,
                tip: "대중교통 또는 렌터카 이동 시 주차 공간을 사전 확인하세요."
              },
              {
                time: "점심 (12:30 - 14:00)",
                place: `${payload.destination} 로컬 시그니처 맛집`,
                activity: `현지인들이 추천하는 대표 먹거리와 제철 별미 즐기기`,
                tip: "웨이팅이 있을 수 있으니 테이블링/캐치테이블 현장 등록을 추천합니다."
              },
              {
                time: "오후 (14:30 - 17:30)",
                place: `감성 오션뷰/마운틴뷰 카페 & ${themeStr} 명소`,
                activity: "여유로운 커피 타임과 함께 현지 감성 골목 둘러보기",
                tip: "시그니처 음료와 디저트를 주문해보세요."
              },
              {
                time: "저녁 (18:00 - 20:30)",
                place: `${payload.destination} 야경 명소 및 감성 디너`,
                activity: "일몰 감상 후 분위기 좋은 식당에서 저녁 식사",
                tip: "일몰 30분 전 도착하여 노을을 감상하면 가장 아름답습니다."
              }
            ]
          },
          {
            day: 2,
            title: "자연과 힐링 & 완벽한 마무리",
            schedule: [
              {
                time: "오전 (09:30 - 11:30)",
                place: "피톤치드 숲길 or 해안 산책로",
                activity: "상쾌한 아침 공기를 마시며 힐링 산책",
                tip: "편안한 운동화 착용을 권장합니다."
              },
              {
                time: "점심 (12:00 - 13:30)",
                place: "든든한 향토 한식당",
                activity: "속 편하고 든든한 점심 식사",
                tip: "기념품/지역 특산물 구입도 함께 챙겨보세요."
              },
              {
                time: "오후 (14:00 - 16:30)",
                place: "지역 기념품 샵 & 복귀 준비",
                activity: "소품샵 투어 후 아쉬운 여행 마무리",
                tip: "교통편 시간 40분 전에는 역/터미널/공항으로 이동하세요."
              }
            ]
          }
        ],
        budget_breakdown: {
          transport: "약 30% (교통비/주유/대중교통)",
          food: "약 40% (맛집 탐방 및 감성 카페)",
          accommodation: "약 20% (가성비 및 분위기 숙소)",
          etc: "약 10% (입장료, 체험비 및 기념품)"
        },
        packing_checklist: [
          "신분증 및 결제 카드",
          "보조배터리 및 휴대폰 충전기",
          "날씨에 맞는 여벌 옷 및 편한 신발",
          "상비약 (소화제, 두통약, 밴드)",
          "카메라 또는 스마트폰 여유 용량"
        ],
        ai_advice: `${payload.travelers} 여행 스타일에 맞춰 무리한 이동을 줄이고 만족도를 극대화했습니다. ${payload.notes ? `요청사항(${payload.notes})이 반영되었습니다.` : '현지 기상 상황을 미리 확인하세요.'}`
      }
    };
  }
};

window.ApiService = ApiService;
