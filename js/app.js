// ============================================================
// הבלוג של ירין — JavaScript ראשי
// ============================================================

// ---- Google Analytics helper ----
function track(eventName, params) {
  if (typeof gtag === 'function') {
    gtag('event', eventName, params || {})
  }
}

// ---- מצב גלובלי ----
let currentFilter = 'הכל'
let currentSort = 'date' // date | popular | algorithm
let lightboxImages = []
let lightboxIndex = 0
let calcExpr = ''

// ---- תגובות (localStorage) ----
function getComments(slug) {
  try {
    return JSON.parse(localStorage.getItem('comments_' + slug)) || []
  } catch(e) { return [] }
}
function saveComments(slug, comments) {
  localStorage.setItem('comments_' + slug, JSON.stringify(comments))
}
function addComment(slug, author, text, parentId) {
  const comments = getComments(slug)
  const comment = {
    id: Date.now() + '_' + Math.random().toString(36).slice(2,8),
    author: author || 'אנונימי',
    text: text,
    parentId: parentId || null,
    date: new Date().toLocaleDateString('he-IL'),
    upvotes: 0,
    downvotes: 0,
    voted: {} // track votes by visitorId
  }
  comments.push(comment)
  saveComments(slug, comments)
  return comment
}
function voteComment(slug, commentId, direction) {
  const comments = getComments(slug)
  const visitorId = getVisitorId()
  const c = comments.find(x => x.id === commentId)
  if (!c) return
  if (!c.voted) c.voted = {}
  const prev = c.voted[visitorId]
  if (prev === direction) return // already voted same
  if (prev === 'up') c.upvotes--
  if (prev === 'down') c.downvotes--
  if (direction === 'up') c.upvotes++
  if (direction === 'down') c.downvotes++
  c.voted[visitorId] = direction
  saveComments(slug, comments)
}
function getVisitorId() {
  let id = localStorage.getItem('visitor_id')
  if (!id) { id = 'v_' + Date.now() + '_' + Math.random().toString(36).slice(2,8); localStorage.setItem('visitor_id', id) }
  return id
}

// ---- מיון פוסטים ----
function sortPosts(posts) {
  const arr = [...posts]
  if (currentSort === 'date') {
    return arr // original order = publication order
  }
  if (currentSort === 'popular') {
    // Alberto's posts first (old to new), then Yarin's
    const alberto = arr.filter(p => p.author && p.author.includes('אלברטו'))
    const yarin = arr.filter(p => !p.author || !p.author.includes('אלברטו'))
    return [...alberto, ...yarin]
  }
  if (currentSort === 'algorithm') {
    // "smart algorithm" = random shuffle
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]]
    }
    return arr
  }
  return arr
}
function setSort(s) {
  track('sort_change', { sort_type: s })
  currentSort = s
  renderHome()
  setTimeout(() => {
    document.getElementById('posts')?.scrollIntoView({ behavior: 'smooth' })
  }, 50)
}

