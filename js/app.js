// ============================================================
// הבלוג של ירין — JavaScript ראשי
// ============================================================

// ---- מצב גלובלי ----
let currentFilter = 'הכל'
let lightboxImages = []
let lightboxIndex = 0

// ---- נתיב hash ----
function getSlug() {
  const hash = window.location.hash
  if (hash.startsWith('#/post/')) return hash.slice(7)
  return null
}

function navigate(slug) {
  if (slug) {
    window.location.hash = '#/post/' + slug
  } else {
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

  const filtered = currentFilter === 'הכל'
    ? POSTS
    : POSTS.filter(p => p.category === currentFilter)

  const filters = ['הכל', 'מסעות', 'אוכל', 'רעיונות עסקיים']
  const filterEmojis = { 'הכל': '🌟', 'מסעות': '✈️', 'אוכל': '🧆', 'רעיונות עסקיים': '💡' }

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
        </h1>
        <p class="hero__subtitle">
          ברוכים הבאים לבלוג המדהים, המהנה, המרגש, והכי כייפי שנוצר אי פעם בהיסטוריה של האנושות!!!<br/>
          <strong>ירין כותב על מקומות, אוכל, ורעיונות עסקיים שישנו את העולם.</strong><br/>
          (או לפחות יצחיקו אתכם. שזה בעצם יותר חשוב.)
        </p>
        <div class="hero__stats" aria-label="עובדות על הבלוג">
          <div class="hero__stat"><span class="hero__stat-number">9</span><span class="hero__stat-label">פוסטים מדהימים</span></div>
          <div class="hero__stat"><span class="hero__stat-number">∞</span><span class="hero__stat-label">אהבה לחומוס</span></div>
          <div class="hero__stat"><span class="hero__stat-number">3</span><span class="hero__stat-label">רעיונות שישנו עולמות</span></div>
        </div>
        <button class="hero__cta" onclick="document.getElementById('posts').scrollIntoView({behavior:'smooth'})">
          <span>קראו את הפוסטים!!!</span>
          <span class="hero__cta-arrow" aria-hidden="true">👇</span>
        </button>
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
        <div class="posts-grid" aria-live="polite">${gridHTML}</div>
      </div>
    </main>`

  document.getElementById('main-content').innerHTML = html
  document.getElementById('nav-home').classList.add('active')
}

function setFilter(f) {
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

    ${renderRelated(post)}`

  document.getElementById('main-content').innerHTML = html
  window.scrollTo(0, 0)

  // הכנת לייטבוקס
  lightboxImages = post.images || []
}

// ============================================================
// לייטבוקס
// ============================================================

function openLightbox(index) {
  lightboxIndex = index
  updateLightbox()
  document.getElementById('lightbox').classList.add('open')
  document.body.style.overflow = 'hidden'
}

function closeLightbox() {
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
    renderPost(slug)
  } else {
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

  // render ראשוני
  route()
})
