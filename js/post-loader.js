// 게시글 상세 페이지 로드 및 마크다운 파싱
let currentPostData = null;

// URL 파라미터에서 파일명 가져오기
function getPostFile() {
  const params = new URLSearchParams(window.location.search);
  return params.get("file");
}

// posts.json에서 게시글 메타데이터 가져오기
async function loadPostMetadata(file) {
  try {
    const response = await fetch("posts.json");
    if (!response.ok) {
      throw new Error("posts.json을 불러올 수 없습니다.");
    }
    const posts = await response.json();
    const post = posts.find((p) => p.file === file);
    return post || null;
  } catch (error) {
    console.error("메타데이터 로드 실패:", error);
    return null;
  }
}

// 마크다운 파일 로드 및 파싱
async function loadPostContent(file) {
  try {
    const response = await fetch(`pages/${file}`);
    if (!response.ok) {
      throw new Error(`게시글 파일을 불러올 수 없습니다: ${file}`);
    }
    let content = await response.text();

    // UTF-8 BOM 제거
    if (content.charCodeAt(0) === 0xfeff) {
      content = content.slice(1);
    }

    // Front Matter 파싱
    const frontMatterMatch = content.match(
      /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/
    );
    let postContent = content;
    let metadata = {};

    if (frontMatterMatch) {
      const frontMatter = frontMatterMatch[1];
      postContent = frontMatterMatch[2];

      // Front Matter 라인 파싱
      const lines = frontMatter.split(/\r?\n/);
      lines.forEach((line) => {
        const colonIndex = line.indexOf(":");
        if (colonIndex > 0) {
          const key = line.substring(0, colonIndex).trim();
          let value = line.substring(colonIndex + 1).trim();

          // 따옴표 제거
          if (
            (value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))
          ) {
            value = value.slice(1, -1);
          }

          // 배열 파싱 (tags)
          if (key === "tags" && value.startsWith("[") && value.endsWith("]")) {
            try {
              value = JSON.parse(value);
            } catch {
              value = value
                .slice(1, -1)
                .split(",")
                .map((tag) => tag.trim().replace(/^['"]|['"]$/g, ""));
            }
          }

          metadata[key] = value;
        }
      });
    }

    return {
      metadata,
      content: postContent,
    };
  } catch (error) {
    console.error("게시글 로드 실패:", error);
    throw error;
  }
}

// 마크다운을 HTML로 변환
function parseMarkdown(content) {
  // marked.js 설정
  marked.setOptions({
    breaks: true,
    gfm: true,
  });

  return marked.parse(content);
}

// 게시글 렌더링
async function renderPost() {
  const file = getPostFile();

  if (!file) {
    document.getElementById("post-content").innerHTML =
      '<p class="loading">게시글 파일을 찾을 수 없습니다.</p>';
    return;
  }

  try {
    // 메타데이터 로드
    const metadata = await loadPostMetadata(file);

    // 게시글 내용 로드
    const { content: postContent } = await loadPostContent(file);

    // 제목 설정
    const title = metadata?.title || file.replace(".md", "");
    document.getElementById("post-title").textContent = title;
    document.title = `${title} - 블로그`;

    // 메타데이터 표시
    const metaContainer = document.querySelector(".post-meta");
    let metaHtml = "";

    if (metadata?.date) {
      metaHtml += `<span>${metadata.date}</span>`;
    }

    if (
      metadata?.tags &&
      Array.isArray(metadata.tags) &&
      metadata.tags.length > 0
    ) {
      metaHtml += `<span>태그: ${metadata.tags
        .map((tag) => `<span class="post-tag">${escapeHtml(tag)}</span>`)
        .join(" ")}</span>`;
    }

    if (metadata?.category) {
      metaHtml += `<span>카테고리: ${escapeHtml(metadata.category)}</span>`;
    }

    metaContainer.innerHTML = metaHtml;

    // 마크다운 변환 및 표시
    const htmlContent = parseMarkdown(postContent);
    document.getElementById("post-content").innerHTML = htmlContent;

    // Prism.js 코드 하이라이팅 적용
    if (window.Prism) {
      Prism.highlightAll();
    }

    // Giscus 로드
    loadGiscus();
  } catch (error) {
    console.error("게시글 렌더링 실패:", error);
    document.getElementById("post-content").innerHTML =
      '<p class="loading">게시글을 불러오는 중 오류가 발생했습니다.</p>';
  }
}

// Giscus 댓글 시스템 로드
function loadGiscus() {
  const container = document.getElementById("giscus-container");

  // 이미 로드된 경우 제거
  const existingScript = document.querySelector('script[src*="giscus"]');
  if (existingScript) {
    existingScript.remove();
  }
  container.innerHTML = "";

  const script = document.createElement("script");
  script.src = "https://giscus.app/client.js";
  script.setAttribute(
    "data-repo",
    "whynot008100-gamja/whynot008100-gamja.github.io"
  );
  script.setAttribute("data-repo-id", "R_kgDOQekhhA"); // 사용자가 설정 필요
  script.setAttribute("data-category", "General");
  script.setAttribute("data-category-id", "DIC_kwDOQekhhM4CzJXJ"); // 사용자가 설정 필요
  script.setAttribute("data-mapping", "url");
  script.setAttribute("data-strict", "0");
  script.setAttribute("data-reactions-enabled", "1");
  script.setAttribute("data-emit-metadata", "1");
  script.setAttribute("data-input-position", "bottom");
  script.setAttribute("data-theme", "preferred_color_scheme");
  script.setAttribute("data-lang", "ko");
  script.setAttribute("crossorigin", "anonymous");
  script.async = true;

  container.appendChild(script);
}

// HTML 이스케이프
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// 초기화
document.addEventListener("DOMContentLoaded", () => {
  renderPost();
});