// ---- מחשבון מדעי ----
function calcInput(ch) {
  if (calcExpr === '0') calcExpr = ''
  calcExpr += ch
  document.getElementById('calc-display').textContent = calcExpr
}
function calcClear() {
  calcExpr = ''
  document.getElementById('calc-display').textContent = '0'
}
function calcFunc(fn) {
  if (fn === 'pi') { calcInput(String(Math.PI)); return }
  if (fn === 'e') { calcInput(String(Math.E)); return }
  if (fn === 'pow2') { calcInput('^2'); return }
  if (fn === 'sqrt') { calcInput('Math.sqrt('); return }
  calcInput('Math.' + fn + '(')
}
function toggleCalc() {
  const section = document.getElementById('sci-calc-section')
  const isHidden = section.classList.contains('sci-calc--hidden')
  track('calculator_toggle', { action: isHidden ? 'open' : 'close' })
  if (isHidden) {
    section.classList.remove('sci-calc--hidden')
    section.scrollIntoView({ behavior: 'smooth' })
    launchConfetti()
  } else {
    section.classList.add('sci-calc--hidden')
  }
}
function launchConfetti() {
  const container = document.getElementById('confetti-container')
  container.innerHTML = ''
  const colors = ['#FF6B35','#E91E8C','#00BCD4','#8B5CF6','#FFD700','#00ff88','#ff4444','#00d4aa']
  for (let i = 0; i < 120; i++) {
    const c = document.createElement('div')
    c.className = 'confetti-piece'
    c.style.left = Math.random() * 100 + '%'
    c.style.background = colors[Math.floor(Math.random() * colors.length)]
    c.style.animationDelay = Math.random() * 1.5 + 's'
    c.style.animationDuration = (2 + Math.random() * 2) + 's'
    c.style.width = (6 + Math.random() * 8) + 'px'
    c.style.height = (6 + Math.random() * 8) + 'px'
    c.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px'
    c.style.transform = 'rotate(' + Math.random() * 360 + 'deg)'
    container.appendChild(c)
  }
  setTimeout(() => { container.innerHTML = '' }, 4000)
}
function calcEqual() {
  try {
    let expr = calcExpr.replace(/\^/g, '**')
    let result = Function('"use strict"; return (' + expr + ')')()
    result = Number(result) + 333
    track('calculator_compute', { expression: calcExpr, result: result })
    document.getElementById('calc-display').textContent = result
    calcExpr = String(result)
  } catch(e) {
    track('calculator_error', { expression: calcExpr })
    document.getElementById('calc-display').textContent = 'שגיאה!!!'
    calcExpr = ''
  }
}

// ---- נתיב hash ----
function getSlug() {
  const hash = window.location.hash
  if (hash.startsWith('#/post/')) return hash.slice(7)
  return null
}

function navigate(slug) {
  if (slug) {
    track('post_click', { post_slug: slug, post_title: (POSTS.find(p=>p.slug===slug)||{}).title })
    window.location.hash = '#/post/' + slug
  } else {
    track('navigate_home')
    window.location.hash = '#/'
  }
}

// ---- ניקוי HTML ----
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// ---- כרטיס קטגוריה ----
function categoryLabel(post) {
  return `<span class="post-card__category cat--${esc(post.colorClass)}">${esc(post.categoryEmoji)} ${esc(post.category)}</span>`
}

// ---- HTML כרטיס ----
function renderCard(post, delay = 0) {
  return `
    <div class="posts-grid__item" style="animation-delay:${delay}s">
      <article class="post-card post-card--${esc(post.colorClass)}" data-slug="${esc(post.slug)}">
        <div class="post-card__image-wrap" onclick="navigate('${esc(post.slug)}')" role="button" tabindex="0" aria-label="פתח פוסט: ${esc(post.title)}">
          <img src="${esc(post.mainImage.src)}" alt="${esc(post.mainImage.alt)}" class="post-card__image" loading="lazy" />
          <div class="post-card__image-overlay" aria-hidden="true"></div>
        </div>
        <div class="post-card__body">
          <div>${categoryLabel(post)}</div>
          <h2 class="post-card__title" onclick="navigate('${esc(post.slug)}')" role="button" tabindex="0">${esc(post.title)}</h2>
          ${post.author ? `<p class="post-card__author">✍️ ${esc(post.author)}</p>` : ''}
          <p class="post-card__teaser">${esc(post.teaser)}</p>
          <button class="post-card__btn btn--${esc(post.colorClass)}" onclick="navigate('${esc(post.slug)}')">
            <span>קרא עוד!!!</span>
            <span class="post-card__btn-arrow" aria-hidden="true">←</span>
          </button>
        </div>
      </article>
    </div>`
}

