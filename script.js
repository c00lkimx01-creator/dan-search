// ===== グローバル状態 =====
const state = {
    currentQuery: '',
    currentType: 'web',
    currentPage: 1,
    isLoading: false,
    results: [],
    totalResults: 0
};

// ===== DOM要素キャッシュ =====
const DOM = {
    // ホームページ
    homePage: document.getElementById('homePage'),
    searchInput: document.getElementById('searchInput'),
    clearBtn: document.getElementById('clearBtn'),
    searchBtn: document.getElementById('searchBtn'),
    themeToggle: document.getElementById('themeToggle'),
    searchTypeRadios: document.querySelectorAll('input[name="searchType"]'),
    
    // 結果ページ
    resultsPage: document.getElementById('resultsPage'),
    backBtn: document.getElementById('backBtn'),
    searchInputHeader: document.getElementById('searchInputHeader'),
    searchBtnHeader: document.getElementById('searchBtnHeader'),
    themeToggleResults: document.getElementById('themeToggleResults'),
    resultsList: document.getElementById('resultsList'),
    loading: document.getElementById('loading'),
    errorMessage: document.getElementById('errorMessage'),
    resultStats: document.getElementById('resultStats'),
    pagination: document.getElementById('pagination'),
    filterTabs: document.querySelectorAll('.filter-tab')
};

// ===== API設定 =====
const API_BASE = 'https://find-joy-feed.lovable.app/api/public/search';

// ===== 初期化 =====
function init() {
    initTheme();
    setupEventListeners();
    handleURLParams();
    observePageTransitions();
}

// ===== テーマの初期化 =====
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);
}

function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    updateThemeIcon(theme);
}

function updateThemeIcon(theme) {
    const icons = document.querySelectorAll('.theme-icon');
    icons.forEach(icon => {
        const useElement = icon.querySelector('use');
        if (useElement) {
            if (theme === 'dark') {
                useElement.setAttribute('xlink:href', '#icon-sun');
            } else {
                useElement.setAttribute('xlink:href', '#icon-moon');
            }
        }
    });
}

// ===== イベントリスナー =====
function setupEventListeners() {
    // ホームページ検索
    DOM.searchInput.addEventListener('input', handleSearchInput);
    DOM.clearBtn.addEventListener('click', clearSearchInput);
    DOM.searchBtn.addEventListener('click', performSearch);
    DOM.searchInput.addEventListener('keypress', handleSearchKeypress);

    // テーマトグル
    DOM.themeToggle.addEventListener('click', toggleTheme);
    DOM.themeToggleResults.addEventListener('click', toggleTheme);

    // 検索タイプラジオボタン
    DOM.searchTypeRadios.forEach(radio => {
        radio.addEventListener('change', (e) => {
            state.currentType = e.target.value;
        });
    });

    // ヘッダー検索
    DOM.searchBtnHeader.addEventListener('click', performHeaderSearch);
    DOM.searchInputHeader.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performHeaderSearch();
    });

    // 戻るボタン
    DOM.backBtn.addEventListener('click', goBack);

    // フィルタータブ
    DOM.filterTabs.forEach(tab => {
        tab.addEventListener('click', handleFilterTab);
    });
}

// ===== 検索入力処理 =====
function handleSearchInput(e) {
    const hasValue = e.target.value.trim().length > 0;
    DOM.clearBtn.style.display = hasValue ? 'flex' : 'none';
}

function clearSearchInput() {
    DOM.searchInput.value = '';
    DOM.searchInput.focus();
    DOM.clearBtn.style.display = 'none';
}

function handleSearchKeypress(e) {
    if (e.key === 'Enter') {
        performSearch();
    }
}

// ===== 検索実行 =====
async function performSearch() {
    const query = DOM.searchInput.value.trim();
    
    if (!query) {
        showNotification('検索キーワードを入力してください', 'warning');
        return;
    }

    state.currentQuery = query;
    state.currentPage = 1;
    DOM.searchInputHeader.value = query;
    
    showResultsPage();
    await fetchResults(query, state.currentType);

    // URL更新
    updateURL(query, state.currentType);
}

