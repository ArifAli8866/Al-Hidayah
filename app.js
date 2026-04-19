/* ============================================================
   AL-HIDAYAH — Main JavaScript
   Ramadan Companion Web Application
   ============================================================ */

'use strict';

// ─── CONFIG ────────────────────────────────────────────────
const API = '/api';
let TOKEN = localStorage.getItem('ah_token');
let USER  = JSON.parse(localStorage.getItem('ah_user') || 'null');

// ─── DATA ───────────────────────────────────────────────────
const SURAHS = [
  {n:1,  ar:'الفاتحة',   en:'Al-Fatihah',   v:7,   type:'Meccan',  juz:1},
  {n:2,  ar:'البقرة',    en:'Al-Baqarah',   v:286, type:'Medinan', juz:1},
  {n:3,  ar:'آل عمران',  en:"Ali 'Imran",   v:200, type:'Medinan', juz:3},
  {n:4,  ar:'النساء',    en:"An-Nisa",      v:176, type:'Medinan', juz:4},
  {n:5,  ar:'المائدة',   en:"Al-Ma'idah",   v:120, type:'Medinan', juz:6},
  {n:6,  ar:'الأنعام',   en:"Al-An'am",     v:165, type:'Meccan',  juz:7},
  {n:7,  ar:'الأعراف',   en:"Al-A'raf",     v:206, type:'Meccan',  juz:8},
  {n:9,  ar:'التوبة',    en:"At-Tawbah",    v:129, type:'Medinan', juz:10},
  {n:10, ar:'يونس',      en:"Yunus",        v:109, type:'Meccan',  juz:11},
  {n:12, ar:'يوسف',      en:"Yusuf",        v:111, type:'Meccan',  juz:12},
  {n:18, ar:'الكهف',     en:"Al-Kahf",      v:110, type:'Meccan',  juz:15},
  {n:19, ar:'مريم',      en:"Maryam",       v:98,  type:'Meccan',  juz:16},
  {n:36, ar:'يس',        en:"Ya-Sin",       v:83,  type:'Meccan',  juz:22},
  {n:55, ar:'الرحمن',    en:"Ar-Rahman",    v:78,  type:'Medinan', juz:27},
  {n:56, ar:'الواقعة',   en:"Al-Waqi'ah",   v:96,  type:'Meccan',  juz:27},
  {n:67, ar:'الملك',     en:"Al-Mulk",      v:30,  type:'Meccan',  juz:29},
  {n:78, ar:'النبأ',     en:"An-Naba",      v:40,  type:'Meccan',  juz:30},
  {n:112,ar:'الإخلاص',   en:"Al-Ikhlas",    v:4,   type:'Meccan',  juz:30},
  {n:113,ar:'الفلق',     en:"Al-Falaq",     v:5,   type:'Meccan',  juz:30},
  {n:114,ar:'الناس',     en:"An-Nas",       v:6,   type:'Meccan',  juz:30},
];

const SAMPLE_VERSES = {
  1: [
    {ar:'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ',         tr:'In the name of Allah, the Entirely Merciful, the Especially Merciful.'},
    {ar:'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',          tr:'[All] praise is [due] to Allah, Lord of the worlds —'},
    {ar:'الرَّحْمَٰنِ الرَّحِيمِ',                       tr:'The Entirely Merciful, the Especially Merciful,'},
    {ar:'مَالِكِ يَوْمِ الدِّينِ',                       tr:'Sovereign of the Day of Recompense.'},
    {ar:'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',       tr:'It is You we worship and You we ask for help.'},
    {ar:'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ',             tr:'Guide us to the straight path —'},
    {ar:'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ',        tr:'The path of those upon whom You have bestowed favor, not of those who have evoked [Your] anger or of those who are astray.'},
  ],
  112:[
    {ar:'قُلْ هُوَ اللَّهُ أَحَدٌ',                      tr:"Say, 'He is Allah, [who is] One,'"},
    {ar:'اللَّهُ الصَّمَدُ',                              tr:'Allah, the Eternal Refuge.'},
    {ar:'لَمْ يَلِدْ وَلَمْ يُولَدْ',                    tr:'He neither begets nor is born,'},
    {ar:'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ',             tr:'Nor is there to Him any equivalent.'},
  ],
};

const DUAS = [
  {k:'sehri-niyyah',    cat:'sehri',      title:'Niyyah for Fasting (Sehri)',
    ar:'وَبِصَوْمِ غَدٍ نَّوَيْتُ مِنْ شَهْرِ رَمَضَانَ',
    tr:'Wa bisawmi ghadin nawaitu min shahri Ramadhan',
    en:'I intend to keep the fast for tomorrow in the month of Ramadan.',    src:'Hadith'},
  {k:'iftar-1',         cat:'iftar',      title:'Dua for Breaking Fast',
    ar:'اللَّهُمَّ لَكَ صُمْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ',
    tr:"Allahumma laka sumtu wa 'ala rizqika aftartu",
    en:'O Allah! For You I fasted and upon Your provision I break my fast.',  src:'Abu Dawud'},
  {k:'iftar-2',         cat:'iftar',      title:'Short Iftar Dua',
    ar:'ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الأَجْرُ',
    tr:"Dhahaba al-zama' wa ibtallatil 'urooq wa thabata al-ajru",
    en:'Thirst has gone, the arteries are moist, and the reward is confirmed.',src:'Abu Dawud'},
  {k:'morning-1',       cat:'morning',    title:'Morning Remembrance',
    ar:'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ',
    tr:'Asbahna wa asbahal mulku lillahi wal hamdulillah',
    en:'We have entered the morning and the dominion belongs to Allah; all praise to Allah.',src:'Muslim'},
  {k:'evening-1',       cat:'evening',    title:'Evening Remembrance',
    ar:'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ',
    tr:'Amsayna wa amsal mulku lillahi wal hamdulillah',
    en:'We have entered the evening and the dominion belongs to Allah.', src:'Muslim'},
  {k:'laylatul-qadr',   cat:'forgiveness',title:"Laylat al-Qadr Dua",
    ar:'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
    tr:"Allahumma innaka 'afuwwun tuhibbul 'afwa fa'fu 'anni",
    en:'O Allah, You are Forgiving and love forgiveness, so forgive me.',  src:'Tirmidhi'},
  {k:'istighfar',       cat:'forgiveness',title:'Seeking Forgiveness',
    ar:'رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنتَ التَّوَّابُ الرَّحِيمُ',
    tr:"Rabbigh fir li wa tub 'alayya innaka antat-Tawwabur-Rahim",
    en:'O my Lord! Forgive me and accept my repentance.',               src:"At-Tawbah 9:118"},
  {k:'quran-286',       cat:'quran',      title:'Dua from Al-Baqarah',
    ar:'رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا',
    tr:"Rabbana la tu'akhidhna in nasina aw akhta'na",
    en:'Our Lord, do not impose blame upon us if we have forgotten or erred.',src:'Al-Baqarah 2:286'},
  {k:'taraweeh-break',  cat:'taraweeh',   title:'Taraweeh Break Dua',
    ar:'سُبْحَانَ ذِي الْمُلْكِ وَالْمَلَكُوتِ سُبْحَانَ ذِي الْعِزَّةِ',
    tr:'Subhana dhil mulki wal malakuti subhana dhil izzati',
    en:'Glory to the Owner of dominion and sovereignty.',               src:'Tradition'},
  {k:'morning-protect', cat:'morning',    title:'Morning Protection',
    ar:'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ',
    tr:"Bismillahil-ladhi la yadurru ma'as-mihi shay'un",
    en:'In the name of Allah with whose name nothing is harmed.',        src:'Abu Dawud'},
];