// ---- HTML גלריה ----
function renderGallery(images) {
  if (!images || images.length === 0) return ''
  const items = images.map((img, i) =>
    `<button class="gallery__item" onclick="openLightbox(${i})" aria-label="${esc(img.alt)}">
      <img src="${esc(img.src)}" alt="${esc(img.alt)}" class="gallery__img" loading="lazy" />
      <div class="gallery__overlay" aria-hidden="true">🔍</div>
    </button>`
  ).join('')
  return `
    <section class="gallery" aria-label="גלריית תמונות">
      <h2 class="gallery__title">📸 עוד תמונות מהסיפור!!!</h2>
      <div class="gallery__grid">${items}</div>
    </section>`
}

// ---- HTML פוסטים קשורים ----
function renderRelated(post) {
  const related = POSTS.filter(p => p.category === post.category && p.slug !== post.slug).slice(0, 3)
  if (!related.length) return ''
  const cards = related.map(rp => `
    <div class="related-card related-card--${esc(rp.colorClass)}" onclick="navigate('${esc(rp.slug)}')" role="button" tabindex="0" aria-label="עבור לפוסט: ${esc(rp.title)}">
      <div class="related-card__img-wrap">
        <img src="${esc(rp.mainImage.src)}" alt="${esc(rp.mainImage.alt)}" class="related-card__img" loading="lazy" />
      </div>
      <div class="related-card__body">
        <span class="related-card__category">${esc(rp.categoryEmoji)} ${esc(rp.category)}</span>
        <h3 class="related-card__title">${esc(rp.title)}</h3>
      </div>
    </div>`).join('')
  return `
    <section class="related-posts" aria-label="פוסטים קשורים">
      <div class="container">
        <h2 class="related-posts__title">🔥 עוד פוסטים שתאהבו!!!</h2>
        <div class="related-posts__grid">${cards}</div>
      </div>
    </section>`
}

// ============================================================
// עמוד הבית
// ============================================================

