// 다크/라이트 모드 토글
let currentTheme = 'light';

// 테마 초기화
function initTheme() {
    // localStorage에서 저장된 테마 가져오기
    const savedTheme = localStorage.getItem('theme');
    
    // 시스템 설정 확인
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    // 저장된 테마가 있으면 사용, 없으면 시스템 설정 사용
    currentTheme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    applyTheme(currentTheme);
    updateThemeButton();
}

// 테마 적용
function applyTheme(theme) {
    const html = document.documentElement;
    
    if (theme === 'dark') {
        html.setAttribute('data-theme', 'dark');
    } else {
        html.setAttribute('data-theme', 'light');
    }
    
    // localStorage에 저장
    localStorage.setItem('theme', theme);
    currentTheme = theme;
}

// 테마 토글
function toggleTheme() {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
    updateThemeButton();
    
    // Giscus 테마도 업데이트
    updateGiscusTheme(newTheme);
}

// 테마 버튼 텍스트 업데이트
function updateThemeButton() {
    const button = document.getElementById('theme-toggle');
    if (button) {
        button.textContent = currentTheme === 'dark' ? '☀️ 라이트 모드' : '🌙 다크 모드';
    }
}

// Giscus 테마 업데이트
function updateGiscusTheme(theme) {
    const giscusFrame = document.querySelector('iframe[src*="giscus"]');
    if (giscusFrame && giscusFrame.contentWindow) {
        giscusFrame.contentWindow.postMessage(
            {
                giscus: {
                    setConfig: {
                        theme: theme === 'dark' ? 'dark' : 'light'
                    }
                }
            },
            'https://giscus.app'
        );
    }
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }
});