const RECIPES = [
  {cat:'sehri',  name:'Aloo Paratha',      desc:'Crispy stuffed flatbread with spiced potato filling',       e:'🫓', t:'30m', s:'4', d:'Easy'},
  {cat:'sehri',  name:'Fruit Yogurt Bowl', desc:'Refreshing seasonal fruits with honey yogurt for energy',   e:'🥣', t:'10m', s:'2', d:'Easy'},
  {cat:'sehri',  name:'Haleem',            desc:'Slow-cooked wheat and lentil porridge packed with protein', e:'🍲', t:'2hr', s:'6', d:'Medium'},
  {cat:'sehri',  name:'Egg Cheese Toast',  desc:'Quick high-protein toast with fried egg and cheese',        e:'🍳', t:'10m', s:'1', d:'Easy'},
  {cat:'iftar',  name:'Dates (Khajoor)',   desc:'Start Iftar with Sunnah — 3 Medjool dates as recommended',  e:'🌴', t:'0m',  s:'All',d:'Easy'},
  {cat:'iftar',  name:'Samosa Chaat',      desc:'Crispy samosas topped with yogurt and tangy chutneys',      e:'🥟', t:'45m', s:'6', d:'Medium'},
  {cat:'iftar',  name:'Chicken Karahi',    desc:'Rich aromatic Pakistani chicken curry in a wok',             e:'🍛', t:'50m', s:'5', d:'Medium'},
  {cat:'iftar',  name:'Daal Makhani',      desc:'Creamy buttery black lentils slow-cooked to perfection',    e:'🫘', t:'90m', s:'6', d:'Medium'},
  {cat:'drinks', name:'Rooh Afza Sharbat', desc:'Classic rose-flavored iced drink — the taste of Ramadan',   e:'🍹', t:'5m',  s:'4', d:'Easy'},
  {cat:'drinks', name:'Watermelon Juice',  desc:'Hydrating refreshing juice to replenish after fasting',     e:'🍉', t:'5m',  s:'3', d:'Easy'},
  {cat:'sweets', name:'Sheer Khurma',      desc:'Vermicelli pudding with dates, milk and rose water',        e:'🍮', t:'30m', s:'8', d:'Easy'},
  {cat:'sweets', name:'Kheer',             desc:'Traditional rice pudding fragrant with cardamom and saffron',e:'🥛', t:'60m', s:'6', d:'Easy'},
  {cat:'snacks', name:'Pakoras',           desc:'Golden-fried vegetable fritters — quintessential Iftar snack',e:'🧆',t:'20m', s:'6', d:'Easy'},
  {cat:'snacks', name:'Dahi Bhalle',       desc:'Lentil dumplings in cool yogurt with tangy chutneys',       e:'🥙', t:'40m', s:'6', d:'Medium'},
];

const VIDEOS = [
  {cat:'quran',    title:'Beautiful Recitation — Surah Ar-Rahman', ch:'Sheikh Mishary Rashid',   e:'📖', dur:'8:30',    v:'12M'},
  {cat:'quran',    title:'Complete Surah Al-Baqarah Recitation',   ch:'Sheikh Al-Sudais',        e:'📖', dur:'2:17:00', v:'45M'},
  {cat:'lecture',  title:'The Importance of Ramadan',              ch:'Dr. Zakir Naik',           e:'🎙️', dur:'45:00',   v:'8.2M'},
  {cat:'lecture',  title:'30 Days 30 Lessons — Ramadan Series',   ch:'Mufti Menk',               e:'🎙️', dur:'25:00',   v:'5.1M'},
  {cat:'dua',      title:'Duas for Every Part of Ramadan',         ch:'Bilal Assad',              e:'🤲', dur:'12:00',   v:'3.4M'},
  {cat:'dua',      title:'Most Powerful Duas in Ramadan',          ch:'Nouman Ali Khan',          e:'🤲', dur:'18:30',   v:'6.7M'},
  {cat:'taraweeh', title:'Taraweeh Prayer — Complete 20 Rakahs',  ch:'Masjid Al-Haram',          e:'🕌', dur:'1:45:00', v:'22M'},
  {cat:'quran',    title:'Quran Recitation — Last 10 Surahs',      ch:'Sheikh Sudais',            e:'📖', dur:'12:00',   v:'7.8M'},
  {cat:'lecture',  title:'What is Laylat al-Qadr?',                ch:'Yasir Qadhi',              e:'🌙', dur:'35:00',   v:'9.3M'},
  {cat:'lecture',  title:'Ramadan — Month of Transformation',      ch:'Omar Suleiman',            e:'🎙️', dur:'28:00',   v:'11M'},
];