function renderHome() {
  document.title = 'הבלוג של ירין'

  const filteredRaw = currentFilter === 'הכל'
    ? POSTS
    : POSTS.filter(p => p.category === currentFilter)
  const filtered = sortPosts(filteredRaw)

  const filters = ['הכל', 'מסעות', 'אוכל', 'רעיונות עסקיים', 'תרבות']
  const filterEmojis = { 'הכל': '🌟', 'מסעות': '✈️', 'אוכל': '🧆', 'רעיונות עסקיים': '💡', 'תרבות': '🎭' }

  const filterHTML = filters.map(f =>
    `<button class="filter-btn ${currentFilter === f ? 'active' : ''}" onclick="setFilter('${f}')" aria-pressed="${currentFilter === f}">
      ${filterEmojis[f]} ${esc(f)}
    </button>`
  ).join('')

  const gridHTML = filtered.length > 0
    ? filtered.map((p, i) => renderCard(p, i * 0.07)).join('')
    : `<div class="posts-empty"><span aria-hidden="true">🔍</span><p>אין פוסטים בקטגוריה הזאת... עדיין!!!</p></div>`

  const html = `
    <!-- הירו -->
    <section class="hero" aria-label="כותרת הבלוג">
      <div class="hero__bubble hero__bubble--1" aria-hidden="true"></div>
      <div class="hero__bubble hero__bubble--2" aria-hidden="true"></div>
      <div class="hero__bubble hero__bubble--3" aria-hidden="true"></div>
      <div class="hero__content container">
        <div class="hero__badge" aria-hidden="true">🌟 הבלוג הכי כייפי בעולם 🌟</div>
        <h1 class="hero__title">
          <span class="hero__title-line">הבלוג</span>
          <span class="hero__title-accent"> של ירין </span>
          <span class="hero__title-emoji" aria-hidden="true">✨</span>
          <span class="hero__title-sub">(וגם של אלברטו מוסקטו, אבל יותר של ירין)</span>
        </h1>
        <p class="hero__subtitle">
          ברוכים הבאים לבלוג המדהים, המהנה, המרגש, והכי כייפי שנוצר אי פעם בהיסטוריה של האנושות!!!<br/>
          <strong>ירין כותב על מקומות, אוכל, ורעיונות עסקיים שישנו את העולם.</strong><br/>
          (או לפחות יצחיקו אתכם. שזה בעצם יותר חשוב.)
        </p>
        <div class="hero__stats" aria-label="עובדות על הבלוג">
          <div class="hero__stat"><span class="hero__stat-number">11</span><span class="hero__stat-label">פוסטים מדהימים</span></div>
          <div class="hero__stat"><span class="hero__stat-number">∞</span><span class="hero__stat-label">אהבה לחומוס</span></div>
          <div class="hero__stat"><span class="hero__stat-number">3</span><span class="hero__stat-label">רעיונות שישנו עולמות</span></div>
        </div>
        <button class="hero__cta" onclick="track('hero_cta_click');document.getElementById('posts').scrollIntoView({behavior:'smooth'})">
          <span>קראו את הפוסטים!!!</span>
          <span class="hero__cta-arrow" aria-hidden="true">👇</span>
        </button>
      </div>
    </section>

    <!-- כפתורי כלים -->
    <div class="sci-calc-toggle-wrap">
      <button class="sci-calc-toggle" onclick="toggleCalc()" aria-label="פתח מחשבון מדעי">🔬</button>
      <button class="sci-calc-toggle mult-table-toggle" onclick="toggleMultTable()" aria-label="פתח לוח הכפל">✖️</button>
    </div>

    <!-- לוח הכפל -->
    <section class="mult-table mult-table--hidden" id="mult-table-section" aria-label="לוח הכפל">
      <div class="container">
        <h2 class="mult-table__title">✖️ לוח הכפל לתועלת הציבור ✖️</h2>
        ${buildMultTable()}
      </div>
    </section>

    <section class="sci-calc sci-calc--hidden" id="sci-calc-section" aria-label="מחשבון מדעי">
      <div id="confetti-container" class="confetti-container"></div>
      <div class="container">
        <h2 class="sci-calc__title">🔬 מחשבון מדעי 🔬</h2>
        <p class="sci-calc__subtitle">כלי חשוב וטוב למי שרוצה לחשב בצורה מדעית!!!</p>
        <div class="sci-calc__box">
          <div class="sci-calc__display" id="calc-display">0</div>
          <div class="sci-calc__buttons">
            <button class="sci-calc__btn sci-calc__btn--func" onclick="calcFunc('sin')">sin</button>
            <button class="sci-calc__btn sci-calc__btn--func" onclick="calcFunc('cos')">cos</button>
            <button class="sci-calc__btn sci-calc__btn--func" onclick="calcFunc('tan')">tan</button>
            <button class="sci-calc__btn sci-calc__btn--func" onclick="calcFunc('sqrt')">√</button>
            <button class="sci-calc__btn sci-calc__btn--func" onclick="calcFunc('log')">log</button>
            <button class="sci-calc__btn sci-calc__btn--func" onclick="calcFunc('pow2')">x²</button>
            <button class="sci-calc__btn sci-calc__btn--func" onclick="calcInput('(')">(</button>
            <button class="sci-calc__btn sci-calc__btn--func" onclick="calcInput(')')">)</button>
            <button class="sci-calc__btn" onclick="calcInput('7')">7</button>
            <button class="sci-calc__btn" onclick="calcInput('8')">8</button>
            <button class="sci-calc__btn" onclick="calcInput('9')">9</button>
            <button class="sci-calc__btn sci-calc__btn--op" onclick="calcInput('/')">÷</button>
            <button class="sci-calc__btn" onclick="calcInput('4')">4</button>
            <button class="sci-calc__btn" onclick="calcInput('5')">5</button>
            <button class="sci-calc__btn" onclick="calcInput('6')">6</button>
            <button class="sci-calc__btn sci-calc__btn--op" onclick="calcInput('*')">×</button>
            <button class="sci-calc__btn" onclick="calcInput('1')">1</button>
            <button class="sci-calc__btn" onclick="calcInput('2')">2</button>
            <button class="sci-calc__btn" onclick="calcInput('3')">3</button>
            <button class="sci-calc__btn sci-calc__btn--op" onclick="calcInput('-')">−</button>
            <button class="sci-calc__btn" onclick="calcInput('0')">0</button>
            <button class="sci-calc__btn" onclick="calcInput('.')">.</button>
            <button class="sci-calc__btn sci-calc__btn--op" onclick="calcInput('+')">+</button>
            <button class="sci-calc__btn sci-calc__btn--op" onclick="calcInput('^')">^</button>
            <button class="sci-calc__btn sci-calc__btn--clear" onclick="calcClear()">C</button>
            <button class="sci-calc__btn sci-calc__btn--eq" onclick="calcEqual()">=</button>
            <button class="sci-calc__btn sci-calc__btn--func" onclick="calcFunc('pi')">π</button>
            <button class="sci-calc__btn sci-calc__btn--func" onclick="calcFunc('e')">e</button>
          </div>
        </div>
      </div>
    </section>

    <!-- פוסטים -->
    <main id="posts" class="posts-section" aria-label="כל הפוסטים">
      <div class="container">
        <div class="posts-section__header">
          <h2 class="posts-section__title">
            📖 כל הפוסטים
            <span class="posts-section__count">(${filtered.length})</span>
          </h2>
          <p class="posts-section__subtitle">כי ירין כתב המון ואתם תקראו הכל!!!</p>
        </div>
        <div class="filter-bar" role="group" aria-label="סנן לפי קטגוריה">${filterHTML}</div>
        <div class="sort-bar" role="group" aria-label="מיון פוסטים">
          <span class="sort-bar__label">🔀 מיון:</span>
          <button class="sort-btn ${currentSort === 'date' ? 'active' : ''}" onclick="setSort('date')">📅 סדר פרסום</button>
          <button class="sort-btn ${currentSort === 'popular' ? 'active' : ''}" onclick="setSort('popular')">🔥 פופולריות</button>
          <button class="sort-btn ${currentSort === 'algorithm' ? 'active' : ''}" onclick="setSort('algorithm')">🧠 אלגוריתם חכם</button>
        </div>
        <div class="posts-grid" aria-live="polite">${gridHTML}</div>
      </div>
    </main>`

  document.getElementById('main-content').innerHTML = html
  document.getElementById('nav-home').classList.add('active')
}

