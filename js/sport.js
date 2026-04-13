// ============================================================
// ספורטוירין — עדכוני BBC Sport עם פרשנות של ירין
// ============================================================

const SPORT_RSS   = 'https://feeds.bbci.co.uk/sport/rss.xml'
const CORS_PROXY  = 'https://api.allorigins.win/get?url='

// ---- פרשנויות לפי נושא ----
const _SC = {
  football: [
    'כדורגל שוב. ירין יודע שיש כדורגל כי הכל מלא בו. ירין לא יודע כמה שחקנים יש בקבוצה. ניחוש: הרבה.',
    'שחקן כדורגל. מקבל יותר ממני בדקה אחת ממה שאני מרוויח בחודש. אני שמח בשבילו. (לא לגמרי.)',
    'תוצאה בכדורגל. ירין סקר 11 אנשים. 9 לא ידעו על מה מדובר. 2 ידעו. לא שאלתי אותם עוד.',
    'ירין פעם בעט בכדור. הכדור הלך לכיוון הלא נכון. לירין אין קשר לכדורגל. אבל הוא עוקב.',
    'קבוצת כדורגל. יש להם שם, צבעים, ואוהדים. ירין מבין את שניים מהשלושה.',
  ],
  tennis: [
    'טניס. ספורט שמשחקים עם מחבט. ירין ניסה פעם. הכדור הלך לגינה של השכן. לא שיחק מאז.',
    'שחקן טניס ניצח. ירין שמח בשבילו. ירין לא יודע מי זה. אבל שמח.',
    'מחרוזת ניקוד בטניס: 15, 30, 40, משחק. ירין חושב שמישהו המציא את זה בלילה.',
    'ירין פעם ראה טניס בטלוויזיה שלוש דקות. אחר כך החליף ערוץ. לא יכול לסלוח לעצמו.',
  ],
  cricket: [
    'קריקט. ירין שאל שבעה אנשים מה זה. אחד ניסה להסביר. לא הצליח. ירין מעריך את הניסיון.',
    'חדשות קריקט. מישהו ניצח, מישהו הפסיד. ירין מניח שהמחבט הגדול היה מעורב.',
    'קריקט שוב. ירין פתח ויקיפדיה. סגר אחרי שלושה משפטים. עדיין לא מבין. זה בסדר.',
  ],
  basketball: [
    'כדורסל! ירין אוהב כדורסל. ירין גבוה 1.72. לא שיחק מעולם. אבל אוהב.',
    'NBA. ירין יודע שה-NBA זה כדורסל, ויש בו שחקנים גבוהים. זה כל הידע.',
    'ירין פעם זרק כדור לסל. נכנס. הלך לאכול. לא חזר למגרש. חיים קצרים.',
  ],
  rugby: [
    'רוגבי. אנשים גדולים רצים אחד על השני. ירין לא רץ אחרי אף אחד. לא מעולם.',
    'תוצאת רוגבי. ירין לא בטוח מי ניצח, אבל בטוח שמישהו כואב.',
    'רוגבי. צורת הכדור לא עגולה ולא שקולה. כמו הרבה דברים בחיים.',
  ],
  cycling: [
    'אופניים! לירין יש אופניים. הם עומדים בחדר מאז 2019. ביחד הם עוברים את הזמן.',
    'מרוץ אופניים. 200 ק"מ. ירין רכב פעם 4 ק"מ. ישב שלושה ימים אחר כך.',
    'רוכב אופניים עלה מהר. ירין פעם עלה מעלה ברחוב. הוא עדיין מספר על זה.',
  ],
  boxing: [
    'אגרוף. שני אנשים מכים אחד את השני ובסוף אחד נופל. ירין לא הכריז מעולם. לא מתכנן.',
    'קרב אגרוף. ירין מסכים שזה ספורט. ירין לא מסכים שהוא ינסה.',
    'ירין פעם הכה בכרית. הכרית לא הגיבה. כנראה שלירין יש ידיים רכות מדי לאגרוף.',
  ],
  golf: [
    'גולף. ספורט שמכים בו כדור קטן עם מקל. ירין חושב שזה נשמע קל. ירין טועה.',
    'גולף. ירין לא מבין למה שמים דגל בחור. זה לא עוזר ולא מסביר הרבה. אבל הדגל שם.',
    'שחקן גולף. מרוויח הרבה כסף, מכה כדור קטן. ירין חושב על זה יותר מדי.',
  ],
  formula: [
    'פורמולה 1. מכוניות מהירות מאוד. ירין נוסע ב-90 בשעה ומרגיש מהיר. הוא טועה.',
    'מרוץ F1. ירין פתח עיניים: מכונית. מכונית. מכונית. סיום. חזר לחיים.',
    'Formula 1. ירין לא יודע למה חלק נכנסים לפיט-סטופ וחלק לא. שאלה פתוחה.',
  ],
  injury: [
    'נפגע. זה קורה כשמתאמנים יותר מדי. לכן ירין לא מתאמן. זו אסטרטגיה.',
    'פציעה. לירין יש כאב גב. הוא לא מקצוען. אבל הכאב מקצועי לחלוטין.',
    'שחקן נפצע. ירין שולח החלמה מהירה. גם לו כאב הרגל פעם. מהמדרגות.',
  ],
  transfer: [
    'העברת שחקן. סכום גדול מאוד של כסף. ירין מנסה להמשיך עם חייו.',
    'שחקן עבר קבוצה. ירין גם עבר דירה פעם. לא קיבל כסף. אולי הוא עשה משהו לא בסדר.',
    'חוזה חדש. ירין גם חתם על חוזה שכירות פעם. לא קיבל פרסום. לא מתלונן.',
  ],
  default: [
    'ירין קרא את הכותרת הזו שלוש פעמים. בפעם הרביעית הלך לשתות קפה.',
    'מעניין מאוד. ירין לא בטוח למה, אבל בטוח שמשהו קרה וזה כנראה חשוב.',
    'עדכון ספורט. ירין ממשיך לחיות את חייו עם המידע החדש הזה. משהו השתנה בפנים. לא ברור מה.',
    'ירין רוצה לציין שגם הוא ספורטאי. הוא עשה 3 שכיבות סמיכה השבוע. בהפסקות.',
    'זה קרה. ירין יודע שזה קרה. ירין מעביר את המידע הלאה ללא אחריות.',
    'כן. זה. בדיוק זה. ירין תמיד ידע שזה יקרה. (ירין לא ידע.)',
    'ירין חשב על התגובה הנכונה לחדשה הזאת. הוא עדיין חושב. הוא יודיע.',
    'ספורט. ירין יודע שהוא קורה. ירין מתעד. ירין לא משנה כלום.',
  ]
}

