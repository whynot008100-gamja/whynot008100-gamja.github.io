// 검색 기능
let searchPosts = [];

// 검색어로 게시글 필터링
function performSearch(query) {
    if (!query || query.trim() === '') {
        // 검색어가 없으면 전체 게시글 표시
        if (typeof updateFilteredPosts === 'function') {
            updateFilteredPosts(searchPosts);
        }
        return;
    }

    const searchTerm = query.toLowerCase().trim();
    const filtered = searchPosts.filter(post => {
        // 제목 검색
        const titleMatch = post.title.toLowerCase().includes(searchTerm);
        
        // 내용 검색 (excerpt)
        const contentMatch = post.excerpt && post.excerpt.toLowerCase().includes(searchTerm);
        
        // 태그 검색
        const tagMatch = post.tags && Array.isArray(post.tags) && 
            post.tags.some(tag => tag.toLowerCase().includes(searchTerm));
        
        // 카테고리 검색
        const categoryMatch = post.category && post.category.toLowerCase().includes(searchTerm);

        return titleMatch || contentMatch || tagMatch || categoryMatch;
    });

    // 필터링된 결과 업데이트
    if (typeof updateFilteredPosts === 'function') {
        updateFilteredPosts(filtered);
    }
}

// 검색 초기화
function initSearch() {
    const searchInput = document.getElementById('search-input');
    
    if (!searchInput) {
        return;
    }

    // posts.json 로드
    fetch('posts.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('posts.json을 불러올 수 없습니다.');
            }
            return response.json();
        })
        .then(posts => {
            searchPosts = posts;
        })
        .catch(error => {
            console.error('검색 데이터 로드 실패:', error);
        });

    // 입력 이벤트 리스너
    let searchTimeout;
    searchInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(e.target.value);
        }, 300); // 디바운싱
    });

    // Enter 키 처리
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            clearTimeout(searchTimeout);
            performSearch(e.target.value);
        }
    });
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    initSearch();
});