const PRAYER_TIMES_FALLBACK = {
  Karachi:   {Fajr:'05:07',Sunrise:'06:25',Dhuhr:'12:26',Asr:'15:55',Maghrib:'18:28',Isha:'19:52'},
  Lahore:    {Fajr:'04:51',Sunrise:'06:10',Dhuhr:'12:14',Asr:'15:46',Maghrib:'18:18',Isha:'19:40'},
  Islamabad: {Fajr:'04:48',Sunrise:'06:07',Dhuhr:'12:10',Asr:'15:42',Maghrib:'18:13',Isha:'19:36'},
  Sukkur:    {Fajr:'05:02',Sunrise:'06:20',Dhuhr:'12:23',Asr:'15:52',Maghrib:'18:25',Isha:'19:49'},
};

// ─── STATE ──────────────────────────────────────────────────
let prayerTracker    = JSON.parse(localStorage.getItem('ah_pt') || '{}');
let quranProgress    = JSON.parse(localStorage.getItem('ah_qp') || '{}');
let currentSurah     = null;
let chatSessionId    = null;
let currentTimes     = null;
let notifPermission  = false;
let scheduledNotifs  = {};

// ─── INIT ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const savedTheme = localStorage.getItem('ah_theme');
  if (savedTheme) document.documentElement.dataset.theme = savedTheme;

  setTimeout(() => document.getElementById('loader')?.classList.add('out'), 1600);

  generateStars();
  checkAuth();
  renderSurahList();
  renderDuas('all');
  renderRecipes('all');
  renderVideos('all');
  initPrayerTracker();
  initQuranTracker();
  startCountdown();
  calcFitrana();
  requestNotifPermission();
});

// ─── AUTH HELPERS ────────────────────────────────────────────
function authHeaders() {
  return {'Content-Type':'application/json', 'Authorization':'Bearer '+TOKEN};
}

async function apiFetch(path, opts={}) {
  const res = await fetch(API + path, {
    headers: authHeaders(), ...opts,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });
  return res.json();
}

function checkAuth() {
  if (TOKEN && USER) {
    updateUserChip();
    loadPrayerTimes();
    syncFromServer();
  } else {
    document.getElementById('loginModal')?.classList.add('open');
  }
}

function updateUserChip() {
  if (!USER) return;
  const chip = document.getElementById('userChip');
  if (chip) {
    chip.querySelector('.user-avatar').textContent = USER.full_name[0].toUpperCase();
    chip.querySelector('.chip-name').textContent   = USER.full_name.split(' ')[0];
  }
}

async function syncFromServer() {
  if (!TOKEN) return;
  try {
    const prog = await apiFetch('/quran/progress');
    if (Array.isArray(prog)) {
      prog.forEach(p => { quranProgress[p.surah_number] = {ayah: p.last_ayah, done: p.is_completed}; });
      localStorage.setItem('ah_qp', JSON.stringify(quranProgress));
      initQuranTracker();
    }
    const logs = await apiFetch('/prayer/log');
    if (Array.isArray(logs)) {
      logs.forEach(l => {
        if (l.prayed) prayerTracker[l.prayer_date + '_' + l.prayer_name] = true;
      });
      localStorage.setItem('ah_pt', JSON.stringify(prayerTracker));
      initPrayerTracker();
    }
  } catch(e) {}
}

// ─── LOGIN / REGISTER ────────────────────────────────────────
async function doLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pw    = document.getElementById('loginPw').value;
  if (!email || !pw) return showToast('⚠️','Please fill all fields');

  const data = await apiFetch('/auth/login', {method:'POST', body:{email, password:pw}});
  if (data.error) return showToast('❌', data.error);
  TOKEN = data.token; USER = data.user;
  localStorage.setItem('ah_token', TOKEN);
  localStorage.setItem('ah_user',  JSON.stringify(USER));
  closeModal('loginModal');
  updateUserChip();
  loadPrayerTimes();
  syncFromServer();
  showToast('🌙', `Welcome back, ${USER.full_name.split(' ')[0]}!`);
}

async function doRegister() {
  const data = {
    full_name: document.getElementById('regName').value.trim(),
    email:     document.getElementById('regEmail').value.trim(),
    password:  document.getElementById('regPw').value,
    city:      document.getElementById('regCity').value,
    country:   'Pakistan',
    latitude:  parseFloat(document.getElementById('regLat').value) || 24.86,
    longitude: parseFloat(document.getElementById('regLon').value) || 67.01,
    timezone:  Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Karachi',
    calc_method: 1,
  };

  if (!data.full_name || !data.email || !data.password || !data.city)
    return showToast('⚠️','All fields are required');

  const res = await apiFetch('/auth/register', {method:'POST', body:data});
  if (res.error) return showToast('❌', res.error);
  TOKEN = res.token; USER = res.user;
  localStorage.setItem('ah_token', TOKEN);
  localStorage.setItem('ah_user',  JSON.stringify(USER));
  closeModal('loginModal');
  updateUserChip();
  loadPrayerTimes();
  showToast('🌙', `Welcome, ${USER.full_name.split(' ')[0]}! Ramadan Mubarak!`);
}

function doLogout() {
  TOKEN = null; USER = null;
  localStorage.removeItem('ah_token');
  localStorage.removeItem('ah_user');
  location.reload();
}

