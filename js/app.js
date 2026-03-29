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
    return arr.sort((a, b) => new Date(_getPubDate(b.slug) || 0) - new Date(_getPubDate(a.slug) || 0))
  }
  if (currentSort === 'popular') {
    // Alberto's posts first (old to new), then Yarin's
    const alberto = arr.filter(p => p.author && p.author.includes('אלברטו'))
    const yarin = arr.filter(p => !p.author || !p.author.includes('אלברטו'))
    return [...alberto, ...yarin]
  }
  if (currentSort === 'comments') {
    return arr.sort((a, b) => getComments(b.slug).length - getComments(a.slug).length)
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

// ============================================================
// מערכת תגובות אוטומטית — 50+ תגובות לכל פוסט על פני 48 שעות
// ============================================================

const _POST_PUB = {
  'rome':'2026-03-15T08:00','gan-tikva':'2026-03-16T09:00',
  'blue-falafel-eilat':'2026-03-17T10:00','beit-nekofa':'2026-03-18T07:00',
  'hummus-naji-abu-ghosh':'2026-03-19T08:30','hummus-rahmo-tel-aviv':'2026-03-20T09:00',
  'screaming-restaurant':'2026-03-21T11:00','sockmatch':'2026-03-22T10:00',
  'chachhug':'2026-03-23T08:00','hadas-lockers-gossip':'2026-03-24T12:00',
  'kotel-hummus-arafat':'2026-03-26T10:00',
  'toxic-fish-akko':'2026-03-25T09:00',
  'alberto-kohlrabi':'2026-03-27T08:00',
  'alberto-shopping-list':'2026-03-29T07:00'
}
const _AUT = [
  'עם ישראל','רק ביבי','פלפל מתוק','אוהב את המדינה','ימין חזק','שמאל מתון',
  'אין כמו בארץ','הגיע הזמן לשינוי','די כבר','הכל פוליטיקה','רק אמת','פשוט מביך',
  'אין מילים','מה נסגר','זה לא הגיוני','בושה וחרפה','אלופים','תותחים','מדהים פשוט',
  'אין עליכם','לא קונה את זה','שקר גס','איפה הצדק','יאללה כבר','הזוי לגמרי',
  'מסכים לגמרי','לא מסכים בכלל','עוד ספין','אותו סיפור','ממש ככה','חבל מאוד',
  'פשוט נכון','זה ברור','תפסיקו כבר','די לשקרים','הגיע הזמן','מישהו צריך לדבר',
  'כולם יודעים','הכל אינטרסים','ככה זה נראה','זה עצוב','אין תקווה','ממש לא',
  'תתעוררו','המצב קשה','נמאס כבר','עוד הבטחות','בלי מילים','אותו דבר','כמה אפשר',
  'איתי כהן','דוד לוי','יואב מזרחי','נועם פרץ','אורן שטרן','עדי רוזנברג',
  'מיכל גולדשטיין','יעל בן דוד','שחר אלון','רועי ברק','אייל אביטל','תמר נבון',
  'אור כץ','ניר הרשקוביץ','גיא רפאלי','שני פולק','עומר ביטון','ליאור שמש',
  'מאיה סבן','אילן דיין','עדי אוחיון','רונית חיים','דניאל אברהם','אלון שגב',
  'קרן רון','יונתן שפירא','אביב כהן','הדר לוי','רז מזרחי','הילה פרץ',
  'טל שטרן','מור רוזנברג','אדם גולדשטיין','עומרי בן דוד','ניצן אלון','רון ברק',
  'אלעד אביטל','שקד נבון','יובל כץ','תומר הרשקוביץ','אופיר רפאלי','נועה פולק',
  'אסף ביטון','גל שמש','ליה סבן','יואב דיין','איילת אוחיון','ענת חיים',
  'עידו אברהם','דור שגב','ליאת רון','אורי שפירא','בר כהן','אלמוג לוי',
  'רותם פרץ','שיר שטרן','אביתר רוזנברג','דפנה גולדשטיין','ארז בן דוד','שי אלון',
  'גלעד אביטל','מאור נבון','אלינה כץ','נדב הרשקוביץ','אורית פולק','שירי ביטון',
  'נועם שמש','תום סבן','ירון דיין','אילה אוחיון','מאי חיים','אבנר אברהם',
  'תומר שגב','אלה רון','שחר שפירא','אורן כהן','דניאלה לוי','גיא מזרחי',
  'לירון רוזנברג','נעם בן דוד','תמיר ברק','אלי אביטל','עידן כץ','איל הרשקוביץ',
  'תהל פולק','רונן דיין','עינת אוחיון','מורן שגב','גיל רון','גילי רוזנברג',
  'מאיה גולדשטיין','עומרי בן דוד','טל אלון','עידו ברק','רונית נבון','אדם כץ',
  'ליאת הרשקוביץ','שקד רפאלי','נועה פולק','אלון ביטון','רון שמש','קרן סבן',
  'עומר דיין','איילת אוחיון','שיר חיים','יובל אברהם','גיא שגב','אורן רון',
  'תמר שפירא','נדב כהן','אורית לוי','אילן מזרחי','ליה פרץ','אורי שטרן',
  'דניאל רוזנברג','אלעד גולדשטיין','עדי בן דוד','אביב אביטל','מור נבון',
  'David Cohen','Sarah Levy','Noam Ben David','Daniel Rosen','Michael Katz',
  'Rachel Stein','Jonathan Green','Emily Brown','Amit Shapira','Lior Gold',
  'Alex Johnson','Sofia Martinez','Ethan Walker','Olivia Taylor','Lucas Miller',
  'Maya Friedman','Daniel Weiss','Leah Kaplan','Noah Wilson','Emma Davis',
  'Liam Anderson','Chloe Thomas','James Moore','Ava Jackson','Benjamin Harris',
  'Isabella Martin','William Thompson','Charlotte White','Elijah Lewis','Amelia Clark',
  'Logan Hall','Mia Allen','Jacob Young','Harper King','Samuel Wright',
  'Ella Scott','Henry Adams','Grace Baker','Jack Nelson','Lily Carter',
  'Owen Mitchell','Zoe Perez','Ryan Roberts','Natalie Turner','Caleb Phillips',
  'Victoria Evans'
]

function _sh(s){let h=0;for(let i=0;i<s.length;i++){h=((h<<5)-h+s.charCodeAt(i))|0}return Math.abs(h)}
function _sr(seed){let s=seed||1;return function(){s=(s*1103515245+12345)&0x7fffffff;return s/0x7fffffff}}

function _getPubDate(slug) {
  if (_POST_PUB[slug]) return _POST_PUB[slug]
  try {
    const saved = JSON.parse(localStorage.getItem('_auto_dates') || '{}')
    if (saved[slug]) return saved[slug]
    saved[slug] = new Date().toISOString()
    localStorage.setItem('_auto_dates', JSON.stringify(saved))
    return saved[slug]
  } catch(e) { return new Date().toISOString() }
}

function _getQuotes(post) {
  const all = post.content.join(' ')
  const parts = all.split(/[.!?،]+/).map(s => s.trim()).filter(s => s.length > 10 && s.length < 70)
  return parts.length > 0 ? parts : [post.title]
}

// Combinatorial comment generator — every comment is unique
function _genText(post, rng) {
  const quotes = _getQuotes(post)
  const q1 = quotes[Math.floor(rng() * quotes.length)]
  const q2 = quotes[Math.floor(rng() * quotes.length)]
  const sq = q1.length > 45 ? q1.slice(0, 45) + '...' : q1
  const sq2 = q2.length > 40 ? q2.slice(0, 40) + '...' : q2
  const au = post.author || 'ירין'
  const title = post.title

  // Building blocks — openers, middles, closers
  const openers = [
    'וואו,','אחלה,','מדהים,','רגע,','אוקיי אז','שמעו,','חברים,',
    'אני חייב להגיד ש','לא יאמן,','בואו נדבר על זה —','תשמעו,',
    'קראתי את "'+title+'" ו','אחרי שקראתי את הכל,','בהתחלה חשבתי ש',
    'הגעתי לפה במקרה ו','מישהו שלח לי את הקישור ו','נתקלתי בכתבה הזאת ו',
    'אז ככה,','פשוט,','בקיצור,','אני ממש','לא מאמין ש','אם אני כנה,',
    'הפעם חייבים להודות ש','כל פעם שאני קורא פה',''+au+',',
  ]
  const middles = [
    'הכתבה הזאת פשוט מדהימה','הקטע על "'+sq+'" ממש דיבר אליי',
    'כל מילה פה נכונה','זה בדיוק מה שחשבתי','אני לא מסכים עם הכל',
    '"'+sq+'" — זה כל כך מדויק','אני מזדהה עם כל שורה',
    'יש פה הגזמה קלה אבל בסדר','הצחקתם אותי עם "'+sq2+'"',
    'זה מזכיר לי משהו שקרה לי','אני ממש לא בטוח לגבי "'+sq+'"',
    'הייתי שם בעצמי ואני מאשר','חבר שלי סיפר בדיוק את זה',
    'אף אחד לא כותב ככה היום','זה קורע אותי מצחוק',
    'אני חולק לגמרי על "'+sq2+'"','המון אמת בכתבה הזאת',
    'זה גורם לי לחשוב מחדש','קראתי את זה פעמיים','יש פה תובנות רציניות',
    'שיתפתי את זה עם כולם','אני לא מפסיק לדבר על "'+sq+'"',
    'הנושא הזה ממש חשוב',''+au+' פשוט יודע לכתוב','באמת נגע בי',
    'זה הדבר הכי אמיתי שקראתי היום','פשוט בול','אני חושב שחסר פה משהו',
    'הכתבה חזקה אבל "'+sq2+'" זה קצת מוגזם',''+au+' עשה עבודה מעולה',
  ]
  const closers = [
    '!!!','— ממליץ לכולם','תשתפו את זה','אני אחזור לקרוא שוב',
    'מחכה לכתבה הבאה!!!','שלחו עוד ככה','כל הכבוד '+au,
    'הלוואי שהיו עוד בלוגים כאלה','חח','פשוט תקראו',
    'עשיתם לי את היום','מישהו עוד מרגיש ככה?','❤️',
    'אבל באמת, תחשבו על זה','סוף דבר — שווה','10/10',
    'אני פשוט...','מקווה שימשיכו לכתוב','(מדבר מניסיון)',
    'תנסו בעצמכם','אין ספק','פשוט כן','— '+au+' תמשיך!!!',
    'יאללה עוד כתבה','#הבלוגשלירין','ואני אומר את זה בתור מישהו שקורא הרבה',
    ', ואני לא אומר את זה סתם','ומי שלא מסכים מוזמן להגיב',
  ]
  const emojis = ['😂','🔥','❤️','👏','💯','🤔','😍','🙌','👀','✨','💪','🎯','😱','🤣','👍']

  const opener = openers[Math.floor(rng() * openers.length)]
  const middle = middles[Math.floor(rng() * middles.length)]
  const closer = closers[Math.floor(rng() * closers.length)]
  const emoji = rng() < 0.4 ? ' ' + emojis[Math.floor(rng() * emojis.length)] : ''

  // Different structures for variety
  const structure = Math.floor(rng() * 6)
  if (structure === 0) return opener + ' ' + middle + ' ' + closer + emoji
  if (structure === 1) return middle + '. ' + closer + emoji
  if (structure === 2) return opener + ' ' + middle + emoji
  if (structure === 3) return '"' + sq + '" — ' + middle + '. ' + closer + emoji
  if (structure === 4) return opener + ' ' + middle + '. ' + middle.split(' ').slice(0,4).join(' ') + '...' + emoji
  return middle + emoji
}

// Combinatorial reply generator
function _genReply(rng) {
  const intros = ['','הממ, ','נכון, ','לא, ','כן! ','בול, ','חח, ','וואלה ','אכן, ','סבבה, ','רגע, ']
  const cores = [
    'מסכים לגמרי','בדיוק מה שחשבתי','לא נכון','אחלה תגובה','ממש לא',
    'צודק','תודה','אתה צודק','לא מסכים','נכון מאוד','יפה נאמר',
    'הצחקת אותי','דווקא יש בזה משהו','גם חשבתי ככה','כל הכבוד',
    'חבל שלא חשבתי על זה','תגובה מצוינת','לא רלוונטי','שטויות',
    'מעניין','100%','בדיוק','אתה מוזמן לכתוב בעצמך','יש לי דעה אחרת',
  ]
  const endings = ['','!!!','...','👍','😂',' לגמרי',' אבל בסדר',' חח',' 🔥',' בול']
  return intros[Math.floor(rng()*intros.length)] + cores[Math.floor(rng()*cores.length)] + endings[Math.floor(rng()*endings.length)]
}

function _autoPopulate() {
  POSTS.forEach(function(post) {
    const pubStr = _getPubDate(post.slug)
    if (!pubStr) return

    const now = Date.now()
    const pubTime = new Date(pubStr).getTime()
    const hoursSince = Math.max(0, (now - pubTime) / 3600000)

    if (hoursSince < 0.5) return

    const rngTotal = _sr(_sh(post.slug + '_total'))
    const TOTAL = 38 + Math.floor(rngTotal() * 30)
    const targetCount = Math.min(TOTAL, Math.floor(TOTAL * (1 - Math.exp(-hoursSince / 14))))
    if (targetCount < 1) return

    const slug = post.slug
    const comments = getComments(slug)
    const autoIds = new Set(comments.filter(function(c) { return c.id && String(c.id).startsWith('auto_') }).map(function(c) { return c.id }))

    if (autoIds.size >= targetCount) return

    var added = false
    for (var i = 0; i < targetCount; i++) {
      var cid = 'auto_' + slug + '_' + i
      if (autoIds.has(cid)) continue

      var rng = _sr(_sh(slug + '_c_' + i))
      var isReply = i > 5 && rng() < 0.22
      var parentIdx = Math.floor(rng() * Math.min(i, 10))

      var author = _AUT[Math.floor(rng() * _AUT.length)]
      var text = isReply ? _genReply(rng) : _genText(post, rng)

      var commentHour = (i / TOTAL) * 48 + rng() * 1.5
      var commentTime = new Date(pubTime + commentHour * 3600000)

      comments.push({
        id: cid,
        author: author,
        text: text,
        parentId: isReply ? ('auto_' + slug + '_' + parentIdx) : null,
        date: commentTime.toLocaleDateString('he-IL'),
        upvotes: Math.floor(rng() * 18),
        downvotes: Math.floor(rng() * 5),
        voted: {}
      })
      added = true
    }

    if (added) saveComments(slug, comments)
  })
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
  if (slug && slug.startsWith('shop/')) {
    track('shop_navigate', { shop_page: slug })
    window.location.hash = '#/' + slug
  } else if (slug) {
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
  const tagBadge = post.tag ? `<span class="post-card__tag tag--sponsored">📢 ${esc(post.tag)}</span>` : ''
  return `<span class="post-card__category cat--${esc(post.colorClass)}">${esc(post.categoryEmoji)} ${esc(post.category)}</span>${tagBadge}`
}

// ---- HTML כרטיס ----
function renderCard(post, delay = 0) {
  const commentCount = getComments(post.slug).length
  return `
    <div class="posts-grid__item" style="animation-delay:${delay}s">
      <article class="post-card post-card--${esc(post.colorClass)}" data-slug="${esc(post.slug)}">
        <div class="post-card__image-wrap" onclick="navigate('${esc(post.slug)}')" role="button" tabindex="0" aria-label="פתח פוסט: ${esc(post.title)}">
          <img src="${esc(post.mainImage.src)}" alt="${esc(post.mainImage.alt)}" class="post-card__image" loading="lazy" />
          <div class="post-card__image-overlay" aria-hidden="true"></div>
          ${commentCount > 0 ? `<span class="post-card__comments-badge">💬 ${commentCount}</span>` : ''}
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
          <div class="hero__stat"><span class="hero__stat-number">${POSTS.length}</span><span class="hero__stat-label">פוסטים מדהימים</span></div>
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

    <!-- באנר צ'יקי-קנטיקי -->
    ${renderChikiBanner()}

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
          <button class="sort-btn ${currentSort === 'comments' ? 'active' : ''}" onclick="setSort('comments')">💬 מספר תגובות</button>
          <button class="sort-btn ${currentSort === 'algorithm' ? 'active' : ''}" onclick="setSort('algorithm')">🧠 אלגוריתם חכם</button>
        </div>
        <div class="posts-layout">
          <div class="posts-grid" aria-live="polite">${gridHTML}</div>
          <aside class="video-banner video-banner--square" onclick="track('video_banner_click',{banner:'kolorabi-square'});navigate('shop/kolorabi')">
            <video class="video-banner__video" autoplay muted loop playsinline>
              <source src="media/kolorabi-square.mp4" type="video/mp4" />
            </video>
          </aside>
        </div>
      </div>
    </main>

    <!-- באנר וידאו סטריפ (1920x300) -->
    <section class="video-banner video-banner--strip" onclick="track('video_banner_click',{banner:'kolorabi-strip'});navigate('shop/kolorabi')">
      <video class="video-banner__video" autoplay muted loop playsinline>
        <source src="media/kolorabi-strip.mp4" type="video/mp4" />
      </video>
    </section>`

  document.getElementById('main-content').innerHTML = html
  document.getElementById('nav-home').classList.add('active')

  // מעקב חשיפת באנרים (Intersection Observer)
  setTimeout(() => {
    const banners = document.querySelectorAll('.video-banner')
    if (banners.length && 'IntersectionObserver' in window) {
      const bannerObs = new IntersectionObserver((entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            const type = e.target.classList.contains('video-banner--square') ? 'kolorabi-square' : 'kolorabi-strip'
            track('ad_impression', { banner: type, product: 'kolorabi', placement: type.includes('square') ? 'sidebar' : 'bottom_strip' })
            bannerObs.unobserve(e.target)
          }
        })
      }, { threshold: 0.5 })
      banners.forEach(b => bannerObs.observe(b))
    }
  }, 100)
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
          ${post.tag ? `<span class="post-header__tag tag--sponsored">📢 ${esc(post.tag)}</span>` : ''}
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
  const easterEggs = {
    30: 'https://www.foodsdictionary.co.il/tag/recipes-with-kohlrabi',
    10: 'https://www.youtube.com/watch?v=m30TiyJE28s',
    1: 'https://youtu.be/RnurK4_jmoI?si=c2xgywGo_-2ZCny5&t=4'
  }
  for (let i = 1; i <= 10; i++) {
    html += `<tr><th class="mult-table__row-head" style="background:${colors[i-1]}">${i}</th>`
    for (let j = 1; j <= 10; j++) {
      const val = i * j
      const mix = colors[Math.floor((i + j - 2) / 2) % colors.length]
      const egg = easterEggs[val]
      if (egg) {
        html += `<td class="mult-table__cell mult-table__cell--link" style="background:${mix}22; color:${mix}" onclick="track('mult_table_easter_egg',{value:${val},calc:'${i}x${j}',url:'${egg}'});window.open('${egg}','_blank')">${val}</td>`
      } else {
        html += `<td class="mult-table__cell" style="background:${mix}22; color:${mix}">${val}</td>`
      }
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
// עמוד חנות קולורבי
// ============================================================

function renderShop() {
  document.title = 'חנות קולורבי — הבלוג של ירין'
  document.getElementById('nav-home').classList.remove('active')

  let shopState = 'browse' // browse | cart | checkout | payment | oos
  let qty = 1

  const html = `
    <section class="shop" aria-label="חנות קולורבי">
      <div class="container">
        <button class="shop__back" onclick="navigate(null)">→ חזרה לבלוג</button>
        <div id="shop-view"></div>
      </div>
    </section>`

  document.getElementById('main-content').innerHTML = html
  window.scrollTo(0, 0)

  function renderView() {
    const view = document.getElementById('shop-view')
    if (!view) return

    if (shopState === 'browse') {
      track('view_item', { product: 'kolorabi', price: 4.9, currency: 'ILS' })
      view.innerHTML = `
        <div class="shop__product">
          <div class="shop__img-wrap">
            <img src="media/kolorabi-product.png" alt="קולורבי טרי ואיכותי" class="shop__img" />
          </div>
          <div class="shop__details">
            <span class="shop__badge">🥬 מוצר חם!!!</span>
            <h1 class="shop__title">קולורבי טרי מהשדה</h1>
            <p class="shop__desc">קולורבי אורגני, טרי, ישר מהשדה לצלחת שלכם!!! הקולורבי הכי טוב שתמצאו בכל הארץ. מושלם לסלט, לבישול, או סתם לנשנוש בריא!!!</p>
            <div class="shop__price">₪4.90 <small>ליחידה</small></div>
            <div class="shop__qty-row">
              <label class="shop__qty-label">כמות:</label>
              <button class="shop__qty-btn" id="qty-minus">−</button>
              <span class="shop__qty-val" id="qty-display">${qty}</span>
              <button class="shop__qty-btn" id="qty-plus">+</button>
            </div>
            <div class="shop__total">סה״כ: <strong>₪${(qty * 4.9).toFixed(2)}</strong></div>
            <button class="shop__add-btn" id="add-to-cart">🛒 הוסף לסל</button>
          </div>
        </div>`
      document.getElementById('qty-minus').onclick = () => { if (qty > 1) { qty--; track('shop_quantity_change', { product: 'kolorabi', quantity: qty - 1, direction: 'decrease' }); renderView() } }
      document.getElementById('qty-plus').onclick = () => { if (qty < 99) { qty++; track('shop_quantity_change', { product: 'kolorabi', quantity: qty + 1, direction: 'increase' }); renderView() } }
      document.getElementById('add-to-cart').onclick = () => {
        track('shop_add_to_cart', { product: 'kolorabi', quantity: qty })
        shopState = 'cart'; renderView()
      }
    }

    else if (shopState === 'cart') {
      track('view_cart', { product: 'kolorabi', quantity: qty, subtotal: (qty * 4.9).toFixed(2), shipping: '15.00', total: (qty * 4.9 + 15).toFixed(2), currency: 'ILS' })
      view.innerHTML = `
        <div class="shop__cart">
          <h2 class="shop__step-title">🛒 הסל שלך</h2>
          <div class="shop__cart-item">
            <img src="media/kolorabi-product.png" alt="קולורבי" class="shop__cart-img" />
            <div class="shop__cart-info">
              <strong>קולורבי טרי מהשדה</strong>
              <p>כמות: ${qty} | ₪${(qty * 4.9).toFixed(2)}</p>
            </div>
          </div>
          <div class="shop__cart-summary">
            <div class="shop__cart-line"><span>סכום ביניים</span><span>₪${(qty * 4.9).toFixed(2)}</span></div>
            <div class="shop__cart-line"><span>משלוח</span><span>₪15.00</span></div>
            <div class="shop__cart-line shop__cart-total"><span>סה״כ</span><span>₪${(qty * 4.9 + 15).toFixed(2)}</span></div>
          </div>
          <button class="shop__add-btn" id="go-checkout">💳 המשך לתשלום</button>
          <button class="shop__link-btn" id="back-browse">← חזרה למוצר</button>
        </div>`
      document.getElementById('go-checkout').onclick = () => {
        track('shop_begin_checkout', { product: 'kolorabi', quantity: qty, total: (qty * 4.9 + 15).toFixed(2) })
        shopState = 'checkout'; renderView()
      }
      document.getElementById('back-browse').onclick = () => { track('shop_back_navigation', { from: 'cart', to: 'browse' }); shopState = 'browse'; renderView() }
    }

    else if (shopState === 'checkout') {
      track('checkout_shipping_step', { product: 'kolorabi', quantity: qty, total: (qty * 4.9 + 15).toFixed(2), currency: 'ILS' })
      view.innerHTML = `
        <div class="shop__checkout">
          <h2 class="shop__step-title">📦 פרטי משלוח</h2>
          <form class="shop__form" id="checkout-form">
            <div class="shop__field">
              <label>שם מלא</label>
              <input type="text" placeholder="ירין הגדול" required />
            </div>
            <div class="shop__field">
              <label>טלפון</label>
              <input type="tel" placeholder="050-1234567" required />
            </div>
            <div class="shop__field">
              <label>כתובת למשלוח</label>
              <input type="text" placeholder="רחוב הקולורבי 7, תל אביב" required />
            </div>
            <div class="shop__field">
              <label>עיר</label>
              <input type="text" placeholder="תל אביב" required />
            </div>
            <div class="shop__field">
              <label>מיקוד</label>
              <input type="text" placeholder="6100000" />
            </div>
            <div class="shop__cart-summary">
              <div class="shop__cart-line shop__cart-total"><span>סה״כ לתשלום</span><span>₪${(qty * 4.9 + 15).toFixed(2)}</span></div>
            </div>
            <button type="submit" class="shop__add-btn">💳 המשך לתשלום</button>
            <button type="button" class="shop__link-btn" id="back-cart">← חזרה לסל</button>
          </form>
        </div>`
      document.getElementById('checkout-form').onsubmit = (e) => {
        e.preventDefault()
        track('add_shipping_info', { product: 'kolorabi', quantity: qty, total: (qty * 4.9 + 15).toFixed(2), currency: 'ILS' })
        shopState = 'payment'; renderView()
      }
      document.getElementById('back-cart').onclick = () => { track('shop_back_navigation', { from: 'checkout', to: 'cart' }); shopState = 'cart'; renderView() }
    }

    else if (shopState === 'payment') {
      track('checkout_payment_step', { product: 'kolorabi', quantity: qty, total: (qty * 4.9 + 15).toFixed(2), currency: 'ILS' })
      view.innerHTML = `
        <div class="shop__checkout">
          <h2 class="shop__step-title">💳 פרטי תשלום</h2>
          <form class="shop__form" id="payment-form">
            <div class="shop__field">
              <label>מספר כרטיס אשראי</label>
              <input type="text" placeholder="1234 5678 9012 3456" maxlength="19" required />
            </div>
            <div class="shop__field-row">
              <div class="shop__field">
                <label>תוקף</label>
                <input type="text" placeholder="MM/YY" maxlength="5" required />
              </div>
              <div class="shop__field">
                <label>CVV</label>
                <input type="text" placeholder="123" maxlength="4" required />
              </div>
            </div>
            <div class="shop__field">
              <label>שם בעל הכרטיס</label>
              <input type="text" placeholder="ירין קרנבל" required />
            </div>
            <div class="shop__cart-summary">
              <div class="shop__cart-line shop__cart-total"><span>סה״כ לחיוב</span><span>₪${(qty * 4.9 + 15).toFixed(2)}</span></div>
            </div>
            <button type="submit" class="shop__add-btn shop__pay-btn">🔒 שלם ₪${(qty * 4.9 + 15).toFixed(2)}</button>
            <button type="button" class="shop__link-btn" id="back-checkout">← חזרה לפרטי משלוח</button>
          </form>
        </div>`
      document.getElementById('payment-form').onsubmit = (e) => {
        e.preventDefault()
        track('add_payment_info', { product: 'kolorabi', quantity: qty, total: (qty * 4.9 + 15).toFixed(2), currency: 'ILS' })
        track('purchase_attempt', { product: 'kolorabi', quantity: qty, total: (qty * 4.9 + 15).toFixed(2), currency: 'ILS' })
        // "Processing" then OOS
        const btn = view.querySelector('.shop__pay-btn')
        btn.textContent = '⏳ מעבד תשלום...'
        btn.disabled = true
        setTimeout(() => { shopState = 'oos'; renderView() }, 2000)
      }
      document.getElementById('back-checkout').onclick = () => { track('shop_back_navigation', { from: 'payment', to: 'checkout' }); shopState = 'checkout'; renderView() }
    }

    else if (shopState === 'oos') {
      track('purchase_failed_oos', { product: 'kolorabi', quantity: qty, total: (qty * 4.9 + 15).toFixed(2), currency: 'ILS', reason: 'out_of_stock' })
      view.innerHTML = `
        <div class="shop__oos">
          <img src="media/crying.png" alt="קולורבי בוכה" class="shop__oos-emoji" />
          <h2 class="shop__oos-title">אוי לא!!! המלאי אזל!!!</h2>
          <p class="shop__oos-text">מצטערים מאוד!!! הקולורבי הטרי שלנו אזל מהמלאי. כנראה שיותר מדי אנשים גילו כמה הוא טעים!!!</p>
          <p class="shop__oos-text">השאירו מייל ונעדכן אתכם ברגע שיגיעו קולורבי חדשים מהשדה! 🌱</p>
          <form class="shop__email-form" id="oos-email-form">
            <div class="shop__email-row">
              <input type="email" class="shop__email-input" placeholder="your@email.com" required />
              <button type="submit" class="shop__email-btn">📩 עדכנו אותי!</button>
            </div>
          </form>
          <div id="oos-success" class="shop__oos-success" style="display:none">
            <span>✅</span>
            <p>תודה רבה!!! נעדכן אתכם ברגע שהקולורבי חוזר למלאי!!!</p>
          </div>
          <button class="shop__link-btn" onclick="navigate(null)" style="margin-top:24px">← חזרה לבלוג</button>
        </div>`
      document.getElementById('oos-email-form').onsubmit = (e) => {
        e.preventDefault()
        const email = e.target.querySelector('input').value
        track('shop_restock_signup', { email: email, product: 'kolorabi' })
        // Save email to localStorage
        const emails = JSON.parse(localStorage.getItem('kolorabi_emails') || '[]')
        emails.push({ email: email, date: new Date().toISOString() })
        localStorage.setItem('kolorabi_emails', JSON.stringify(emails))
        e.target.style.display = 'none'
        document.getElementById('oos-success').style.display = 'flex'
      }
    }
  }

  renderView()
}

// ============================================================
// פאנל אדמין (סיסמה: falafel emoji בפוטר)
// ============================================================

function openAdminPanel() {
  const pass = prompt('🔒 הזן סיסמת אדמין:')
  if (pass !== 'melafefon18') {
    if (pass !== null) alert('סיסמה שגויה!!!')
    return
  }

  track('admin_panel_open')

  // Collect all comments
  let commentsHTML = ''
  let totalComments = 0
  const postCommentData = []
  POSTS.forEach(post => {
    const comments = getComments(post.slug)
    if (comments.length === 0) return
    totalComments += comments.length
    const realCount = comments.filter(c => !(c.id && c.id.toString().startsWith('auto_'))).length
    const autoCount = comments.length - realCount
    const rows = comments.map(c => {
      const isAuto = c.id && c.id.toString().startsWith('auto_')
      return `<tr>
        <td>${esc(c.author)}</td>
        <td class="admin__comment-text">${esc(c.text).slice(0, 80)}${c.text.length > 80 ? '...' : ''}</td>
        <td>${c.date || '—'}</td>
        <td>${c.parentId ? 'תגובה' : 'ראשי'}</td>
        <td>👍${c.upvotes || 0} 👎${c.downvotes || 0}</td>
        <td>${isAuto ? '🤖' : '👤'}</td>
      </tr>`
    }).join('')
    commentsHTML += `
      <div class="admin__accordion" data-slug="${esc(post.slug)}">
        <button class="admin__accordion-btn" onclick="this.parentElement.classList.toggle('open')">
          <span class="admin__accordion-title">${esc(post.categoryEmoji)} ${esc(post.title)}</span>
          <span class="admin__accordion-meta">💬 ${comments.length} <small>(👤${realCount} 🤖${autoCount})</small></span>
          <span class="admin__accordion-arrow">◀</span>
        </button>
        <div class="admin__accordion-body">
          <table class="admin__table">
            <thead><tr><th>שם</th><th>תגובה</th><th>תאריך</th><th>סוג</th><th>הצבעות</th><th>מקור</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>`
  })

  // Collect emails
  const emails = JSON.parse(localStorage.getItem('kolorabi_emails') || '[]')
  const emailsHTML = emails.length > 0
    ? `<table class="admin__table">
        <thead><tr><th>#</th><th>אימייל</th><th>תאריך הרשמה</th></tr></thead>
        <tbody>${emails.map((e, i) => `<tr><td>${i + 1}</td><td>${esc(e.email)}</td><td>${new Date(e.date).toLocaleString('he-IL')}</td></tr>`).join('')}</tbody>
       </table>`
    : '<p class="admin__empty">אין אימיילים רשומים עדיין</p>'

  // Collect visits
  const visits = JSON.parse(localStorage.getItem('site_visits') || '{}')
  const visitDays = Object.keys(visits).sort().reverse()
  const totalVisits = Object.values(visits).reduce((a, b) => a + b, 0)
  const visitsHTML = visitDays.length > 0
    ? `<table class="admin__table">
        <thead><tr><th>תאריך</th><th>צפיות</th><th>גרף</th></tr></thead>
        <tbody>${visitDays.map(d => {
          const v = visits[d]
          const maxV = Math.max(...Object.values(visits))
          const barW = Math.max(5, Math.round((v / maxV) * 100))
          return `<tr><td>${d}</td><td>${v}</td><td><div class="admin__bar" style="width:${barW}%"></div></td></tr>`
        }).join('')}</tbody>
       </table>`
    : '<p class="admin__empty">אין נתוני ביקורים עדיין</p>'

  const html = `
    <section class="admin" aria-label="פאנל אדמין">
      <div class="container">
        <div class="admin__header">
          <h1 class="admin__title">🔒 פאנל אדמין</h1>
          <button class="admin__close" onclick="window.location.hash='#/';renderHome()">✕ סגור</button>
        </div>

        <div class="admin__stats">
          <div class="admin__stat-card">
            <span class="admin__stat-num">${totalComments}</span>
            <span class="admin__stat-label">💬 תגובות</span>
          </div>
          <div class="admin__stat-card">
            <span class="admin__stat-num">${emails.length}</span>
            <span class="admin__stat-label">📩 אימיילים</span>
          </div>
          <div class="admin__stat-card">
            <span class="admin__stat-num">${totalVisits}</span>
            <span class="admin__stat-label">👁️ צפיות</span>
          </div>
          <div class="admin__stat-card">
            <span class="admin__stat-num">${visitDays.length}</span>
            <span class="admin__stat-label">📅 ימים פעילים</span>
          </div>
        </div>

        <div class="admin__section">
          <h2 class="admin__section-title">👁️ ביקורים באתר</h2>
          <p class="admin__note">סה״כ ${totalVisits} צפיות ב-${visitDays.length} ימים (מבוסס על דפדפן מקומי)</p>
          ${visitsHTML}
        </div>

        <div class="admin__section">
          <h2 class="admin__section-title">📩 אימיילים — רשימת המתנה לקולורבי</h2>
          <p class="admin__note">${emails.length} נרשמים</p>
          ${emailsHTML}
        </div>

        <div class="admin__section">
          <h2 class="admin__section-title">💬 תגובות לפי כתבות</h2>
          <p class="admin__note">${totalComments} תגובות ב-${POSTS.length} כתבות (🤖 = אוטומטי, 👤 = אמיתי)</p>
          ${commentsHTML || '<p class="admin__empty">אין תגובות עדיין</p>'}
        </div>

        <div class="admin__section">
          <h2 class="admin__section-title">🗑️ כלי ניהול</h2>
          <div class="admin__actions">
            <button class="admin__action-btn admin__action-btn--danger" id="admin-clear-comments">מחק את כל התגובות</button>
            <button class="admin__action-btn admin__action-btn--danger" id="admin-clear-emails">מחק את כל האימיילים</button>
            <button class="admin__action-btn" id="admin-clear-visits">אפס נתוני ביקורים</button>
            <button class="admin__action-btn" id="admin-export">📋 ייצא הכל (JSON)</button>
          </div>
        </div>

      </div>
    </section>`

  document.getElementById('main-content').innerHTML = html

  // Admin action handlers
  document.getElementById('admin-clear-comments').onclick = () => {
    if (confirm('בטוח? זה ימחק את כל התגובות!!!')) {
      POSTS.forEach(p => localStorage.removeItem('comments_' + p.slug))
      localStorage.removeItem('_auto_dates')
      openAdminPanel()
    }
  }
  document.getElementById('admin-clear-emails').onclick = () => {
    if (confirm('בטוח? זה ימחק את כל האימיילים!!!')) {
      localStorage.removeItem('kolorabi_emails')
      openAdminPanel()
    }
  }
  document.getElementById('admin-clear-visits').onclick = () => {
    if (confirm('בטוח? זה יאפס את נתוני הביקורים!!!')) {
      localStorage.removeItem('site_visits')
      openAdminPanel()
    }
  }
  document.getElementById('admin-export').onclick = () => {
    const data = { comments: {}, emails: emails, visits: visits }
    POSTS.forEach(p => { data.comments[p.slug] = getComments(p.slug) })
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = 'yarin-blog-admin-export-' + new Date().toISOString().slice(0,10) + '.json'
    a.click()
  }

  window.scrollTo(0, 0)
}

// ============================================================
// ראוטר
// ============================================================

function _trackVisit() {
  const today = new Date().toISOString().slice(0, 10)
  const visits = JSON.parse(localStorage.getItem('site_visits') || '{}')
  if (!visits[today]) visits[today] = 0
  visits[today]++
  localStorage.setItem('site_visits', JSON.stringify(visits))
}

function route() {
  _autoPopulate() // auto-generate comments silently
  _trackVisit()
  const hash = window.location.hash

  // צ'יקי-קנטיקי
  if (hash === '#/chiki-kantiki') {
    renderChikiPage()
    return
  }

  // Shop pages
  if (hash.startsWith('#/shop/')) {
    track('page_view', {
      page_title: 'חנות קולורבי',
      page_location: window.location.href,
      page_path: '/shop/kolorabi'
    })
    renderShop()
    return
  }

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

  // פאנל אדמין — לחיצה על הפלאפל בפוטר
  const footerHearts = document.querySelector('.footer__hearts')
  if (footerHearts) {
    footerHearts.addEventListener('click', (e) => {
      // Check if click was near the falafel emoji
      openAdminPanel()
    })
    footerHearts.style.cursor = 'default'
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
