// ===== State管理 =====
const state = {
    query: '',
    currentPage: 1,
    results: [],
    webResults: [],
    imageResults: [],
    videoResults: [],
    filter: 'web',
    isLoading: false
};

// ===== DOM要素 =====
const DOM = {
    homePage: document.getElementById('homePage'),
    resultsPage: document.getElementById('resultsPage'),
    homeSearchInput: document.getElementById('homeSearchInput'),
    homeSearchBtn: document.getElementById('homeSearchBtn'),
    homeLuckyBtn: document.getElementById('homeLuckyBtn'),
    headerSearchInput: document.getElementById('headerSearchInput'),
    headerSearchBtn: document.getElementById('headerSearchBtn'),
    backBtn: document.getElementById('backBtn'),
    resultsList: document.getElementById('resultsList'),
    resultCount: document.getElementById('resultCount'),
    loading: document.getElementById('loading'),
    errorMessage: document.getElementById('errorMessage'),
    filterTabs: document.querySelectorAll('.filter-tab'),
    paginationSection: document.getElementById('paginationSection'),
    prevBtn: document.getElementById('prevBtn'),
    nextBtn: document.getElementById('nextBtn'),
    clearIconHome: document.getElementById('clearIconHome')
};

const API_BASE = 'https://find-joy-feed.lovable.app/api/public/search';

// ===== 初期化 =====
function init() {
    loadTheme();
    setupEventListeners();
    handleURLParams();
}