// ─── LOCATION ────────────────────────────────────────────────
function getLocation() {
  if (!navigator.geolocation) return showToast('⚠️','Geolocation not supported');
  navigator.geolocation.getCurrentPosition(pos => {
    document.getElementById('regLat').value = pos.coords.latitude.toFixed(6);
    document.getElementById('regLon').value = pos.coords.longitude.toFixed(6);
    showToast('📍','Location detected!');
    // Reverse geocode to city
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`)
      .then(r => r.json()).then(d => {
        const city = d.address?.city || d.address?.town || d.address?.state || '';
        if (city) document.getElementById('regCity').value = city;
      }).catch(()=>{});
  }, () => showToast('⚠️','Could not get location'));
}

// ─── NAVIGATION ──────────────────────────────────────────────
function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  const sec = document.getElementById(id);
  if (sec) sec.classList.add('active');
  const nav = document.getElementById('nav-' + id);
  if (nav) nav.classList.add('active');
  document.getElementById('navLinks')?.classList.remove('open');
  window.scrollTo(0,0);
  if (id === 'prayer') loadPrayerTimes();
}

function toggleNav() {
  document.getElementById('navLinks')?.classList.toggle('open');
}

// ─── THEME ───────────────────────────────────────────────────
function toggleTheme() {
  const html = document.documentElement;
  html.dataset.theme = html.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('ah_theme', html.dataset.theme);
  if (TOKEN) apiFetch('/user/settings', {method:'PUT', body:{theme: html.dataset.theme}});
}

// ─── STARS ───────────────────────────────────────────────────
function generateStars() {
  const c = document.getElementById('starsBg');
  if (!c) return;
  for (let i = 0; i < 70; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    s.style.cssText = `left:${Math.random()*100}%;top:${Math.random()*100}%;
      animation-delay:${Math.random()*3}s;animation-duration:${2+Math.random()*3}s;
      width:${1+Math.random()*2}px;height:${1+Math.random()*2}px;`;
    c.appendChild(s);
  }
}

// ─── PRAYER TIMES ────────────────────────────────────────────
async function loadPrayerTimes() {
  const city = USER?.city || 'Sukkur';
  document.getElementById('pCityName').textContent = city + ', Pakistan';
  const now = new Date();
  document.getElementById('pDate').textContent = now.toLocaleDateString('en-PK',{weekday:'long',year:'numeric',month:'long',day:'numeric'});

  let timings = PRAYER_TIMES_FALLBACK[city] || PRAYER_TIMES_FALLBACK['Sukkur'];
  let hijri   = {day:'14', month:{en:'Ramadan'}, year:'1446'};

  if (TOKEN) {
    try {
      const data = await apiFetch('/prayer/times');
      if (data.timings) { timings = data.timings; hijri = data.hijri; }
    } catch(e) {}
  }

  currentTimes = timings;
  document.getElementById('hijriDate').textContent = `${hijri.day} ${hijri.month.en} ${hijri.year} AH`;
  document.getElementById('sehriTime').textContent  = timings.Fajr    || '--:--';
  document.getElementById('iftarTime').textContent  = timings.Maghrib || '--:--';

  renderPrayerCards(timings);
  updateNextPrayer(timings);
  scheduleNotifications(timings);
}

function renderPrayerCards(t) {
  const prayers = [
    {n:'Fajr',    ar:'الفجر',  icon:'🌙', time:t.Fajr},
    {n:'Sunrise', ar:'الشروق', icon:'🌄', time:t.Sunrise},
    {n:'Dhuhr',   ar:'الظهر',  icon:'☀️', time:t.Dhuhr},
    {n:'Asr',     ar:'العصر',  icon:'🌤️', time:t.Asr},
    {n:'Maghrib', ar:'المغرب', icon:'🌅', time:t.Maghrib},
    {n:'Isha',    ar:'العشاء', icon:'🌙', time:t.Isha},
  ];

  const now = new Date();
  const nowM = now.getHours()*60 + now.getMinutes();
  let curIdx = 0;
  prayers.forEach((p,i) => { const [h,m]=(p.time||'00:00').split(':').map(Number); if(h*60+m<=nowM) curIdx=i; });

  const today = toDateStr(now);
  const grid  = document.getElementById('prayersGrid');
  if (!grid) return;

  grid.innerHTML = prayers.map((p,i) => {
    const key    = today + '_' + p.n;
    const prayed = prayerTracker[key];
    const skip   = p.n === 'Sunrise';
    return `
      <div class="prayer-card ${i===curIdx?'current':''}">
        <div class="p-icon">${p.icon}</div>
        <div class="p-ar">${p.ar}</div>
        <div class="p-name">${p.n}</div>
        <div class="p-time">${p.time||'--:--'}</div>
        ${!skip ? `<div class="p-check">
          <button class="check-btn ${prayed?'prayed':''}"
            onclick="markPrayer('${p.n}','${today}',this)">
            ${prayed ? '✅ Prayed' : '○ Mark Prayed'}
          </button>
        </div>` : ''}
        ${i===curIdx ? '<div style="font-size:0.65rem;color:var(--teal-light);margin-top:5px;letter-spacing:1px;">▶ CURRENT</div>' : ''}
      </div>`;
  }).join('');
}

async function markPrayer(name, date, btn) {
  const key = date + '_' + name;
  const now = !prayerTracker[key];
  if (now) prayerTracker[key] = true; else delete prayerTracker[key];
  localStorage.setItem('ah_pt', JSON.stringify(prayerTracker));
  btn.className = 'check-btn ' + (now ? 'prayed' : '');
  btn.textContent = now ? '✅ Prayed' : '○ Mark Prayed';
  showToast(now?'🕌':'⬜', now ? `${name} logged!` : `${name} unmarked`);
  if (TOKEN) {
    try { await apiFetch('/prayer/log', {method:'POST', body:{prayer_name:name, prayer_date:date, prayed:now}}); } catch(e){}
  }
  initPrayerTracker();
}

function updateNextPrayer(t) {
  const prayers = [
    {n:'Fajr',time:t.Fajr},{n:'Dhuhr',time:t.Dhuhr},
    {n:'Asr',time:t.Asr},{n:'Maghrib',time:t.Maghrib},{n:'Isha',time:t.Isha}
  ];
  const now = new Date();
  const nowM = now.getHours()*60+now.getMinutes();
  let next = prayers.find(p => { const[h,m]=(p.time||'00:00').split(':').map(Number); return h*60+m > nowM; });
  if (!next) next = prayers[0];
  document.getElementById('nextPName').textContent = next.n;
  document.getElementById('nextPTime').textContent = next.time||'--:--';
  const [h,m] = (next.time||'00:00').split(':').map(Number);
  const target = new Date(); target.setHours(h,m,0);
  if (target < now) target.setDate(target.getDate()+1);
  const diff = target - now;
  const dh = Math.floor(diff/3600000), dm = Math.floor((diff%3600000)/60000);
  document.getElementById('nextPIn').textContent = `in ${dh}h ${dm}m`;
}

// ─── PRAYER TRACKER ──────────────────────────────────────────
function initPrayerTracker() {
  const c = document.getElementById('prayerTracker');
  if (!c) return;
  const today = new Date();
  c.innerHTML = '';
  for (let d = 1; d <= 30; d++) {
    const dt = new Date(today.getFullYear(), today.getMonth(), d);
    const ds = toDateStr(dt);
    const prayers = ['Fajr','Dhuhr','Asr','Maghrib','Isha'];
    const prayed  = prayers.filter(p => prayerTracker[ds+'_'+p]).length;
    const all5    = prayed >= 5;
    const div = document.createElement('div');
    div.className = `t-cell ${all5?'done':prayed>0?'today':''} ${d===today.getDate()?'today':''}`;
    div.textContent = d;
    div.title = `Day ${d}: ${prayed}/5 prayers`;
    c.appendChild(div);
  }
}

// ─── QURAN ───────────────────────────────────────────────────
function renderSurahList(filter='') {
  const list = document.getElementById('surahList');
  if (!list) return;
  const surahs = SURAHS.filter(s =>
    s.en.toLowerCase().includes(filter.toLowerCase()) ||
    s.ar.includes(filter) ||
    String(s.n).includes(filter)
  );
  list.innerHTML = surahs.map(s => {
    const prog = quranProgress[s.n];
    const badge = prog ? (prog.done ?
      '<span class="badge badge-jade">✓ Done</span>' :
      `<span class="badge badge-teal">Ayah ${prog.ayah}</span>`) : '';
    return `
      <div class="surah-item" onclick="openSurah(${s.n})">
        <div class="sn">${s.n}</div>
        <div class="sd">
          <div class="se">${s.en}</div>
          <div class="sa">${s.ar}</div>
          <div class="sm">${s.type} • ${s.v} verses • Juz ${s.juz} ${badge}</div>
        </div>
        <div class="si">▶</div>
      </div>`;
  }).join('');
}

function filterSurahs() {
  renderSurahList(document.getElementById('surahSearch')?.value || '');
}

async function openSurah(num) {
  currentSurah = num;
  const surah = SURAHS.find(s => s.n === num);
  if (!surah) return;

  document.getElementById('surahListWrap').classList.add('hidden');
  const viewer = document.getElementById('quranViewer');
  viewer.classList.remove('hidden');

  document.getElementById('viewSurahName').textContent =
    `${surah.n}. ${surah.en} — ${surah.ar}`;
  document.getElementById('viewSurahMeta').textContent =
    `${surah.type} • ${surah.v} Verses • Juz ${surah.juz}`;

  // Last read ayah
  const prog = quranProgress[num];
  const lastAyah = prog?.ayah || 1;

  // Set audio player
  renderAudioPlayer(surah);

  // Try fetching verses from API
  let verses = SAMPLE_VERSES[num] || genMockVerses(surah);
  if (TOKEN) {
    try {
      const data = await apiFetch(`/quran/surah/${num}`);
      if (Array.isArray(data) && data[0]?.ayahs) {
        const arabic  = data[0].ayahs.map(a => a.text);
        const english = data[1]?.ayahs?.map(a => a.text) || [];
        verses = arabic.map((ar,i) => ({ar, tr: english[i] || ''}));
      }
    } catch(e) {}
  }

  const vList = document.getElementById('verseList');
  vList.innerHTML = `
    <div style="text-align:center;padding:1rem;background:rgba(13,115,119,0.05);border-radius:8px;margin-bottom:1.5rem;">
      <div class="fw-arabic" style="font-size:2rem;color:var(--teal-light);direction:rtl;">
        بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
      </div>
      <div style="font-size:0.78rem;color:var(--text-3);margin-top:4px;font-style:italic;">
        In the name of Allah, the Most Gracious, the Most Merciful
      </div>
    </div>
    ${verses.map((v,i) => `
      <div class="verse-item" id="v${i+1}">
        <div class="verse-arabic">${v.ar} <span style="font-size:0.9rem;color:var(--teal-light);">﴿${i+1}﴾</span></div>
        <div class="verse-trans"><span class="verse-num">${i+1}</span>${v.tr}</div>
        <div style="display:flex;gap:6px;margin-top:6px;">
          <button class="btn btn-ghost btn-sm" onclick="setLastRead(${num},${i+1},${surah.v})">📌 Last Read</button>
        </div>
      </div>`).join('')}`;

  // Scroll to last read ayah
  setTimeout(() => {
    const el = document.getElementById('v' + lastAyah);
    if (el && lastAyah > 1) { el.scrollIntoView({behavior:'smooth',block:'start'}); showToast('📖', `Resuming from Ayah ${lastAyah}`); }
  }, 400);
}

function renderAudioPlayer(surah) {
  const ap = document.getElementById('audioPlayer');
  if (!ap) return;
  ap.innerHTML = `
    <div class="audio-player">
      <button class="audio-play-btn" onclick="toggleAudio(${surah.n})" id="audioBtnMain">▶</button>
      <div class="audio-info">
        <div class="audio-title">Surah ${surah.en}</div>
        <div class="audio-reciter">Sheikh Mishary Rashid Alafasy</div>
      </div>
      <div class="audio-progress" style="display:flex;flex-direction:column;gap:4px;">
        <div class="prog-bar audio-bar" onclick="seekAudio(event)" style="cursor:pointer;">
          <div class="prog-fill" id="audioProg" style="width:0%"></div>
        </div>
        <div style="display:flex;justify-content:space-between;font-size:0.68rem;color:var(--text-3);">
          <span id="audioTime">0:00</span>
          <span id="audioDur">--:--</span>
        </div>
      </div>
      <select style="max-width:130px;font-size:0.75rem;" id="reciterSelect" onchange="changeReciter(${surah.n})">
        <option value="ar.alafasy">Alafasy</option>
        <option value="ar.abdurrahmaansudais">Sudais</option>
        <option value="ar.husary">Husary</option>
        <option value="ar.minshawi">Minshawi</option>
      </select>
    </div>`;

  // Load audio
  loadSurahAudio(surah.n, 'ar.alafasy');
}

let currentAudio = null;
function loadSurahAudio(num, reciter) {
  const padded = String(num).padStart(3,'0');
  const url = `https://cdn.islamic.network/quran/audio-surah/128/${reciter}/${padded}.mp3`;
  if (currentAudio) { currentAudio.pause(); currentAudio = null; }
  currentAudio = new Audio(url);
  currentAudio.addEventListener('timeupdate', () => {
    const p = (currentAudio.currentTime / currentAudio.duration) * 100 || 0;
    const el = document.getElementById('audioProg');
    if (el) el.style.width = p + '%';
    const t = document.getElementById('audioTime');
    if (t) t.textContent = fmtTime(currentAudio.currentTime);
    const d = document.getElementById('audioDur');
    if (d && currentAudio.duration) d.textContent = fmtTime(currentAudio.duration);
  });
  currentAudio.addEventListener('ended', () => {
    const btn = document.getElementById('audioBtnMain');
    if (btn) btn.textContent = '▶';
  });
}

function toggleAudio(num) {
  const btn = document.getElementById('audioBtnMain');
  if (!currentAudio) loadSurahAudio(num, document.getElementById('reciterSelect')?.value || 'ar.alafasy');
  if (currentAudio.paused) { currentAudio.play(); if(btn) btn.textContent='⏸'; }
  else { currentAudio.pause(); if(btn) btn.textContent='▶'; }
}

function changeReciter(num) {
  const reciter = document.getElementById('reciterSelect')?.value || 'ar.alafasy';
  loadSurahAudio(num, reciter);
  const btn = document.getElementById('audioBtnMain');
  if (btn) btn.textContent = '▶';
}

function seekAudio(e) {
  if (!currentAudio || !currentAudio.duration) return;
  const rect = e.currentTarget.getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width;
  currentAudio.currentTime = pct * currentAudio.duration;
}

function fmtTime(s) {
  const m = Math.floor(s/60), sec = Math.floor(s%60);
  return `${m}:${String(sec).padStart(2,'0')}`;
}

async function setLastRead(surah, ayah, total) {
  quranProgress[surah] = {ayah, done: ayah >= total};
  localStorage.setItem('ah_qp', JSON.stringify(quranProgress));
  initQuranTracker();
  showToast('📌', `Bookmark saved: Surah ${surah}, Ayah ${ayah}`);
  if (TOKEN) {
    try { await apiFetch('/quran/progress', {method:'POST', body:{surah_number:surah, last_ayah:ayah, total_ayahs:total, is_completed: ayah>=total}}); } catch(e){}
  }
}

function closeViewer() {
  if (currentAudio) { currentAudio.pause(); currentAudio=null; }
  document.getElementById('surahListWrap').classList.remove('hidden');
  document.getElementById('quranViewer').classList.add('hidden');
  currentSurah = null;
}

function prevSurah() {
  if (!currentSurah) return;
  const i = SURAHS.findIndex(s => s.n === currentSurah);
  if (i > 0) openSurah(SURAHS[i-1].n);
}

function nextSurah() {
  if (!currentSurah) return;
  const i = SURAHS.findIndex(s => s.n === currentSurah);
  if (i < SURAHS.length-1) openSurah(SURAHS[i+1].n);
}

function genMockVerses(surah) {
  const pool = [
    {ar:'إِنَّ اللَّهَ بِكُلِّ شَيْءٍ عَلِيمٌ', tr:'Indeed, Allah is Knowing of all things.'},
    {ar:'وَهُوَ الْغَفُورُ الرَّحِيمُ',          tr:'And He is the Forgiving, the Merciful.'},
    {ar:'إِنَّ اللَّهَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ',tr:'Indeed, Allah is over all things competent.'},
    {ar:'وَاللَّهُ سَمِيعٌ عَلِيمٌ',             tr:'And Allah is Hearing and Knowing.'},
    {ar:'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',         tr:'Glory be to Allah and praise be to Him.'},
  ];
  const verses = [];
  for (let i = 0; i < Math.min(5, surah.v); i++) verses.push(pool[i % pool.length]);
  if (surah.v > 5) verses.push({ar:'...', tr:`[Showing 5 of ${surah.v} verses. Connect to Quran API for complete text.]`});
  return verses;
}

// ─── QURAN TRACKER ───────────────────────────────────────────
function initQuranTracker() {
  const c = document.getElementById('quranTracker');
  if (!c) return;
  let done = 0;
  c.innerHTML = '';
  for (let j = 1; j <= 30; j++) {
    const completed = Object.values(quranProgress).filter(p => p.done).length >= j;
    if (completed) done++;
    const div = document.createElement('div');
    div.className = `t-cell ${completed?'done':''}`;
    div.textContent = j;
    div.title = `Juz ${j}`;
    div.onclick = () => { div.classList.toggle('done'); showToast('📖', `Juz ${j} ${div.classList.contains('done')?'completed':'unmarked'}`); };
    c.appendChild(div);
  }
  const b = document.getElementById('qProgressBadge');
  const p = document.getElementById('qProgressBar');
  if (b) b.textContent = `${done} / 30 Juz`;
  if (p) p.style.width = (done/30*100) + '%';
}

// ─── DUAS ────────────────────────────────────────────────────
function renderDuas(cat) {
  const el = document.getElementById('duasList');
  if (!el) return;
  const list = cat === 'all' ? DUAS : DUAS.filter(d => d.cat === cat);
  el.innerHTML = list.map(d => `
    <div class="dua-card">
      <div class="dua-top">
        <div class="dua-title">🤲 ${d.title}</div>
        <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
          <span class="badge badge-teal">${d.src}</span>
          <button class="btn btn-outline btn-sm" onclick="copyDua(\`${d.ar}\`,\`${d.en}\`)">📋 Copy</button>
        </div>
      </div>
      <div class="dua-arabic">${d.ar}</div>
      <div class="dua-translit">📝 ${d.tr}</div>
      <div class="dua-trans">🌐 ${d.en}</div>
    </div>`).join('');
}

function filterDuas(cat, btn) {
  document.querySelectorAll('#duasSection .pill').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderDuas(cat);
}

function copyDua(ar, en) {
  navigator.clipboard.writeText(ar + '\n\n' + en)
    .then(() => showToast('📋','Dua copied to clipboard!'));
}

// ─── ZAKAT ───────────────────────────────────────────────────
function switchZakatTab(id, btn) {
  document.querySelectorAll('#zakatSection .tab-btn').forEach(b=>b.classList.remove('active'));
  document.querySelectorAll('#zakatSection .tab-panel').forEach(p=>p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(id+'-panel').classList.add('active');
}

function calcZakat() {
  const cash    = +document.getElementById('z-cash')?.value    || 0;
  const invest  = +document.getElementById('z-invest')?.value  || 0;
  const biz     = +document.getElementById('z-biz')?.value     || 0;
  const loans   = +document.getElementById('z-loans')?.value   || 0;
  const debts   = +document.getElementById('z-debts')?.value   || 0;
  const cur     = document.getElementById('z-currency')?.value || 'PKR';
  const sym     = {PKR:'₨',USD:'$',GBP:'£',SAR:'﷼'}[cur] || cur;
  const total   = cash + invest + biz + loans;
  const net     = Math.max(0, total - debts);
  const zakat   = net * 0.025;
  const nisab   = cur === 'PKR' ? 1920000 : cur === 'USD' ? 4300 : 3600;
  const met     = net >= nisab;
  const fmt     = n => sym + ' ' + Math.round(n).toLocaleString();
  document.getElementById('r-total').textContent  = fmt(total);
  document.getElementById('r-net').textContent    = fmt(net);
  document.getElementById('r-zakat').textContent  = fmt(zakat);
  document.getElementById('r-nisab').textContent  = met ? '✅ Met' : '❌ Not Met';
  document.getElementById('r-nisab').style.color  = met ? 'var(--jade-light)' : '#E57373';
  document.getElementById('zakat-result').classList.remove('hidden');
  if (met && TOKEN) apiFetch('/zakat/save',{method:'POST',body:{calc_type:'wealth',cash_amount:cash,investments:invest,business_goods:biz,receivables:loans,debts,total_assets:total,net_zakatable:net,zakat_amount:zakat,nisab_met:met,currency:cur}}).catch(()=>{});
}

function calcGold() {
  const gw = +document.getElementById('g-gold')?.value       || 0;
  const gp = +document.getElementById('g-goldprice')?.value  || 22000;
  const sw = +document.getElementById('g-silver')?.value     || 0;
  const sp = +document.getElementById('g-silverprice')?.value|| 270;
  const gv = gw*gp, sv = sw*sp, total = gv+sv;
  const zakat = total * 0.025;
  const fmt = n => '₨ ' + Math.round(n).toLocaleString();
  document.getElementById('r-gv').textContent = fmt(gv);
  document.getElementById('r-sv').textContent = fmt(sv);
  document.getElementById('r-gz').textContent = fmt(zakat);
  document.getElementById('gold-result').classList.remove('hidden');
}

function calcUshr() {
  const produce  = +document.getElementById('u-produce')?.value  || 0;
  const irrigate = document.getElementById('u-irrigate')?.value  || 'rain';
  const price    = +document.getElementById('u-price')?.value    || 0;
  const rate     = irrigate === 'rain' ? 0.1 : 0.05;
  const totalVal = produce * price;
  const ushrVal  = totalVal * rate;
  const ushrKg   = produce * rate;
  const fmt = n => '₨ ' + Math.round(n).toLocaleString();
  document.getElementById('r-uv').textContent    = fmt(totalVal);
  document.getElementById('r-ushr').textContent  = fmt(ushrVal);
  document.getElementById('r-ukind').textContent = ushrKg.toFixed(2);
  document.getElementById('ushr-result').classList.remove('hidden');
}

function calcFitrana() {
  const members  = +document.getElementById('f-members')?.value || 4;
  const food     = document.getElementById('f-food')?.value     || 'wheat';
  const custom   = +document.getElementById('f-custom')?.value  || 0;
  const prices   = {wheat:280, rice:420, dates:800};
  const price    = custom || prices[food] || 280;
  const per      = price * 1.75;
  const total    = per * members;
  const fmt = n => '₨ ' + Math.round(n).toLocaleString();
  if (document.getElementById('r-fp')) document.getElementById('r-fp').textContent = fmt(per);
  if (document.getElementById('r-ft')) document.getElementById('r-ft').textContent = fmt(total);
  if (document.getElementById('r-fw')) document.getElementById('r-fw').textContent = (1.75 * members).toFixed(2);
}

// ─── RECIPES ─────────────────────────────────────────────────
function renderRecipes(cat) {
  const el = document.getElementById('recipesGrid');
  if (!el) return;
  const list = cat === 'all' ? RECIPES : RECIPES.filter(r => r.cat === cat);
  const bgs  = {sehri:'linear-gradient(135deg,#0a1a2a,#062040)',iftar:'linear-gradient(135deg,#1a0a0a,#2a1005)',drinks:'linear-gradient(135deg,#051520,#0a2030)',sweets:'linear-gradient(135deg,#1a0515,#250a20)',snacks:'linear-gradient(135deg,#0a1a05,#152010)'};
  el.innerHTML = list.map(r => `
    <div class="recipe-card">
      <div class="recipe-img" style="background:${bgs[r.cat]||'var(--bg-card)'}">
        <span style="position:relative;z-index:1">${r.e}</span>
      </div>
      <div class="recipe-body">
        <div style="display:flex;gap:5px;margin-bottom:0.5rem;flex-wrap:wrap;">
          <span class="badge ${r.cat==='sehri'?'badge-teal':r.cat==='iftar'?'badge-amber':'badge-jade'}">${r.cat.toUpperCase()}</span>
          <span class="badge" style="background:rgba(255,255,255,0.04);color:var(--text-3);border-color:var(--border);">${r.d}</span>
        </div>
        <div class="recipe-name">${r.name}</div>
        <div class="recipe-desc">${r.desc}</div>
        <div class="recipe-meta">
          <span>⏱️ ${r.t}</span><span>👥 ${r.s}</span>
        </div>
      </div>
    </div>`).join('');
}

function filterRecipes(cat, btn) {
  document.querySelectorAll('#recipesSection .pill').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderRecipes(cat);
}

// ─── VIDEOS ──────────────────────────────────────────────────
function renderVideos(cat) {
  const el = document.getElementById('videosGrid');
  if (!el) return;
  const list = cat === 'all' ? VIDEOS : VIDEOS.filter(v => v.cat === cat);
  const bgs  = {quran:'#061510',lecture:'#060610',dua:'#120612',taraweeh:'#061212'};
  el.innerHTML = list.map(v => `
    <div class="video-card">
      <div class="video-thumb" style="background:${bgs[v.cat]||'var(--bg-card)'}">
        <span>${v.e}</span>
        <div class="play-circle">▶</div>
      </div>
      <div class="video-body">
        <div class="video-title">${v.title}</div>
        <div class="video-channel">📺 ${v.ch} • ${v.dur} • ${v.v} views</div>
      </div>
    </div>`).join('');
}

function filterVideos(cat, btn) {
  document.querySelectorAll('#videosSection .pill').forEach(b=>b.classList.remove('active'));
  btn.classList.add('active');
  renderVideos(cat);
}

// ─── CHATBOT ─────────────────────────────────────────────────
function toggleChat() {
  document.getElementById('chatWindow').classList.toggle('open');
}

async function sendChatMessage() {
  const inp = document.getElementById('chatInput');
  const msg = inp.value.trim();
  if (!msg) return;
  inp.value = '';
  appendMsg(msg, 'user');
  showTyping();

  try {
    const data = await apiFetch('/chatbot/message', {
      method: 'POST',
      body: {message: msg, session_id: chatSessionId}
    });
    hideTyping();
    appendMsg(data.reply || 'Sorry, I could not respond.', 'bot');
    if (data.session_id) chatSessionId = data.session_id;
  } catch(e) {
    hideTyping();
    appendMsg('⚠️ AI service unavailable. Basic rule: Zakat = 2.5% on net zakatable assets above Nisab (₨1.92M gold standard).', 'bot');
  }
}

function appendMsg(text, role) {
  const body = document.getElementById('chatBody');
  const div  = document.createElement('div');
  div.className = 'chat-msg ' + role;
  div.textContent = text;
  body.appendChild(div);
  body.scrollTop = body.scrollHeight;
}

function showTyping() {
  const body = document.getElementById('chatBody');
  const d = document.createElement('div');
  d.id = 'chatTyping'; d.className = 'chat-typing';
  d.innerHTML = '<span></span><span></span><span></span>';
  body.appendChild(d); body.scrollTop = body.scrollHeight;
}

function hideTyping() {
  document.getElementById('chatTyping')?.remove();
}

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.activeElement?.id === 'chatInput') sendChatMessage();
});