function setFilter(f) {
  track('filter_change', { filter_category: f })
  currentFilter = f
  renderHome()
  // גלילה לרשימה
  setTimeout(() => {
    document.getElementById('posts')?.scrollIntoView({ behavior: 'smooth' })
  }, 50)
}

// ============================================================
// עמוד פוסט
// ============================================================

function renderPost(slug) {
  const post = POSTS.find(p => p.slug === slug)
  document.getElementById('nav-home').classList.remove('active')

  if (!post) {
    document.getElementById('main-content').innerHTML = `
      <div class="post-404__content container" style="padding:80px 20px; text-align:center; display:flex; flex-direction:column; align-items:center; gap:24px;">
        <span style="font-size:5rem; display:inline-block; animation:wiggle 1s infinite;">😱</span>
        <h1 style="font-size:2rem; font-weight:900;">אוי!!! הפוסט לא נמצא!!!</h1>
        <p style="color:var(--muted)">ירין אולי מחק אותו. או שהוא מעולם לא היה. קסם.</p>
        <button class="post-404__btn" onclick="navigate(null)" style="background:linear-gradient(135deg,var(--primary),var(--secondary));color:white;font-weight:800;padding:12px 32px;border-radius:9999px;border:none;cursor:pointer;font-size:1rem;">← חזרה לבית</button>
      </div>`
    return
  }

  document.title = post.title + ' — הבלוג של ירין'

  const paragraphs = post.content.map(p => `<p class="post-content__para">${esc(p)}</p>`).join('')

  const html = `
    <!-- כותרת -->
    <header class="post-header post-header--${esc(post.colorClass)}" aria-label="כותרת הפוסט">
      <div class="container">
        <button class="post-back-btn" onclick="navigate(null)" aria-label="חזרה לכל הפוסטים">
          ← חזרה לבלוג
        </button>
        <div class="post-header__meta">
          <span class="post-header__category cat--${esc(post.colorClass)}">${esc(post.categoryEmoji)} ${esc(post.category)}</span>
          ${post.author ? `<span class="post-header__author">✍️ מאת: ${esc(post.author)}</span>` : ''}
        </div>
        <h1 class="post-header__title">${esc(post.title)}</h1>
        <p class="post-header__teaser">${esc(post.teaser)}</p>
      </div>
    </header>

    <!-- תמונה ראשית -->
    <div class="post-featured-img">
      <div class="container">
        <figure>
          <img src="${esc(post.mainImage.src)}" alt="${esc(post.mainImage.alt)}" />
          <figcaption>${esc(post.mainImage.alt)}</figcaption>
        </figure>
      </div>
    </div>

    <!-- תוכן -->
    <div class="post-content">
      <div class="container">
        <div class="post-content__body">${paragraphs}</div>
        ${renderGallery(post.images)}
        <div class="post-nav">
          <button class="post-nav__btn" onclick="navigate(null)">
            <span aria-hidden="true">🏠</span>
            <span>חזרה לכל הפוסטים</span>
          </button>
        </div>
      </div>
    </div>

    <!-- תגובות -->
    <section class="comments-section" aria-label="תגובות">
      <div class="container">
        <h2 class="comments-section__title">💬 תגובות</h2>
        <div class="comment-form-wrap" id="comment-form-root">
          <div class="comment-form">
            <input type="text" id="comment-author" class="comment-form__input" placeholder="השם שלך (אופציונלי)" maxlength="50" />
            <textarea id="comment-text" class="comment-form__textarea" placeholder="כתבו תגובה..." rows="3" maxlength="1000"></textarea>
            <button class="comment-form__btn" onclick="submitComment('${esc(post.slug)}', null)">📤 שלח תגובה</button>
          </div>
        </div>
        <div id="comments-list" class="comments-list"></div>
      </div>
    </section>

    ${renderRelated(post)}`

  document.getElementById('main-content').innerHTML = html
  window.scrollTo(0, 0)

  // הכנת לייטבוקס
  lightboxImages = post.images || []

  // רינדור תגובות
  renderComments(post.slug)
}