// ===== イベントリスナー設定 =====
function setupEventListeners() {
    // ホームページ
    DOM.homeSearchInput.addEventListener('input', (e) => {
        DOM.clearIconHome.style.display = e.target.value ? 'flex' : 'none';
    });

    DOM.clearIconHome.addEventListener('click', () => {
        DOM.homeSearchInput.value = '';
        DOM.clearIconHome.style.display = 'none';
        DOM.homeSearchInput.focus();
    });

    DOM.homeSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performSearch();
    });

    DOM.homeSearchBtn.addEventListener('click', performSearch);
    DOM.homeLuckyBtn.addEventListener('click', () => {
        const query = DOM.homeSearchInput.value.trim();
        if (query) {
            state.query = query;
            goToResults();
        }
    });

    // ヘッダー検索
    DOM.headerSearchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') performHeaderSearch();
    });

    DOM.headerSearchBtn.addEventListener('click', performHeaderSearch);

    // 戻るボタン
    DOM.backBtn.addEventListener('click', goHome);

    // フィルタータブ
    DOM.filterTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            DOM.filterTabs.forEach(t => t.classList.remove('active'));
            e.currentTarget.classList.add('active');
            state.filter = e.currentTarget.dataset.filter;
            displayResults();
        });
    });

    // ページネーション
    DOM.prevBtn.addEventListener('click', () => {
        if (state.currentPage > 1) {
            state.currentPage--;
            displayResults();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    });

    DOM.nextBtn.addEventListener('click', () => {
        state.currentPage++;
        displayResults();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ===== 検索実行 =====
function performSearch() {
    const query = DOM.homeSearchInput.value.trim();
    if (query) {
        state.query = query;
        state.currentPage = 1;
        goToResults();
    }
}

function performHeaderSearch() {
    const query = DOM.headerSearchInput.value.trim();
    if (query) {
        state.query = query;
        state.currentPage = 1;
        DOM.homeSearchInput.value = query;
        fetchResults();
    }
}

// ===== 結果を取得 =====
async function fetchResults() {
    state.isLoading = true;
    DOM.loading.style.display = 'flex';
    DOM.errorMessage.style.display = 'none';
    DOM.resultsList.innerHTML = '';

    try {
        const response = await fetch(`${API_BASE}?q=${encodeURIComponent(state.query)}`);

        if (!response.ok) throw new Error('検索エラー');

        const data = await response.json();
        const results = data.results || [];

        // タイプ別に分類
        state.webResults = results.filter(r => r.type === 'web' || !r.type);
        state.imageResults = results.filter(r => r.type === 'image');
        state.videoResults = results.filter(r => r.type === 'video');

        state.isLoading = false;
        DOM.loading.style.display = 'none';

        updateURL();
        displayResults();
    } catch (error) {
        state.isLoading = false;
        DOM.loading.style.display = 'none';
        DOM.errorMessage.style.display = 'block';
        DOM.errorMessage.textContent = '検索に失敗しました。もう一度試してください。';
    }
}

// ===== 結果表示 =====
function displayResults() {
    DOM.resultsList.innerHTML = '';
    let results = [];
    let total = 0;

    if (state.filter === 'web') {
        results = state.webResults;
        total = state.webResults.length;
    } else if (state.filter === 'image') {
        results = state.imageResults;
        total = state.imageResults.length;
    } else if (state.filter === 'video') {
        results = state.videoResults;
        total = state.videoResults.length;
    }

    DOM.resultCount.textContent = `約 ${total.toLocaleString()} 件`;

    if (results.length === 0) {
        DOM.resultsList.innerHTML = '<div class="no-results"><p>検索結果が見つかりません</p></div>';
        DOM.paginationSection.style.display = 'none';
        return;
    }

    // ページネーション（10件ずつ）
    const itemsPerPage = 10;
    const startIdx = (state.currentPage - 1) * itemsPerPage;
    const endIdx = startIdx + itemsPerPage;
    const pageResults = results.slice(startIdx, endIdx);

    if (state.filter === 'image') {
        const imageContainer = document.createElement('div');
        imageContainer.className = 'image-results';

        pageResults.forEach(result => {
            if (result.image) {
                const item = document.createElement('div');
                item.className = 'image-item';
                const img = document.createElement('img');
                img.src = result.image;
                img.alt = result.title;
                img.onerror = () => img.style.display = 'none';
                item.appendChild(img);
                imageContainer.appendChild(item);
            }
        });

        DOM.resultsList.appendChild(imageContainer);
    } else {
        pageResults.forEach(result => {
            const item = document.createElement('div');
            item.className = 'result-item';

            const url = new URL(result.url).hostname.replace('www.', '');
            item.innerHTML = `
                <div class="result-url">${escapeHtml(url)}</div>
                <a href="${escapeHtml(result.url)}" target="_blank" rel="noopener noreferrer" class="result-title">${escapeHtml(result.title)}</a>
                <div class="result-description">${escapeHtml(result.description)}</div>
            `;
            DOM.resultsList.appendChild(item);
        });
    }

    // ページネーション表示
    const totalPages = Math.ceil(results.length / itemsPerPage);
    if (totalPages > 1) {
        DOM.paginationSection.style.display = 'block';
        DOM.prevBtn.style.display = state.currentPage > 1 ? 'flex' : 'none';
        DOM.nextBtn.disabled = state.currentPage >= totalPages;
    } else {
        DOM.paginationSection.style.display = 'none';
    }
}

// ===== ページ遷移 =====
function goToResults() {
    DOM.homePage.style.display = 'none';
    DOM.resultsPage.style.display = 'flex';
    DOM.headerSearchInput.value = state.query;
    fetchResults();
}

function goHome() {
    DOM.homePage.style.display = 'flex';
    DOM.resultsPage.style.display = 'none';
    DOM.homeSearchInput.focus();
}

// ===== ユーティリティ =====
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function updateURL() {
    const params = new URLSearchParams();
    params.set('q', state.query);
    if (state.filter !== 'web') {
        params.set('filter', state.filter);
    }
    if (state.currentPage > 1) {
        params.set('page', state.currentPage);
    }
    window.history.pushState({ query: state.query, filter: state.filter, page: state.currentPage }, '', `?${params.toString()}`);
}

function handleURLParams() {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    const filter = params.get('filter') || 'web';
    const page = parseInt(params.get('page')) || 1;

    if (query) {
        state.query = query;
        state.filter = filter;
        state.currentPage = page;

        DOM.homeSearchInput.value = query;
        DOM.headerSearchInput.value = query;

        // フィルタータブ更新
        DOM.filterTabs.forEach(tab => {
            tab.classList.toggle('active', tab.dataset.filter === filter);
        });

        goToResults();
    }
}

// ===== テーマ =====
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

// ===== ポップスタート機能 =====
window.addEventListener('popstate', (e) => {
    if (e.state && e.state.query) {
        state.query = e.state.query;
        state.filter = e.state.filter || 'web';
        state.currentPage = e.state.page || 1;
        goToResults();
    } else {
        goHome();
    }
});

// ===== 初期化実行 =====
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