// ─── COUNTDOWN ───────────────────────────────────────────────
function startCountdown() {
  function tick() {
    const t = currentTimes || PRAYER_TIMES_FALLBACK['Sukkur'];
    const [mh,mm] = (t.Maghrib||'18:25').split(':').map(Number);
    const [fh,fm] = (t.Fajr||'05:02').split(':').map(Number);
    const now = new Date();
    const maghrib = new Date(); maghrib.setHours(mh,mm,0);
    const fajr    = new Date(); fajr.setHours(fh,fm,0);
    let target, label;
    if (now < fajr)    { target=fajr;    label='Sehri Ends'; }
    else if(now<maghrib){ target=maghrib; label='Until Iftar'; }
    else               { fajr.setDate(fajr.getDate()+1); target=fajr; label='Next Sehri'; }
    const diff = Math.max(0, target - now);
    const h = Math.floor(diff/3600000), m = Math.floor((diff%3600000)/60000), s = Math.floor((diff%60000)/1000);
    const el = (id) => document.getElementById(id);
    if(el('cdH')) el('cdH').textContent = pad(h);
    if(el('cdM')) el('cdM').textContent = pad(m);
    if(el('cdS')) el('cdS').textContent = pad(s);
    if(el('cdLabel')) el('cdLabel').textContent = label;
  }
  tick(); setInterval(tick, 1000);
}

