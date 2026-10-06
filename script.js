// ===== 状態管理 =====
const state = {
    currentQuery: '',
    currentType: 'web',
    currentPage: 1,
    isLoading: false,
    results: []
};

// ===== DOM要素 =====
const elements = {
    // ホームページ
    homePage: document.getElementById('homePage'),
    searchInput: document.getElementById('searchInput'),
    clearBtn: document.getElementById('clearBtn'),
    searchBtn: document.getElementById('searchBtn'),
    themeToggle: document.getElementById('themeToggle'),
    quickLinks: document.querySelectorAll('.quick-link'),
    
    // 結果ページ
    resultsPage: document.getElementById('resultsPage'),
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
    loadTheme();
    setupEventListeners();
    handleURLParams();
}

// ===== イベントリスナー =====
function setupEventListeners() {
    // ホームページ
    elements.searchInput.addEventListener('input', (e) => {
        elements.clearBtn.style.display = e.target.value ? 'flex' : 'none';
    });

    elements.clearBtn.addEventListener('click', () => {
        elements.searchInput.value = '';
        elements.searchInput.focus();
        elements.clearBtn.style.display = 'none';
    });

    elements.searchBtn.addEventListener('click', performSearch);
    elements.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    elements.themeToggle.addEventListener('click', toggleTheme);
    elements.themeToggleResults.addEventListener('click', toggleTheme);

    // クイックリンク
    elements.quickLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const type = e.currentTarget.dataset.type;
            state.currentType = type;
            performSearch();
        });
    });

    // ヘッダー検索
    elements.searchBtnHeader.addEventListener('click', () => {
        const query = elements.searchInputHeader.value.trim();
        if (query) {
            elements.searchInput.value = query;
            state.currentQuery = query;
            performSearch();
        }
    });

    elements.searchInputHeader.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            elements.searchBtnHeader.click();
        }
    });

    // フィルタータブ
    elements.filterTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            elements.filterTabs.forEach(t => t.classList.remove('active'));
            e.currentTarget.classList.add('active');
            state.currentType = e.currentTarget.dataset.type;
            // 結果を再フィルタリング
            displayResults();
        });
    });
}

// ===== 検索実行 =====
async function performSearch() {
    const query = elements.searchInput.value.trim();
    
    if (!query) {
        alert('検索キーワードを入力してください');
        return;
    }

    state.currentQuery = query;
    state.currentPage = 1;
    showResultsPage();
    await fetchResults(query, state.currentType);

    // URL更新
    const params = new URLSearchParams();
    params.set('q', query);
    if (state.currentType !== 'web') {
        params.set('type', state.currentType);
    }
    window.history.pushState({query, type: state.currentType}, '', `?${params.toString()}`);
}

// ===== 結果を取得 =====
async function fetchResults(query, type) {
    elements.loading.style.display = 'flex';
    elements.errorMessage.style.display = 'none';
    elements.resultsList.innerHTML = '';

    try {
        const response = await fetch(`${API_BASE}?q=${encodeURIComponent(query)}`);
        
        if (!response.ok) {
            throw new Error('検索エラーが発生しました');
        }

        const data = await response.json();
        
        // 結果をタイプでフィルタリング
        let filteredResults = data.results || [];
        
        if (type !== 'web' && type !== 'all') {
            filteredResults = filteredResults.filter(r => r.type === type);
        }

        state.results = filteredResults;
        elements.loading.style.display = 'none';

        if (filteredResults.length === 0) {
            elements.resultsList.innerHTML = '<div class="no-results"><p>結果が見つかりません。別のキーワードで試してみてください。</p></div>';
        } else {
            displayResults();
            updateStats();
        }
    } catch (error) {
        elements.loading.style.display = 'none';
        elements.errorMessage.style.display = 'block';
        elements.errorMessage.textContent = error.message || 'エラーが発生しました。もう一度試してください。';
    }
}

// ===== 結果を表示 =====
function displayResults() {
    elements.resultsList.innerHTML = '';

    state.results.forEach((result, index) => {
        const resultItem = createResultElement(result);
        elements.resultsList.appendChild(resultItem);
    });
}

// ===== 結果要素を作成 =====
function createResultElement(result) {
    const div = document.createElement('div');
    div.className = 'result-item';

    if (result.type === 'image') {
        div.innerHTML = `
            <div class="result-image-item">
                <img src="${escapeHtml(result.image)}" alt="${escapeHtml(result.title)}" class="result-image" loading="lazy">
                <p class="image-title">${escapeHtml(result.title)}</p>
            </div>
        `;
    } else {
        div.innerHTML = `
            <div class="result-url">${escapeHtml(result.url)}</div>
            <a href="${escapeHtml(result.url)}" target="_blank" class="result-title">${escapeHtml(result.title)}</a>
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
    const count = state.results.length;
    const time = '0.5';
    elements.resultStats.textContent = `約 ${count} 件 (${time} 秒)`;
}

// ===== ページを表示 =====
function showResultsPage() {
    elements.homePage.style.display = 'none';
    elements.resultsPage.style.display = 'block';
    elements.searchInputHeader.focus();
}

function showHomePage() {
    elements.homePage.style.display = 'flex';
    elements.resultsPage.style.display = 'none';
    elements.searchInput.focus();
}

// ===== テーマ管理 =====
function toggleTheme() {
    const html = document.documentElement;
    const theme = html.getAttribute('data-theme');
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    
    html.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

function loadTheme() {
    const theme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', theme);
}

// ===== URL パラメータを処理 =====
function handleURLParams() {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    const type = params.get('type') || 'web';

    if (query) {
        elements.searchInput.value = query;
        state.currentQuery = query;
        state.currentType = type;
        
        // フィルタータブを更新
        elements.filterTabs.forEach(tab => {
            if (tab.dataset.type === type) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });

        showResultsPage();
        fetchResults(query, type);
    }
}

// ===== 初期化実行 =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
