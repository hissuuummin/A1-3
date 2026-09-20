/**
 * TripSpark - Main Application Controller (Vanilla JS)
 * UI 이벤트 바인딩, 폼 제출, AI 결과 렌더링, 테마 전환 및 모달 제어
 */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements Cache
  const form = document.getElementById('travelForm');
  const destinationInput = document.getElementById('destinationInput');
  const submitBtn = document.getElementById('submitBtn');
  const resetBtn = document.getElementById('resetBtn');
  const submitBtnText = submitBtn.querySelector('.btn-text');
  const submitBtnSpinner = submitBtn.querySelector('.btn-spinner');

  const alertContainer = document.getElementById('alertContainer');
  const alertBox = document.getElementById('alertBox');
  const alertTitle = document.getElementById('alertTitle');
  const alertMessage = document.getElementById('alertMessage');
  const alertCloseBtn = document.getElementById('alertCloseBtn');

  const loadingContainer = document.getElementById('loadingContainer');
  const loadingProgressText = document.getElementById('loadingProgressText');
  const progressBar = document.getElementById('progressBar');
  const loadingDelayHint = document.getElementById('loadingDelayHint');

  const resultContainer = document.getElementById('resultContainer');
  const mockBanner = document.getElementById('mockBanner');
  const mockBannerText = document.getElementById('mockBannerText');
  const resultTitle = document.getElementById('resultTitle');
  const resultSummary = document.getElementById('resultSummary');
  const resultDestTag = document.getElementById('resultDestTag');
  const resultDurationTag = document.getElementById('resultDurationTag');
  const resultTravelersTag = document.getElementById('resultTravelersTag');
  const resultBudgetTag = document.getElementById('resultBudgetTag');
  const timelineContainer = document.getElementById('timelineContainer');
  const budgetList = document.getElementById('budgetList');
  const checklistItems = document.getElementById('checklistItems');
  const adviceText = document.getElementById('adviceText');

  const copyResultBtn = document.getElementById('copyResultBtn');
  const saveResultBtn = document.getElementById('saveResultBtn');
  const printResultBtn = document.getElementById('printResultBtn');
  const regenerateBtn = document.getElementById('regenerateBtn');

  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const themeIcon = document.getElementById('themeIcon');
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  const savedPlansBtn = document.getElementById('savedPlansBtn');
  const savedCountBadge = document.getElementById('savedCountBadge');
  const savedModal = document.getElementById('savedModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const savedPlansList = document.getElementById('savedPlansList');
  const toastContainer = document.getElementById('toastContainer');

  let currentPlanData = null;
  let delayTimer = null;

  /* ==========================================================================
     1. Theme Management (다크 / 라이트 모드)
     ========================================================================== */
  function initTheme() {
    const savedTheme = window.StorageManager.getTheme();
    applyTheme(savedTheme);
  }

  function applyTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
      themeIcon.textContent = '☀️';
      themeToggleBtn.setAttribute('title', '라이트 모드로 전환');
    } else {
      document.body.classList.remove('dark-theme');
      themeIcon.textContent = '🌙';
      themeToggleBtn.setAttribute('title', '다크 모드로 전환');
    }
    window.StorageManager.setTheme(theme);
  }

  themeToggleBtn.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark-theme');
    applyTheme(isDark ? 'light' : 'dark');
    showToast(isDark ? '☀️ 라이트 모드로 전환되었습니다.' : '🌙 다크 모드로 전환되었습니다.');
  });

  /* ==========================================================================
     2. Navigation & Mobile Menu
     ========================================================================== */
  mobileMenuBtn.addEventListener('click', () => {
    navMenu.classList.toggle('open');
  });

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('open');
    });
  });

  // Active Nav Link on Scroll
  window.addEventListener('scroll', () => {
    const sections = document.querySelectorAll('section');
    const scrollPos = window.scrollY + 100;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      if (scrollPos >= top && scrollPos < top + height) {
        navLinks.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  });

  /* ==========================================================================
     3. Quick Chips & Preset Helpers
     ========================================================================== */
  // 여행지 추천 칩 클릭
  document.querySelectorAll('.chip-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      destinationInput.value = btn.dataset.dest;
      destinationInput.focus();
      hideAlert();
    });
  });

  // 추천 코스 카드 프리셋 적용 버튼
  document.querySelectorAll('.apply-preset-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const { dest, duration, travelers, theme, budget, notes } = btn.dataset;
      
      // 폼 값 채우기
      destinationInput.value = dest;
      
      const durationRadio = form.querySelector(`input[name="duration"][value="${duration}"]`);
      if (durationRadio) durationRadio.checked = true;

      const travelersRadio = form.querySelector(`input[name="travelers"][value="${travelers}"]`);
      if (travelersRadio) travelersRadio.checked = true;

      const budgetSelect = document.getElementById('budgetSelect');
      if (budgetSelect) budgetSelect.value = budget;

      const notesInput = document.getElementById('notesInput');
      if (notesInput) notesInput.value = notes || '';

      // 테마 체크박스 세팅
      if (theme) {
        const themeList = theme.split(',');
        form.querySelectorAll('input[name="theme"]').forEach(cb => {
          cb.checked = themeList.includes(cb.value);
        });
      }

      // 플래너 섹션으로 스크롤 이동
      document.getElementById('planner').scrollIntoView({ behavior: 'smooth' });
      showToast(`'${dest}' 추천 코스 조건이 적용되었습니다. '일정 생성'을 눌러보세요!`);
    });
  });

  /* ==========================================================================
     4. Alert & Feedback System
     ========================================================================== */
  function showAlert(type, title, message) {
    alertBox.className = `alert-box alert-${type}`;
    alertTitle.textContent = title;
    alertMessage.textContent = message;
    alertContainer.style.display = 'block';
    alertContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideAlert() {
    alertContainer.style.display = 'none';
  }

  alertCloseBtn.addEventListener('click', hideAlert);

  /* ==========================================================================
     5. Form Submission & AI Workflow
     ========================================================================== */
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    // 폼 데이터 수집
    const destination = destinationInput.value.trim();
    const duration = form.querySelector('input[name="duration"]:checked')?.value || '1박 2일';
    const travelers = form.querySelector('input[name="travelers"]:checked')?.value || '친구들과 함께';
    const checkedThemes = Array.from(form.querySelectorAll('input[name="theme"]:checked')).map(cb => cb.value);
    const budget = document.getElementById('budgetSelect').value;
    const notes = document.getElementById('notesInput').value.trim();

    const payload = {
      destination,
      duration,
      travelers,
      theme: checkedThemes.length > 0 ? checkedThemes : ['힐링/자연', '맛집 투어'],
      budget,
      notes
    };

    // 1. 필수값 사전 검증 (실패 처리 요구사항 #1: 빈 입력/필수값 누락)
    const validation = window.ApiService.validateInputs(payload);
    if (!validation.isValid) {
      showAlert('error', '필수 입력값 누락', validation.message);
      destinationInput.focus();
      return;
    }

    // 2. UI 로딩 상태 진입
    setLoadingState(true);

    try {
      // 3. API 호출 및 진행 상태 업데이트
      const response = await window.ApiService.generateTripPlan(payload, (progress) => {
        progressBar.style.width = `${progress.percent}%`;
        loadingProgressText.textContent = progress.text;
      });

      // 4. 결과 렌더링
      currentPlanData = response.data;
      renderResult(response.data, response.is_mock, response.message);
      
      // 결과 영역으로 스무스 스크롤
      resultContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
      showToast('🎉 AI 맞춤 여행 일정이 성공적으로 생성되었습니다!');

    } catch (error) {
      console.error('Plan generation failed:', error);
      // 실패 처리 요구사항 #2 & #3 (API 오류 4xx/5xx, 지연/타임아웃 안내)
      showAlert('error', '일정 생성 실패 안내', error.message);
    } finally {
      setLoadingState(false);
    }
  });

  // 로딩 상태 토글
  function setLoadingState(isLoading) {
    if (isLoading) {
      submitBtn.disabled = true;
      submitBtnText.style.display = 'none';
      submitBtnSpinner.style.display = 'inline-block';
      loadingContainer.style.display = 'block';
      resultContainer.style.display = 'none';
      progressBar.style.width = '10%';
      loadingProgressText.textContent = '여행지 분석을 준비하는 중입니다...';
      loadingDelayHint.style.display = 'none';

      // 4초 이상 소요 시 지연 안내 메시지 표시 (지연 안내 UX)
      delayTimer = setTimeout(() => {
        loadingDelayHint.style.display = 'inline-block';
      }, 4000);
    } else {
      submitBtn.disabled = false;
      submitBtnText.style.display = 'inline-block';
      submitBtnSpinner.style.display = 'none';
      loadingContainer.style.display = 'none';
      clearTimeout(delayTimer);
    }
  }

  // 초기화 버튼
  resetBtn.addEventListener('click', () => {
    form.reset();
    hideAlert();
    resultContainer.style.display = 'none';
    destinationInput.focus();
    showToast('입력 폼이 초기화되었습니다.');
  });

  /* ==========================================================================
     6. Result Rendering
     ========================================================================== */
  function renderResult(data, isMock = false, mockMessage = '') {
    // 배너 제어
    if (isMock) {
      mockBanner.style.display = 'flex';
      if (mockMessage) mockBannerText.textContent = mockMessage;
    } else {
      mockBanner.style.display = 'none';
    }

    // 헤더 및 태그
    resultDestTag.textContent = `📍 ${data.destination}`;
    resultDurationTag.textContent = `🗓️ ${data.duration}`;
    resultTravelersTag.textContent = `👥 ${data.travelers}`;
    resultBudgetTag.textContent = `💰 ${data.budget.split(' ')[1] || data.budget}`;
    
    resultTitle.textContent = data.title;
    resultSummary.textContent = data.summary;

    // 타임라인 (Day별 일정)
    timelineContainer.innerHTML = '';
    if (data.days && Array.isArray(data.days)) {
      data.days.forEach(dayInfo => {
        const dayBlock = document.createElement('div');
        dayBlock.className = 'day-block';

        let scheduleHtml = '';
        if (dayInfo.schedule && Array.isArray(dayInfo.schedule)) {
          dayInfo.schedule.forEach(item => {
            scheduleHtml += `
              <div class="schedule-item">
                <div class="time-slot">${item.time}</div>
                <div class="schedule-body">
                  <div class="place-name">${item.place}</div>
                  <div class="activity-desc">${item.activity}</div>
                  ${item.tip ? `<div class="tip-box">💡 ${item.tip}</div>` : ''}
                </div>
              </div>
            `;
          });
        }

        dayBlock.innerHTML = `
          <div class="day-header">
            <div class="day-title-wrap">
              <span class="day-badge">Day ${dayInfo.day}</span>
              <h4 class="day-title">${dayInfo.title}</h4>
            </div>
          </div>
          <div class="schedule-list">
            ${scheduleHtml}
          </div>
        `;
        timelineContainer.appendChild(dayBlock);
      });
    }

    // 예산 분배 리스트
    budgetList.innerHTML = '';
    if (data.budget_breakdown) {
      const categories = [
        { key: 'transport', label: '🚗 교통비' },
        { key: 'food', label: '🍽️ 식음료 및 맛집' },
        { key: 'accommodation', label: '🏨 숙박비' },
        { key: 'etc', label: '🎟️ 체험 및 기타' }
      ];

      categories.forEach(cat => {
        if (data.budget_breakdown[cat.key]) {
          const item = document.createElement('div');
          item.className = 'budget-item';
          item.innerHTML = `
            <span class="budget-category">${cat.label}</span>
            <span class="budget-value">${data.budget_breakdown[cat.key]}</span>
          `;
          budgetList.appendChild(item);
        }
      });
    }

    // 준비물 체크리스트
    checklistItems.innerHTML = '';
    if (data.packing_checklist && Array.isArray(data.packing_checklist)) {
      data.packing_checklist.forEach((item, index) => {
        const li = document.createElement('li');
        li.className = 'checklist-item';
        li.innerHTML = `
          <input type="checkbox" id="check_${index}">
          <label for="check_${index}">${item}</label>
        `;
        li.querySelector('input').addEventListener('change', (e) => {
          li.classList.toggle('checked', e.target.checked);
        });
        checklistItems.appendChild(li);
      });
    }

    // AI 특별 조언
    adviceText.textContent = data.ai_advice || '즐겁고 안전한 여행 되시길 바랍니다!';

    resultContainer.style.display = 'block';
  }

  /* ==========================================================================
     7. Result Action Buttons (복사, 저장, 인쇄, 재시도)
     ========================================================================== */
  // 1. 전체 일정 텍스트 복사
  copyResultBtn.addEventListener('click', () => {
    if (!currentPlanData) return;

    let text = `[TripSpark AI 여행 계획]\n`;
    text += `📌 ${currentPlanData.title}\n`;
    text += `📍 목적지: ${currentPlanData.destination} | 🗓️ 기간: ${currentPlanData.duration}\n`;
    text += `👥 동행: ${currentPlanData.travelers} | 💰 예산: ${currentPlanData.budget}\n\n`;
    text += `"${currentPlanData.summary}"\n\n`;

    if (currentPlanData.days) {
      currentPlanData.days.forEach(d => {
        text += `=== [Day ${d.day}: ${d.title}] ===\n`;
        d.schedule.forEach(s => {
          text += `- ${s.time} : ${s.place} (${s.activity})\n  * 팁: ${s.tip || '안전 유의'}\n`;
        });
        text += `\n`;
      });
    }

    if (currentPlanData.ai_advice) {
      text += `💡 AI 조언: ${currentPlanData.ai_advice}\n`;
    }

    navigator.clipboard.writeText(text).then(() => {
      showToast('📋 전체 일정이 클립보드에 복사되었습니다. 메모장이나 메신저에 붙여넣으세요!');
    }).catch(() => {
      showToast('클립보드 복사에 실패했습니다.');
    });
  });

  // 2. 내 보관함에 저장 (LocalStorage)
  saveResultBtn.addEventListener('click', () => {
    if (!currentPlanData) return;
    const res = window.StorageManager.savePlan(currentPlanData);
    if (res.success) {
      updateSavedBadge();
      showToast('💾 일정이 내 보관함에 저장되었습니다!');
    } else {
      showToast('저장 중 오류가 발생했습니다.');
    }
  });

  // 3. 인쇄 / PDF 저장
  printResultBtn.addEventListener('click', () => {
    window.print();
  });

  // 4. 다른 일정 생성하기
  regenerateBtn.addEventListener('click', () => {
    document.getElementById('planner').scrollIntoView({ behavior: 'smooth' });
    destinationInput.focus();
    destinationInput.select();
  });

  /* ==========================================================================
     8. Saved Plans Modal Management
     ========================================================================== */
  function updateSavedBadge() {
    const plans = window.StorageManager.getSavedPlans();
    savedCountBadge.textContent = plans.length;
    savedCountBadge.style.display = plans.length > 0 ? 'flex' : 'none';
  }

  savedPlansBtn.addEventListener('click', () => {
    renderSavedPlansList();
    savedModal.style.display = 'flex';
  });

  modalCloseBtn.addEventListener('click', () => {
    savedModal.style.display = 'none';
  });

  savedModal.addEventListener('click', (e) => {
    if (e.target === savedModal) {
      savedModal.style.display = 'none';
    }
  });

  function renderSavedPlansList() {
    const plans = window.StorageManager.getSavedPlans();
    if (plans.length === 0) {
      savedPlansList.innerHTML = `
        <div class="empty-state">
          <p>아직 저장된 여행 플랜이 없습니다.</p>
          <p class="empty-sub">AI 플래너에서 일정을 만든 후 '내 보관함에 저장'을 눌러보세요!</p>
        </div>
      `;
      return;
    }

    savedPlansList.innerHTML = '';
    plans.forEach(plan => {
      const item = document.createElement('div');
      item.className = 'saved-plan-item';
      item.innerHTML = `
        <div class="saved-plan-info">
          <h5>${plan.title}</h5>
          <div class="saved-plan-date">저장일: ${plan.savedAt}</div>
        </div>
        <div class="saved-plan-actions">
          <button type="button" class="btn btn-outline load-plan-btn" data-id="${plan.id}">불러오기</button>
          <button type="button" class="btn btn-outline del-plan-btn" data-id="${plan.id}" title="삭제">🗑️</button>
        </div>
      `;

      // 불러오기
      item.querySelector('.load-plan-btn').addEventListener('click', () => {
        currentPlanData = plan.data;
        renderResult(plan.data, false);
        savedModal.style.display = 'none';
        resultContainer.scrollIntoView({ behavior: 'smooth' });
        showToast(`'${plan.destination}' 일정을 불러왔습니다.`);
      });

      // 삭제
      item.querySelector('.del-plan-btn').addEventListener('click', () => {
        window.StorageManager.deletePlan(plan.id);
        updateSavedBadge();
        renderSavedPlansList();
        showToast('플랜이 보관함에서 삭제되었습니다.');
      });

      savedPlansList.appendChild(item);
    });
  }

  /* ==========================================================================
     9. FAQ Accordion
     ========================================================================== */
  document.querySelectorAll('.accordion-header').forEach(header => {
    header.addEventListener('click', () => {
      const item = header.parentElement;
      const isActive = item.classList.contains('active');

      // 다른 아이템 닫기
      document.querySelectorAll('.accordion-item').forEach(other => {
        if (other !== item) other.classList.remove('active');
      });

      item.classList.toggle('active', !isActive);
      header.setAttribute('aria-expanded', !isActive);
    });
  });

  /* ==========================================================================
     10. Toast Notification System
     ========================================================================== */
  function showToast(message, duration = 3000) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  /* ==========================================================================
     Init App
     ========================================================================== */
  initTheme();
  updateSavedBadge();
});