// ============================================================
// תגובות — רינדור ושליחה
// ============================================================

function renderComments(slug) {
  const comments = getComments(slug)
  const list = document.getElementById('comments-list')
  if (!list) return

  // Build tree
  const roots = comments.filter(c => !c.parentId)
  const children = (parentId) => comments.filter(c => c.parentId === parentId)

  function renderSingleComment(c, depth) {
    const replies = children(c.id)
    const depthClass = depth > 0 ? 'comment--reply' : ''
    const indent = Math.min(depth, 3) * 24

    return `
      <div class="comment ${depthClass}" style="margin-right:${indent}px" id="comment-${c.id}">
        <div class="comment__header">
          <span class="comment__author">${esc(c.author)}</span>
          <span class="comment__date">${esc(c.date)}</span>
        </div>
        <p class="comment__text">${esc(c.text)}</p>
        <div class="comment__actions">
          <button class="comment__vote comment__vote--up" onclick="handleVote('${esc(slug)}','${c.id}','up')">👍 <span>${c.upvotes || 0}</span></button>
          <button class="comment__vote comment__vote--down" onclick="handleVote('${esc(slug)}','${c.id}','down')">👎 <span>${c.downvotes || 0}</span></button>
          <button class="comment__reply-btn" onclick="showReplyForm('${esc(slug)}','${c.id}')">↩️ הגב</button>
        </div>
        <div id="reply-form-${c.id}" class="reply-form-slot"></div>
        ${replies.map(r => renderSingleComment(r, depth + 1)).join('')}
      </div>`
  }

  const totalCount = comments.length
  list.innerHTML = (totalCount === 0
    ? '<p class="comments-empty">אין תגובות עדיין. היו הראשונים! 🎉</p>'
    : roots.map(c => renderSingleComment(c, 0)).join(''))
}

