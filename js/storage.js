/**
 * TripSpark - LocalStorage Manager (보너스 과제: 데이터 저장 및 테마 유지)
 */

const STORAGE_KEYS = {
  THEME: 'tripspark_theme',
  SAVED_PLANS: 'tripspark_saved_plans'
};

const StorageManager = {
  /**
   * 테마 설정 가져오기 ('light' | 'dark')
   */
  getTheme() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (saved) return saved;
      // 시스템 선호 테마 확인
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
      return 'light';
    } catch (e) {
      console.warn('LocalStorage access denied for theme', e);
      return 'light';
    }
  },

  /**
   * 테마 설정 저장
   */
  setTheme(theme) {
    try {
      localStorage.setItem(STORAGE_KEYS.THEME, theme);
    } catch (e) {
      console.warn('LocalStorage save failed for theme', e);
    }
  },

  /**
   * 저장된 여행 플랜 목록 조회
   */
  getSavedPlans() {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.SAVED_PLANS);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      console.warn('LocalStorage load failed for saved plans', e);
      return [];
    }
  },

  /**
   * 여행 플랜 저장 (최대 5개까지 보관)
   */
  savePlan(plan) {
    try {
      const plans = this.getSavedPlans();
      const newEntry = {
        id: 'plan_' + Date.now(),
        savedAt: new Date().toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        title: plan.title || `${plan.destination} 여행 플랜`,
        destination: plan.destination,
        duration: plan.duration,
        data: plan
      };

      // 중복 체크(동일 제목이 있으면 최신화)
      const filtered = plans.filter(p => p.title !== newEntry.title);
      filtered.unshift(newEntry);

      // 최대 5개 유지
      if (filtered.length > 5) {
        filtered.pop();
      }

      localStorage.setItem(STORAGE_KEYS.SAVED_PLANS, JSON.stringify(filtered));
      return { success: true, count: filtered.length };
    } catch (e) {
      console.warn('LocalStorage save failed', e);
      return { success: false, error: e.message };
    }
  },

  /**
   * 특정 여행 플랜 삭제
   */
  deletePlan(planId) {
    try {
      const plans = this.getSavedPlans();
      const updated = plans.filter(p => p.id !== planId);
      localStorage.setItem(STORAGE_KEYS.SAVED_PLANS, JSON.stringify(updated));
      return { success: true, count: updated.length };
    } catch (e) {
      console.warn('LocalStorage delete failed', e);
      return { success: false };
    }
  }
};

window.StorageManager = StorageManager;
