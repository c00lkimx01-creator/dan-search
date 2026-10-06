// ===== 状態管理 =====
const state = {
    currentQuery: '',
    currentType: 'web',
    isLoading: false,
    results: []
};

// ===== DOM要素 =====
const elements = {
    searchInput: document.getElementById('searchInput'),
    clearBtn: document.getElementById('clearBtn'),
    searchBtn: document.getElementById('searchBtn'),
    themeToggle: document.getElementById('themeToggle'),
    searchSection: document.getElementById('searchSection'),
    resultsSection: document.getElementById('resultsSection'),
    resultsContainer: document.getElementById('resultsContainer'),
    loading: document.getElementById('loading'),
    errorMessage: document.getElementById('errorMessage'),
    backBtn: document.getElementById('backBtn'),
    tabBtns: document.querySelectorAll('.tab-btn')
};

// ===== API設定 =====
const API_BASE = 'https://find-joy-feed.lovable.app/api/public/search';

// ===== 初期化 =====
function init() {
    loadTheme();
    setupEventListeners();
    handleURLParams();
}

// ===== イベントリスナー設定 =====
function setupEventListeners() {
    // 検索入力
    elements.searchInput.addEventListener('input', (e) => {
        elements.clearBtn.style.display = e.target.value ? 'flex' : 'none';
    });

    // クリアボタン
    elements.clearBtn.addEventListener('click', () => {
        elements.searchInput.value = '';
        elements.searchInput.focus();
        elements.clearBtn.style.display = 'none';
    });

    // 検索ボタン
    elements.searchBtn.addEventListener('click', performSearch);

    // Enterキーで検索
    elements.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    // テーマ切り替え
    elements.themeToggle.addEventListener('click', toggleTheme);

    // タブ切り替え
    elements.tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            elements.tabBtns.forEach(b => b.classList.remove('active'));
            e.currentTarget.classList.add('active');
            state.currentType = e.currentTarget.dataset.type;
        });
    });

    // 戻るボタン
    elements.backBtn.addEventListener('click', goBack);
}

// ===== 検索実行 =====
async function performSearch() {
    const query = elements.searchInput.value.trim();
    
    if (!query) {
        alert('検索キーワードを入力してください');
        return;
    }

    state.currentQuery = query;
    showResults();
    await fetchResults(query, state.currentType);

    // URLを更新
    const params = new URLSearchParams();
    params.set('q', query);
    params.set('type', state.currentType);
    window.history.pushState({query, type: state.currentType}, '', `?${params.toString()}`);
}