function submitComment(slug, parentId) {
  let authorEl, textEl
  if (parentId) {
    const form = document.getElementById('reply-form-' + parentId)
    authorEl = form.querySelector('.reply-author')
    textEl = form.querySelector('.reply-text')
  } else {
    authorEl = document.getElementById('comment-author')
    textEl = document.getElementById('comment-text')
  }
  const text = textEl.value.trim()
  if (!text) { textEl.style.borderColor = '#ff4444'; return }
  const author = authorEl.value.trim() || 'אנונימי'
  addComment(slug, author, text, parentId)
  track('comment_submit', { post_slug: slug, is_reply: !!parentId, author_name: author })
  if (!parentId) { authorEl.value = ''; textEl.value = '' }
  renderComments(slug)
}

function showReplyForm(slug, parentId) {
  const slot = document.getElementById('reply-form-' + parentId)
  if (!slot || slot.innerHTML.trim()) { slot.innerHTML = ''; return } // toggle
  slot.innerHTML = `
    <div class="comment-form comment-form--reply">
      <input type="text" class="comment-form__input reply-author" placeholder="השם שלך" maxlength="50" />
      <textarea class="comment-form__textarea reply-text" placeholder="כתבו תגובה..." rows="2" maxlength="1000"></textarea>
      <button class="comment-form__btn comment-form__btn--reply" onclick="submitComment('${esc(slug)}','${parentId}')">📤 שלח</button>
    </div>`
}

function handleVote(slug, commentId, direction) {
  track('comment_vote', { post_slug: slug, vote_direction: direction })
  voteComment(slug, commentId, direction)
  renderComments(slug)
}

// ============================================================
// לוח הכפל
// ============================================================

function toggleMultTable() {
  const section = document.getElementById('mult-table-section')
  const isHidden = section.classList.contains('mult-table--hidden')
  track('mult_table_toggle', { action: isHidden ? 'open' : 'close' })
  if (isHidden) {
    section.classList.remove('mult-table--hidden')
    section.scrollIntoView({ behavior: 'smooth' })
  } else {
    section.classList.add('mult-table--hidden')
  }
}

function buildMultTable() {
  const colors = [
    '#8B5CF6','#6366F1','#3B82F6','#06B6D4','#10B981',
    '#84CC16','#EAB308','#F97316','#EF4444','#EC4899'
  ]
  let html = '<table class="mult-table__grid"><thead><tr><th class="mult-table__corner">×</th>'
  for (let j = 1; j <= 10; j++) {
    html += `<th class="mult-table__head" style="background:${colors[j-1]}">${j}</th>`
  }
  html += '</tr></thead><tbody>'
  for (let i = 1; i <= 10; i++) {
    html += `<tr><th class="mult-table__row-head" style="background:${colors[i-1]}">${i}</th>`
    for (let j = 1; j <= 10; j++) {
      const val = i * j
      const mix = colors[Math.floor((i + j - 2) / 2) % colors.length]
      html += `<td class="mult-table__cell" style="background:${mix}22; color:${mix}">${val}</td>`
    }
    html += '</tr>'
  }
  html += '</tbody></table>'
  return html
}