function _sportComment(title, idx) {
  const t = (title || '').toLowerCase()
  let pool
  if (/football|premier league|champions league|soccer|fa cup|world cup|fifa|uefa/.test(t)) pool = _SC.football
  else if (/tennis|wimbledon|us open|french open|australian open/.test(t))              pool = _SC.tennis
  else if (/cricket|ashes|test match|ipl/.test(t))                                     pool = _SC.cricket
  else if (/basketball|nba/.test(t))                                                   pool = _SC.basketball
  else if (/rugby/.test(t))                                                            pool = _SC.rugby
  else if (/cycl|tour de france|giro/.test(t))                                        pool = _SC.cycling
  else if (/box|knockout|\bko\b|bout/.test(t))                                        pool = _SC.boxing
  else if (/golf|masters|pga/.test(t))                                                pool = _SC.golf
  else if (/formula|f1|grand prix/.test(t))                                           pool = _SC.formula
  else if (/injur|hamstring|achilles|ligament|fracture/.test(t))                      pool = _SC.injury
  else if (/transfer|signing|signs for|joins|agrees deal|contract/.test(t))           pool = _SC.transfer
  else pool = _SC.default
  return pool[idx % pool.length]
}

function _sportDate(str) {
  if (!str) return ''
  try {
    return new Date(str).toLocaleDateString('he-IL', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    })
  } catch(e) { return str }
}