// ===== 結果を取得 =====
async function fetchResults(query, type) {
    elements.loading.style.display = 'flex';
    elements.errorMessage.style.display = 'none';
    elements.resultsContainer.innerHTML = '';

    try {
        let url = `${API_BASE}?q=${encodeURIComponent(query)}&max_results=20`;
        
        // 画像と動画の場合はtypeパラメータを追加
        if (type !== 'web') {
            url += `&type=${type}`;
        }

        console.log('Fetching:', url);

        const response = await fetch(url, {
            headers: {
                'Accept': 'application/json',
            },
            mode: 'cors'
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Response:', data);

        // レスポンス形式に応じて結果を処理
        let results = [];
        if (Array.isArray(data)) {
            results = data;
        } else if (data.results && Array.isArray(data.results)) {
            results = data.results;
        } else if (data.data && Array.isArray(data.data)) {
            results = data.data;
        }

        state.results = results;
        displayResults(results, type);

    } catch (error) {
        console.error('Search error:', error);
        showError(`検索エラー: ${error.message}。APIが利用できない可能性があります。`);
    } finally {
        elements.loading.style.display = 'none';
    }
}

// ===== 結果を表示 =====
function displayResults(results, type) {
    if (!results || results.length === 0) {
        elements.resultsContainer.innerHTML = '<div class="error-message" style="grid-column: 1/-1;">検索結果が見つかりませんでした。</div>';
        return;
    }

    elements.resultsContainer.innerHTML = '';

    results.forEach((result, index) => {
        let card;

        if (type === 'web') {
            card = createWebResultCard(result);
        } else if (type === 'image') {
            card = createImageResultCard(result);
        } else if (type === 'video') {
            card = createVideoResultCard(result);
        }

        if (card) {
            elements.resultsContainer.appendChild(card);
        }
    });
}

// ===== Web検索結果カード =====
function createWebResultCard(result) {
    const card = document.createElement('div');
    card.className = 'result-card';

    const title = result.title || result.name || 'タイトルなし';
    const url = result.url || result.link || '';
    const description = result.snippet || result.description || '';

    card.innerHTML = `
        <div class="result-text">
            <a href="${url}" target="_blank" rel="noopener noreferrer">${escapeHtml(title)}</a>
            <div class="result-url">${escapeHtml(url)}</div>
            <div class="result-description">${escapeHtml(description)}</div>
        </div>
    `;

    return card;
}

// ===== 画像検索結果カード =====
function createImageResultCard(result) {
    const card = document.createElement('div');
    card.className = 'result-card';

    const imageUrl = result.image || result.url || result.src || '';
    const title = result.title || result.alt || '画像';
    const sourceUrl = result.sourceUrl || result.source_url || result.page_url || '';

    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = title;
    img.className = 'result-image';
    img.onerror = () => {
        img.style.display = 'none';
        card.innerHTML = `<div class="image-info"><p class="image-title">画像が読み込めませんでした</p></div>`;
    };

    card.appendChild(img);

    const info = document.createElement('div');
    info.className = 'image-info';
    
    if (sourceUrl) {
        const link = document.createElement('a');
        link.href = sourceUrl;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.className = 'image-title';
        link.textContent = escapeHtml(title.substring(0, 50));
        info.appendChild(link);
    } else {
        const titleEl = document.createElement('div');
        titleEl.className = 'image-title';
        titleEl.textContent = escapeHtml(title.substring(0, 50));
        info.appendChild(titleEl);
    }

    card.appendChild(info);
    return card;
}

// ===== 動画検索結果カード =====
function createVideoResultCard(result) {
    const card = document.createElement('div');
    card.className = 'result-card';

    const title = result.title || result.name || 'ビデオ';
    const url = result.url || result.link || '';
    const thumbnail = result.thumbnail || result.image || '';
    const channel = result.channel || result.source || '';
    const duration = result.duration || '';

    let content = '';

    if (thumbnail) {
        content += `<img src="${thumbnail}" alt="${escapeHtml(title)}" class="result-image" onerror="this.style.display='none'">`;
    }

    content += `
        <div class="result-text">
            <a href="${url}" target="_blank" rel="noopener noreferrer">${escapeHtml(title)}</a>
            ${channel ? `<div class="result-url">${escapeHtml(channel)}</div>` : ''}
            ${duration ? `<div class="result-url">期間: ${escapeHtml(duration)}</div>` : ''}
        </div>
    `;

    card.innerHTML = content;
    return card;
}

// ===== ユーティリティ関数 =====
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showResults() {
    elements.searchSection.style.display = 'none';
    elements.resultsSection.style.display = 'block';
}

function goBack() {
    elements.resultsSection.style.display = 'none';
    elements.searchSection.style.display = 'flex';
    elements.resultsContainer.innerHTML = '';
    window.history.pushState({}, '', window.location.pathname);
}

function showError(message) {
    elements.errorMessage.textContent = message;
    elements.errorMessage.style.display = 'block';
}

// ===== テーマ機能 =====
function loadTheme() {
    const savedTheme = localStorage.getItem('dan-search-theme') || 'light';
    setTheme(savedTheme);
}

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('dan-search-theme', theme);
    updateThemeIcon(theme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
}

function updateThemeIcon(theme) {
    // テーマに応じてアイコンを更新（必要に応じて）
    const isLight = theme === 'light';
    // UIは自動的にCSSで変更される
}

// ===== URLパラメータ処理 =====
function handleURLParams() {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    const type = params.get('type') || 'web';

    if (query) {
        elements.searchInput.value = query;
        elements.clearBtn.style.display = 'flex';
        
        // タイプを設定
        state.currentType = type;
        elements.tabBtns.forEach(btn => {
            if (btn.dataset.type === type) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // 自動的に検索を実行
        performSearch();
    }
}

// ===== ページロード時の実行 =====
document.addEventListener('DOMContentLoaded', init);

// ===== PWA対応（キャッシュ） =====
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {
        // Service Workerの登録に失敗した場合は無視
    });
}