// ============================================================
// לייטבוקס
// ============================================================

function openLightbox(index) {
  lightboxIndex = index
  const img = lightboxImages[index]
  track('lightbox_open', { image_index: index, image_alt: img ? img.alt : '' })
  updateLightbox()
  document.getElementById('lightbox').classList.add('open')
  document.body.style.overflow = 'hidden'
}

function closeLightbox() {
  track('lightbox_close')
  document.getElementById('lightbox').classList.remove('open')
  document.body.style.overflow = ''
}

function lightboxNext() {
  lightboxIndex = (lightboxIndex + 1) % lightboxImages.length
  updateLightbox()
}

function lightboxPrev() {
  lightboxIndex = (lightboxIndex + lightboxImages.length - 1) % lightboxImages.length
  updateLightbox()
}

function updateLightbox() {
  const img = lightboxImages[lightboxIndex]
  if (!img) return
  document.getElementById('lightbox-img').src = img.src
  document.getElementById('lightbox-img').alt = img.alt
  document.getElementById('lightbox-caption').textContent = img.alt
  document.getElementById('lightbox-counter').textContent = `${lightboxIndex + 1} / ${lightboxImages.length}`
}

// ============================================================
// ראוטר
// ============================================================

function route() {
  const slug = getSlug()
  if (slug) {
    const post = POSTS.find(p => p.slug === slug)
    track('page_view', {
      page_title: post ? post.title : slug,
      page_location: window.location.href,
      page_path: '/post/' + slug,
      content_type: 'post',
      post_category: post ? post.category : '',
      post_author: post ? (post.author || 'ירין') : ''
    })
    renderPost(slug)
  } else {
    track('page_view', {
      page_title: 'דף הבית',
      page_location: window.location.href,
      page_path: '/'
    })
    renderHome()
  }
}

// ============================================================
// אתחול
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  // האזן לשינוי hash
  window.addEventListener('hashchange', route)

  // ניווט לוגו
  document.getElementById('nav-home').addEventListener('click', () => navigate(null))
  document.getElementById('nav-logo').addEventListener('click', () => navigate(null))

  // לייטבוקס
  document.getElementById('lightbox').addEventListener('click', closeLightbox)
  document.getElementById('lightbox-content').addEventListener('click', e => e.stopPropagation())
  document.getElementById('lightbox-close').addEventListener('click', closeLightbox)
  document.getElementById('lightbox-next').addEventListener('click', lightboxNext)
  document.getElementById('lightbox-prev').addEventListener('click', lightboxPrev)

  // מקלדת
  document.addEventListener('keydown', e => {
    if (document.getElementById('lightbox').classList.contains('open')) {
      if (e.key === 'Escape') closeLightbox()
      if (e.key === 'ArrowLeft')  lightboxNext()
      if (e.key === 'ArrowRight') lightboxPrev()
    }
  })

  // מעקב קליק על קישור דפי זהב בפוטר
  const dzLink = document.querySelector('.footer__dz')
  if (dzLink) {
    dzLink.addEventListener('click', () => {
      track('footer_dapei_zahav_click', { link_url: dzLink.href })
    })
  }

  // מעקב עומק גלילה
  let scrollMilestones = { 25: false, 50: false, 75: false, 100: false }
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    if (docHeight <= 0) return
    const pct = Math.round((scrollTop / docHeight) * 100)
    for (const m of [25, 50, 75, 100]) {
      if (pct >= m && !scrollMilestones[m]) {
        scrollMilestones[m] = true
        track('scroll_depth', { percent: m, page: window.location.hash || '/' })
      }
    }
  })

  // אפס מיילסטונים בניווט
  window.addEventListener('hashchange', () => {
    scrollMilestones = { 25: false, 50: false, 75: false, 100: false }
  })

  // render ראשוני
  route()
})