// ---- תרגום דרך Google Translate (ללא מפתח) ----
async function _translate(text) {
  if (!text || !text.trim()) return text
  const q = text.trim().slice(0, 500)
  try {
    const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=he&dt=t&q='
              + encodeURIComponent(q)
    const res  = await fetch(url)
    const data = await res.json()
    return data[0].map(part => part[0]).join('') || q
  } catch(e) { return text }
}

async function _fetchSportItems() {
  const res  = await fetch(CORS_PROXY + encodeURIComponent(SPORT_RSS))
  const data = await res.json()
  const xml  = new DOMParser().parseFromString(data.contents, 'text/xml')
  const raw  = [...xml.querySelectorAll('item')].slice(0, 20).map((item, i) => ({
    title: item.querySelector('title')?.textContent?.trim() || '',
    desc:  item.querySelector('description')?.textContent?.trim() || '',
    link:  item.querySelector('guid')?.textContent?.trim()
        || item.querySelector('link')?.textContent?.trim() || '#',
    date:  item.querySelector('pubDate')?.textContent?.trim() || '',
    thumb: item.querySelector('thumbnail')?.getAttribute('url') || '',
    idx:   i
  }))

  // תרגום מקבילי של כותרות ותיאורים
  return Promise.all(raw.map(async item => {
    const [heTitle, heDesc] = await Promise.all([
      _translate(item.title),
      _translate(item.desc)
    ])
    return { ...item, heTitle, heDesc, comment: _sportComment(item.title, item.idx), thumb: item.thumb }
  }))
}

// ---- עמוד ראשי ----
function renderSportPage() {
  document.getElementById('nav-home').classList.remove('active')
  document.getElementById('main-content').innerHTML = `
    <div class="sport-page" dir="rtl">
      <div class="sport-hero">
        <button class="sport-back" onclick="navigate(null)">→ חזרה לבלוג</button>
        <div class="sport-hero__inner">
          <h1 class="sport-title">⚽ ספורטוירין</h1>
          <p class="sport-subtitle">עדכוני ספורט ישירות מה-BBC, עם פרשנות אישית של ירין<br/>שאינה מגובה בשום ידע ספורטיבי אמיתי</p>
        </div>
      </div>
      <div class="container">
        <div id="sport-feed" class="sport-feed">
          <div class="sport-loading">
            <div class="sport-loading-icon">⚽</div>
            <p>ירין מתרגם עדכונים...<br/>הוא בודק מה קרה בעולם הספורט ומנסה להבין</p>
          </div>
        </div>
      </div>
    </div>
  `

  _fetchSportItems()
    .then(items => {
      const feed = document.getElementById('sport-feed')
      if (!feed) return
      if (!items.length) {
        feed.innerHTML = '<div class="sport-error">לא נמצאו עדכונים. ירין מאוכזב אך לא מופתע.</div>'
        return
      }
      feed.innerHTML = items.map((item, i) => `
        <article class="sport-card" style="animation-delay:${i * 0.04}s">
          <div class="sport-card__inner">
            ${item.thumb ? `<a href="${esc(item.link)}" target="_blank" rel="noopener noreferrer" class="sport-card__img-wrap">
              <img src="${esc(item.thumb)}" alt="${esc(item.heTitle || item.title)}" class="sport-card__img" loading="lazy" />
            </a>` : ''}
            <div class="sport-card__content">
              <div class="sport-card__meta">
                <span class="sport-card__num">${i + 1}</span>
                <span class="sport-card__date">${_sportDate(item.date)}</span>
              </div>
              <h2 class="sport-card__title">
                <a href="${esc(item.link)}" target="_blank" rel="noopener noreferrer">${esc(item.heTitle || item.title)}</a>
              </h2>
              <p class="sport-card__body">
                ${esc(item.heDesc || item.desc)}
                <span class="sport-card__yarin"> — ${esc(item.comment)}</span>
              </p>
            </div>
          </div>
        </article>
      `).join('')
    })
    .catch(() => {
      const feed = document.getElementById('sport-feed')
      if (feed) feed.innerHTML = `
        <div class="sport-error">
          <p>לא הצלחנו לטעון את הפיד.</p>
          <p>ירין מצטער. הוא ניסה. הוא ממשיך חייו.</p>
          <button class="sport-retry" onclick="renderSportPage()">נסה שוב</button>
        </div>
      `
    })
}
