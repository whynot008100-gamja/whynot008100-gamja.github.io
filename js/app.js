// 게시글 목록 로드 및 표시
let allPosts = [];
let filteredPosts = [];

// posts.json 로드
async function loadPosts() {
    try {
        const response = await fetch('posts.json');
        if (!response.ok) {
            throw new Error('posts.json을 불러올 수 없습니다.');
        }
        allPosts = await response.json();
        filteredPosts = [...allPosts];
        renderPosts();
        renderTagFilters();
    } catch (error) {
        console.error('게시글 로드 실패:', error);
        document.getElementById('posts-container').innerHTML = 
            '<p class="loading">게시글을 불러올 수 없습니다.</p>';
    }
}

// 게시글 렌더링
function renderPosts() {
    const container = document.getElementById('posts-container');
    
    if (filteredPosts.length === 0) {
        container.innerHTML = '<p class="loading">표시할 게시글이 없습니다.</p>';
        return;
    }

    container.innerHTML = filteredPosts.map(post => `
        <article class="post-card">
            <h2><a href="post.html?file=${encodeURIComponent(post.file)}">${escapeHtml(post.title)}</a></h2>
            <div class="post-meta">
                <span>${post.date}</span>
                ${post.category ? `<span>카테고리: ${escapeHtml(post.category)}</span>` : ''}
            </div>
            ${post.tags && post.tags.length > 0 ? `
                <div class="post-tags">
                    ${post.tags.map(tag => `<span class="post-tag">${escapeHtml(tag)}</span>`).join('')}
                </div>
            ` : ''}
            ${post.excerpt ? `<p class="post-excerpt">${escapeHtml(post.excerpt)}</p>` : ''}
        </article>
    `).join('');
}

// 태그 필터 렌더링
function renderTagFilters() {
    const tagFiltersContainer = document.getElementById('tag-filters');
    const allTags = new Set();
    
    allPosts.forEach(post => {
        if (post.tags && Array.isArray(post.tags)) {
            post.tags.forEach(tag => allTags.add(tag));
        }
    });

    const sortedTags = Array.from(allTags).sort();
    
    if (sortedTags.length === 0) {
        tagFiltersContainer.innerHTML = '';
        return;
    }

    tagFiltersContainer.innerHTML = `
        <button class="tag-filter active" data-tag="all">전체</button>
        ${sortedTags.map(tag => `
            <button class="tag-filter" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</button>
        `).join('')}
    `;

    // 태그 필터 클릭 이벤트
    tagFiltersContainer.querySelectorAll('.tag-filter').forEach(button => {
        button.addEventListener('click', () => {
            // 활성 상태 토글
            tagFiltersContainer.querySelectorAll('.tag-filter').forEach(btn => {
                btn.classList.remove('active');
            });
            button.classList.add('active');

            const selectedTag = button.getAttribute('data-tag');
            filterByTag(selectedTag);
        });
    });
}

// 태그로 필터링
function filterByTag(tag) {
    if (tag === 'all') {
        filteredPosts = [...allPosts];
    } else {
        filteredPosts = allPosts.filter(post => 
            post.tags && Array.isArray(post.tags) && post.tags.includes(tag)
        );
    }
    renderPosts();
    
    // 검색창이 있으면 검색도 다시 적용
    const searchInput = document.getElementById('search-input');
    if (searchInput && searchInput.value) {
        if (typeof performSearch === 'function') {
            performSearch(searchInput.value);
        }
    }
}

// HTML 이스케이프
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 검색 결과 업데이트 (search.js에서 호출)
function updateFilteredPosts(posts) {
    filteredPosts = posts;
    renderPosts();
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    loadPosts();
});

