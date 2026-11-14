/**
 * 업무 말투 변환기 (BizTalk) — 클라이언트 애플리케이션 로직
 */

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const targetButtons = document.querySelectorAll(".target-btn");
  const inputText = document.getElementById("inputText");
  const charCount = document.getElementById("charCount");
  const clearBtn = document.getElementById("clearBtn");
  const convertBtn = document.getElementById("convertBtn");
  const btnSpinner = document.getElementById("btnSpinner");
  const btnText = document.getElementById("btnText");
  const outputPlaceholder = document.getElementById("outputPlaceholder");
  const outputText = document.getElementById("outputText");
  const resultTargetBadge = document.getElementById("resultTargetBadge");
  const copyBtn = document.getElementById("copyBtn");
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toastMessage");

  // State
  let currentTarget = "boss";
  let isConverting = false;
  let toastTimer = null;

  const TARGET_LABELS = {
    boss: "상사 / 임원 톤",
    colleague: "타팀 동료 톤",
    client: "고객 / 외부 톤",
    team: "팀 내 동료 톤",
  };

  /* ==========================================================================
     1. 수신 대상(Target) 선택 인터랙션
     ========================================================================== */
  targetButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      if (isConverting) return;

      targetButtons.forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-checked", "false");
      });

      btn.classList.add("active");
      btn.setAttribute("aria-checked", "true");
      currentTarget = btn.dataset.target;
      resultTargetBadge.textContent = TARGET_LABELS[currentTarget] || "비즈니스 톤";
    });
  });

  /* ==========================================================================
     2. 글자 수 카운터 & 입력 지우기
     ========================================================================== */
  function updateCharCount() {
    const len = inputText.value.length;
    charCount.textContent = `${len.toLocaleString()}자`;
  }

  inputText.addEventListener("input", updateCharCount);

  clearBtn.addEventListener("click", () => {
    if (isConverting) return;
    inputText.value = "";
    updateCharCount();
    inputText.focus();
  });

  // 단축키: Ctrl + Enter 또는 Cmd + Enter 시 바로 변환 실행
  inputText.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      convertTone();
    }
  });

  /* ==========================================================================
     3. 로딩 상태 관리
     ========================================================================== */
  function setLoading(loading) {
    isConverting = loading;
    if (loading) {
      convertBtn.classList.add("loading");
      convertBtn.disabled = true;
      clearBtn.disabled = true;
      btnSpinner.style.display = "inline-block";
      btnText.textContent = "변환 중...";
    } else {
      convertBtn.classList.remove("loading");
      convertBtn.disabled = false;
      clearBtn.disabled = false;
      btnSpinner.style.display = "none";
      btnText.textContent = "비즈니스 말투로 변환하기 ✨";
    }
  }

  /* ==========================================================================
     4. 말투 변환 API 호출 (POST /api/convert)
     ========================================================================== */
  async function convertTone() {
    const text = inputText.value.trim();

    if (!text) {
      showToast("⚠️ 변환할 원문 내용을 입력해 주세요.");
      inputText.focus();
      return;
    }

    if (!currentTarget) {
      showToast("⚠️ 메시지를 받을 상대를 선택해 주세요.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/convert", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: text,
          target_audience: currentTarget,
        }),
      });

      if (!response.ok) {
        let errorDetail = "말투 변환 요청에 실패했습니다.";
        try {
          const errData = await response.json();
          if (errData.detail) errorDetail = errData.detail;
        } catch (_) {}
        throw new Error(errorDetail);
      }

      const data = await response.json();

      // 결과 렌더링
      outputPlaceholder.classList.add("hidden");
      outputText.classList.remove("hidden");
      outputText.value = data.converted_text;
      resultTargetBadge.textContent = TARGET_LABELS[data.target_audience] || "비즈니스 톤";
      copyBtn.disabled = false;

      showToast("✨ 비즈니스 말투로 변환되었습니다!");
    } catch (error) {
      console.error("Convert error:", error);
      showToast(`❌ 오류: ${error.message || "잠시 후 다시 시도해 주세요."}`);
    } finally {
      setLoading(false);
    }
  }

  convertBtn.addEventListener("click", convertTone);

  /* ==========================================================================
     5. 결과 클립보드 복사
     ========================================================================== */
  async function copyToClipboard() {
    const textToCopy = outputText.value;
    if (!textToCopy) return;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for non-HTTPS / older environments
        outputText.select();
        document.execCommand("copy");
      }
      showToast("📋 클립보드에 복사되었습니다!");
    } catch (err) {
      console.error("Copy failed:", err);
      showToast("❌ 복사에 실패했습니다. 직접 복사해 주세요.");
    }
  }

  copyBtn.addEventListener("click", copyToClipboard);

  /* ==========================================================================
     6. 토스트 알림 헬퍼
     ========================================================================== */
  function showToast(message) {
    if (toastTimer) {
      clearTimeout(toastTimer);
    }
    toastMessage.textContent = message;
    toast.classList.add("show");

    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, 2800);
  }

  // 초기 글자 수 카운터 반영
  updateCharCount();
});