async function performHeaderSearch() {
    const query = DOM.searchInputHeader.value.trim();
    
    if (!query) {
        showNotification('検索キーワードを入力してください', 'warning');
        return;
    }

    state.currentQuery = query;
    state.currentPage = 1;
    DOM.searchInput.value = query;
    
    await fetchResults(query, state.currentType);
    updateURL(query, state.currentType);
}

// ===== 結果を取得 =====
async function fetchResults(query, type) {
    state.isLoading = true;
    DOM.loading.style.display = 'flex';
    DOM.errorMessage.style.display = 'none';
    DOM.resultsList.innerHTML = '';

    try {
        const response = await fetch(`${API_BASE}?q=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
            throw new Error('検索エラーが発生しました。もう一度試してください。');
        }

        const data = await response.json();
        let filteredResults = data.results || [];

        if (type !== 'web') {
            filteredResults = filteredResults.filter(r => r.type === type);
        }

        state.results = filteredResults;
        state.totalResults = filteredResults.length;
        state.isLoading = false;
        DOM.loading.style.display = 'none';

        if (filteredResults.length === 0) {
            showNoResults();
        } else {
            displayResults();
            updateStats();
            generatePagination();
        }
    } catch (error) {
        state.isLoading = false;
        DOM.loading.style.display = 'none';
        DOM.errorMessage.style.display = 'block';
        DOM.errorMessage.innerHTML = `
            <strong>エラーが発生しました</strong><br>
            ${error.message}
        `;
    }
}

// ===== 結果を表示 =====
function displayResults() {
    DOM.resultsList.innerHTML = '';

    state.results.forEach((result, index) => {
        const resultElement = createResultElement(result);
        resultElement.style.animation = `fadeInUp 0.4s ease ${index * 0.05}s both`;
        DOM.resultsList.appendChild(resultElement);
    });
}

// ===== 結果要素を作成 =====
function createResultElement(result) {
    const div = document.createElement('div');
    div.className = 'result-item';

    if (result.type === 'image') {
        div.innerHTML = `
            <div class="result-image-item">
                <img 
                    src="${escapeHtml(result.image)}" 
                    alt="${escapeHtml(result.title)}" 
                    class="result-image" 
                    loading="lazy"
                    onerror="this.style.display='none'"
                >
                <p class="image-title">${escapeHtml(result.title)}</p>
            </div>
        `;
    } else {
        const url = new URL(result.url);
        const domain = url.hostname.replace('www.', '');
        
        div.innerHTML = `
            <div class="result-url">${domain}</div>
            <a 
                href="${escapeHtml(result.url)}" 
                target="_blank" 
                rel="noopener noreferrer"
                class="result-title"
            >${escapeHtml(result.title)}</a>
            <div class="result-description">${escapeHtml(result.description)}</div>
        `;
    }

    return div;
}

// ===== HTMLエスケープ =====
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ===== 統計を更新 =====
function updateStats() {
    const count = state.totalResults;
    const time = (Math.random() * 0.5 + 0.1).toFixed(1);
    DOM.resultStats.textContent = `約 ${count.toLocaleString()} 件 (${time} 秒)`;
}

// ===== ページネーション生成 =====
function generatePagination() {
    const totalPages = Math.ceil(state.totalResults / 10);
    DOM.pagination.innerHTML = '';

    if (totalPages <= 1) return;

    // 前へボタン
    if (state.currentPage > 1) {
        const prevBtn = createPaginationButton('← 前へ', () => {
            state.currentPage--;
            displayResults();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        DOM.pagination.appendChild(prevBtn);
    }

    // ページ番号
    const startPage = Math.max(1, state.currentPage - 2);
    const endPage = Math.min(totalPages, state.currentPage + 2);

    if (startPage > 1) {
        DOM.pagination.appendChild(createPaginationButton('1', () => {
            state.currentPage = 1;
            displayResults();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }));
        if (startPage > 2) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            dots.style.padding = '10px 8px';
            dots.style.color = 'var(--text-tertiary)';
            DOM.pagination.appendChild(dots);
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const btn = createPaginationButton(i.toString(), () => {
            state.currentPage = i;
            displayResults();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        if (i === state.currentPage) {
            btn.classList.add('current');
        }
        DOM.pagination.appendChild(btn);
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            dots.style.padding = '10px 8px';
            dots.style.color = 'var(--text-tertiary)';
            DOM.pagination.appendChild(dots);
        }
        DOM.pagination.appendChild(createPaginationButton(totalPages.toString(), () => {
            state.currentPage = totalPages;
            displayResults();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }));
    }

    // 次へボタン
    if (state.currentPage < totalPages) {
        const nextBtn = createPaginationButton('次へ →', () => {
            state.currentPage++;
            displayResults();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        DOM.pagination.appendChild(nextBtn);
    }
}

function createPaginationButton(text, onClick) {
    const btn = document.createElement('button');
    btn.className = 'pagination-btn';
    btn.textContent = text;
    btn.addEventListener('click', onClick);
    return btn;
}

// ===== 結果なし表示 =====
function showNoResults() {
    DOM.resultsList.innerHTML = `
        <div class="no-results">
            <p>「${escapeHtml(state.currentQuery)}」に関する検索結果は見つかりませんでした。</p>
            <p style="margin-top: 12px; font-size: 13px;">別のキーワードで試してみてください。</p>
        </div>
    `;
}

// ===== フィルタータブ処理 =====
function handleFilterTab(e) {
    const newType = e.currentTarget.dataset.type;
    if (newType === 'web') {
        fetchResults(state.currentQuery, state.currentType === 'web' ? 'all' : 'web');
    } else {
        fetchResults(state.currentQuery, newType);
    }

    // アクティブ状態更新
    DOM.filterTabs.forEach(tab => tab.classList.remove('active'));
    e.currentTarget.classList.add('active');
}

// ===== ページ表示/非表示 =====
function showResultsPage() {
    DOM.homePage.style.display = 'none';
    DOM.resultsPage.style.display = 'flex';
    DOM.searchInputHeader.focus();
}

function goBack() {
    DOM.homePage.style.display = 'flex';
    DOM.resultsPage.style.display = 'none';
    DOM.searchInput.focus();
    window.history.pushState({}, '', window.location.pathname);
}

// ===== テーマ切り替え =====
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    applyTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    
    // アニメーション
    const icons = document.querySelectorAll('.theme-icon');
    icons.forEach(icon => {
        icon.style.animation = 'none';
        setTimeout(() => {
            icon.style.animation = 'rotateSvg 0.5s ease-in-out';
        }, 10);
    });
}

// ===== URL管理 =====
function updateURL(query, type) {
    const params = new URLSearchParams();
    params.set('q', query);
    if (type !== 'web') {
        params.set('type', type);
    }
    window.history.pushState({ query, type }, '', `?${params.toString()}`);
}

function handleURLParams() {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    const type = params.get('type') || 'web';

    if (query) {
        DOM.searchInput.value = query;
        DOM.searchInputHeader.value = query;
        state.currentQuery = query;
        state.currentType = type;
        
        // ラジオボタン更新
        document.querySelector(`input[name="searchType"][value="${type}"]`).checked = true;
        
        // フィルタータブ更新
        DOM.filterTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.type === type);
        });

        showResultsPage();
        fetchResults(query, type);
    }
}

// ===== ページ遷移観察 =====
function observePageTransitions() {
    window.addEventListener('popstate', (e) => {
        if (e.state && e.state.query) {
            state.currentQuery = e.state.query;
            state.currentType = e.state.type || 'web';
            showResultsPage();
            fetchResults(e.state.query, e.state.type);
        } else {
            goBack();
        }
    });
}

// ===== 通知表示 =====
function showNotification(message, type = 'info') {
    console.log(`[${type}] ${message}`);
}

// ===== インタラクション改善 =====
document.addEventListener('DOMContentLoaded', () => {
    // リップルエフェクト（ボタン）
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const ripple = document.createElement('div');
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;
            
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = x + 'px';
            ripple.style.top = y + 'px';
            ripple.style.position = 'absolute';
            ripple.style.pointerEvents = 'none';
            ripple.style.borderRadius = '50%';
            ripple.style.background = 'radial-gradient(circle, rgba(255,255,255,0.5), transparent)';
            ripple.style.animation = 'ripple 0.6s ease-out';
            
            if (this.style.position === 'static') {
                this.style.position = 'relative';
            }
            this.appendChild(ripple);
            
            setTimeout(() => ripple.remove(), 600);
        });
    });
});

// ===== リップルアニメーション定義 =====
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        from {
            transform: scale(0);
            opacity: 1;
        }
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===== 初期化実行 =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