// ─── NOTIFICATIONS ───────────────────────────────────────────
function requestNotifPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission().then(p => { notifPermission = p === 'granted'; });
  } else notifPermission = Notification?.permission === 'granted';
}

function scheduleNotifications(timings) {
  Object.values(scheduledNotifs).forEach(t => clearTimeout(t));
  scheduledNotifs = {};
  if (!notifPermission) return;
  const prayers = ['Fajr','Dhuhr','Asr','Maghrib','Isha'];
  prayers.forEach(name => {
    const t = timings[name];
    if (!t) return;
    const [h,m] = t.split(':').map(Number);
    const target = new Date(); target.setHours(h,m,0,0);
    const now = new Date();
    let diff = target - now;
    if (diff < 0) diff += 86400000;
    // Notify 10 min before
    const notifTime = diff - 10 * 60000;
    if (notifTime > 0) {
      scheduledNotifs[name] = setTimeout(() => {
        new Notification(`🕌 ${name} Prayer in 10 Minutes`, {
          body: `${name} prayer time: ${t}`,
          icon: '/static/icon.png'
        });
      }, notifTime);
    }
  });
  // Iftar notification
  const [mh,mm] = (timings.Maghrib||'18:25').split(':').map(Number);
  const iftarTarget = new Date(); iftarTarget.setHours(mh,mm,0,0);
  let iftarDiff = iftarTarget - new Date() - 5*60000;
  if (iftarDiff > 0) {
    scheduledNotifs['Iftar'] = setTimeout(() => {
      new Notification('🌅 Iftar in 5 Minutes!', {
        body: `Maghrib at ${timings.Maghrib} — prepare to break your fast`,
        icon: '/static/icon.png'
      });
    }, iftarDiff);
  }
}

// ─── MODAL ───────────────────────────────────────────────────
function openModal(id)  { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }
function toggleLoginTab(tab) {
  document.getElementById('loginFormWrap')?.classList.toggle('hidden', tab==='register');
  document.getElementById('registerFormWrap')?.classList.toggle('hidden', tab==='login');
  document.querySelectorAll('.login-tab').forEach(b => b.classList.toggle('active', b.dataset.tab===tab));
}

// ─── UTILITY ─────────────────────────────────────────────────
function showToast(icon, msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  document.getElementById('toastIcon').textContent = icon;
  document.getElementById('toastMsg').textContent  = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

function toDateStr(d) {
  return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
}

function pad(n) { return String(n).padStart(2,'0'); }
