/* ============================================================
   AL-HIDAYAH — Complete Fixed app.js
   Fixes:
   1. Prayer marking working correctly
   2. Prayer history/stats section
   3. Next Ramadan date (not current)
   4. Full 114 Surahs showing
   5. Audio working via Islamic Network CDN
============================================================ */
'use strict';

// ── CONFIG ──────────────────────────────────────────────────
const API = '/api';
let TOKEN = localStorage.getItem('ah_token');
let USER = JSON.parse(localStorage.getItem('ah_user') || 'null');

// ── PRAYER DATA ─────────────────────────────────────────────
const PRAYER_INFO = {
  Fajr: {
    ar: 'الفجر', icon: '🌙', type: 'Sunnah 2 + Fard 2',
    dua_ar: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا',
    dua_tr: 'O Allah, I ask You for beneficial knowledge',
    info: 'Pre-dawn prayer. Most rewarded. Best time: before sunrise.'
  },
  Dhuhr: {
    ar: 'الظهر', icon: '☀️', type: 'Sunnah 4 + Fard 4 + Sunnah 2',
    dua_ar: 'اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ',
    dua_tr: 'O Allah, You are Peace and from You is Peace',
    info: 'Midday prayer after the sun passes zenith.'
  },
  Asr: {
    ar: 'العصر', icon: '🌤️', type: 'Sunnah 4 + Fard 4',
    dua_ar: 'رَبِّ اجْعَلْنِي مُقِيمَ الصَّلَاةِ',
    dua_tr: 'My Lord, make me an establisher of prayer',
    info: 'Afternoon prayer. Missing it is like losing family.'
  },
  Maghrib: {
    ar: 'المغرب', icon: '🌅', type: 'Fard 3 + Sunnah 2 + Nafl 2',
    dua_ar: 'اللَّهُمَّ لَكَ صُمْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ',
    dua_tr: 'O Allah, for You I fasted and on Your provision I break fast',
    info: 'Sunset prayer. Iftar time in Ramadan. Dua accepted.'
  },
  Isha: {
    ar: 'العشاء', icon: '🌙', type: 'Sunnah 4 + Fard 4 + Sunnah 2 + Witr 3',
    dua_ar: 'اللَّهُمَّ قِنِي عَذَابَكَ يَوْمَ تَبْعَثُ عِبَادَكَ',
    dua_tr: 'O Allah, protect me from Your punishment on Judgement Day',
    info: 'Night prayer. Follow with Tahajjud for extra reward.'
  },
};

// ── FULL 114 SURAHS ─────────────────────────────────────────
const SURAHS = [
  { n: 1, ar: 'الفاتحة', en: 'Al-Fatihah', v: 7, type: 'Meccan', juz: 1 },
  { n: 2, ar: 'البقرة', en: 'Al-Baqarah', v: 286, type: 'Medinan', juz: 1 },
  { n: 3, ar: 'آل عمران', en: "Ali 'Imran", v: 200, type: 'Medinan', juz: 3 },
  { n: 4, ar: 'النساء', en: 'An-Nisa', v: 176, type: 'Medinan', juz: 4 },
  { n: 5, ar: 'المائدة', en: "Al-Ma'idah", v: 120, type: 'Medinan', juz: 6 },
  { n: 6, ar: 'الأنعام', en: "Al-An'am", v: 165, type: 'Meccan', juz: 7 },
  { n: 7, ar: 'الأعراف', en: "Al-A'raf", v: 206, type: 'Meccan', juz: 8 },
  { n: 8, ar: 'الأنفال', en: 'Al-Anfal', v: 75, type: 'Medinan', juz: 9 },
  { n: 9, ar: 'التوبة', en: 'At-Tawbah', v: 129, type: 'Medinan', juz: 10 },
  { n: 10, ar: 'يونس', en: 'Yunus', v: 109, type: 'Meccan', juz: 11 },
  { n: 11, ar: 'هود', en: 'Hud', v: 123, type: 'Meccan', juz: 11 },
  { n: 12, ar: 'يوسف', en: 'Yusuf', v: 111, type: 'Meccan', juz: 12 },
  { n: 13, ar: 'الرعد', en: "Ar-Ra'd", v: 43, type: 'Medinan', juz: 13 },
  { n: 14, ar: 'إبراهيم', en: 'Ibrahim', v: 52, type: 'Meccan', juz: 13 },
  { n: 15, ar: 'الحجر', en: 'Al-Hijr', v: 99, type: 'Meccan', juz: 14 },
  { n: 16, ar: 'النحل', en: 'An-Nahl', v: 128, type: 'Meccan', juz: 14 },
  { n: 17, ar: 'الإسراء', en: "Al-Isra'", v: 111, type: 'Meccan', juz: 15 },
  { n: 18, ar: 'الكهف', en: 'Al-Kahf', v: 110, type: 'Meccan', juz: 15 },
  { n: 19, ar: 'مريم', en: 'Maryam', v: 98, type: 'Meccan', juz: 16 },
  { n: 20, ar: 'طه', en: 'Ta-Ha', v: 135, type: 'Meccan', juz: 16 },
  { n: 21, ar: 'الأنبياء', en: "Al-Anbiya'", v: 112, type: 'Meccan', juz: 17 },
  { n: 22, ar: 'الحج', en: 'Al-Hajj', v: 78, type: 'Medinan', juz: 17 },
  { n: 23, ar: 'المؤمنون', en: "Al-Mu'minun", v: 118, type: 'Meccan', juz: 18 },
  { n: 24, ar: 'النور', en: 'An-Nur', v: 64, type: 'Medinan', juz: 18 },
  { n: 25, ar: 'الفرقان', en: 'Al-Furqan', v: 77, type: 'Meccan', juz: 18 },
  { n: 26, ar: 'الشعراء', en: "Ash-Shu'ara'", v: 227, type: 'Meccan', juz: 19 },
  { n: 27, ar: 'النمل', en: 'An-Naml', v: 93, type: 'Meccan', juz: 19 },
  { n: 28, ar: 'القصص', en: 'Al-Qasas', v: 88, type: 'Meccan', juz: 20 },
  { n: 29, ar: 'العنكبوت', en: "Al-'Ankabut", v: 69, type: 'Meccan', juz: 20 },
  { n: 30, ar: 'الروم', en: 'Ar-Rum', v: 60, type: 'Meccan', juz: 21 },
  { n: 31, ar: 'لقمان', en: 'Luqman', v: 34, type: 'Meccan', juz: 21 },
  { n: 32, ar: 'السجدة', en: 'As-Sajdah', v: 30, type: 'Meccan', juz: 21 },
  { n: 33, ar: 'الأحزاب', en: 'Al-Ahzab', v: 73, type: 'Medinan', juz: 21 },
  { n: 34, ar: 'سبإ', en: "Saba'", v: 54, type: 'Meccan', juz: 22 },
  { n: 35, ar: 'فاطر', en: 'Fatir', v: 45, type: 'Meccan', juz: 22 },
  { n: 36, ar: 'يس', en: 'Ya-Sin', v: 83, type: 'Meccan', juz: 22 },
  { n: 37, ar: 'الصافات', en: 'As-Saffat', v: 182, type: 'Meccan', juz: 23 },
  { n: 38, ar: 'ص', en: 'Sad', v: 88, type: 'Meccan', juz: 23 },
  { n: 39, ar: 'الزمر', en: 'Az-Zumar', v: 75, type: 'Meccan', juz: 23 },
  { n: 40, ar: 'غافر', en: 'Ghafir', v: 85, type: 'Meccan', juz: 24 },
  { n: 41, ar: 'فصلت', en: 'Fussilat', v: 54, type: 'Meccan', juz: 24 },
  { n: 42, ar: 'الشورى', en: "Ash-Shura'", v: 53, type: 'Meccan', juz: 25 },
  { n: 43, ar: 'الزخرف', en: 'Az-Zukhruf', v: 89, type: 'Meccan', juz: 25 },
  { n: 44, ar: 'الدخان', en: 'Ad-Dukhan', v: 59, type: 'Meccan', juz: 25 },
  { n: 45, ar: 'الجاثية', en: 'Al-Jathiyah', v: 37, type: 'Meccan', juz: 25 },
  { n: 46, ar: 'الأحقاف', en: 'Al-Ahqaf', v: 35, type: 'Meccan', juz: 26 },
  { n: 47, ar: 'محمد', en: 'Muhammad', v: 38, type: 'Medinan', juz: 26 },
  { n: 48, ar: 'الفتح', en: 'Al-Fath', v: 29, type: 'Medinan', juz: 26 },
  { n: 49, ar: 'الحجرات', en: 'Al-Hujurat', v: 18, type: 'Medinan', juz: 26 },
  { n: 50, ar: 'ق', en: 'Qaf', v: 45, type: 'Meccan', juz: 26 },
  { n: 51, ar: 'الذاريات', en: 'Adh-Dhariyat', v: 60, type: 'Meccan', juz: 26 },
  { n: 52, ar: 'الطور', en: 'At-Tur', v: 49, type: 'Meccan', juz: 27 },
  { n: 53, ar: 'النجم', en: 'An-Najm', v: 62, type: 'Meccan', juz: 27 },
  { n: 54, ar: 'القمر', en: 'Al-Qamar', v: 55, type: 'Meccan', juz: 27 },
  { n: 55, ar: 'الرحمن', en: 'Ar-Rahman', v: 78, type: 'Medinan', juz: 27 },
  { n: 56, ar: 'الواقعة', en: "Al-Waqi'ah", v: 96, type: 'Meccan', juz: 27 },
  { n: 57, ar: 'الحديد', en: 'Al-Hadid', v: 29, type: 'Medinan', juz: 27 },
  { n: 58, ar: 'المجادلة', en: 'Al-Mujadila', v: 22, type: 'Medinan', juz: 28 },
  { n: 59, ar: 'الحشر', en: 'Al-Hashr', v: 24, type: 'Medinan', juz: 28 },
  { n: 60, ar: 'الممتحنة', en: 'Al-Mumtahanah', v: 13, type: 'Medinan', juz: 28 },
  { n: 61, ar: 'الصف', en: 'As-Saf', v: 14, type: 'Medinan', juz: 28 },
  { n: 62, ar: 'الجمعة', en: "Al-Jumu'ah", v: 11, type: 'Medinan', juz: 28 },
  { n: 63, ar: 'المنافقون', en: 'Al-Munafiqun', v: 11, type: 'Medinan', juz: 28 },
  { n: 64, ar: 'التغابن', en: 'At-Taghabun', v: 18, type: 'Medinan', juz: 28 },
  { n: 65, ar: 'الطلاق', en: 'At-Talaq', v: 12, type: 'Medinan', juz: 28 },
  { n: 66, ar: 'التحريم', en: 'At-Tahrim', v: 12, type: 'Medinan', juz: 28 },
  { n: 67, ar: 'الملك', en: 'Al-Mulk', v: 30, type: 'Meccan', juz: 29 },
  { n: 68, ar: 'القلم', en: 'Al-Qalam', v: 52, type: 'Meccan', juz: 29 },
  { n: 69, ar: 'الحاقة', en: "Al-Haqqah", v: 52, type: 'Meccan', juz: 29 },
  { n: 70, ar: 'المعارج', en: "Al-Ma'arij", v: 44, type: 'Meccan', juz: 29 },
  { n: 71, ar: 'نوح', en: 'Nuh', v: 28, type: 'Meccan', juz: 29 },
  { n: 72, ar: 'الجن', en: 'Al-Jinn', v: 28, type: 'Meccan', juz: 29 },
  { n: 73, ar: 'المزمل', en: 'Al-Muzzammil', v: 20, type: 'Meccan', juz: 29 },
  { n: 74, ar: 'المدثر', en: 'Al-Muddaththir', v: 56, type: 'Meccan', juz: 29 },
  { n: 75, ar: 'القيامة', en: "Al-Qiyamah", v: 40, type: 'Meccan', juz: 29 },
  { n: 76, ar: 'الإنسان', en: 'Al-Insan', v: 31, type: 'Medinan', juz: 29 },
  { n: 77, ar: 'المرسلات', en: 'Al-Mursalat', v: 50, type: 'Meccan', juz: 29 },
  { n: 78, ar: 'النبأ', en: "An-Naba'", v: 40, type: 'Meccan', juz: 30 },
  { n: 79, ar: 'النازعات', en: "An-Nazi'at", v: 46, type: 'Meccan', juz: 30 },
  { n: 80, ar: 'عبس', en: "'Abasa", v: 42, type: 'Meccan', juz: 30 },
  { n: 81, ar: 'التكوير', en: 'At-Takwir', v: 29, type: 'Meccan', juz: 30 },
  { n: 82, ar: 'الانفطار', en: 'Al-Infitar', v: 19, type: 'Meccan', juz: 30 },
  { n: 83, ar: 'المطففين', en: 'Al-Mutaffifin', v: 36, type: 'Meccan', juz: 30 },
  { n: 84, ar: 'الانشقاق', en: 'Al-Inshiqaq', v: 25, type: 'Meccan', juz: 30 },
  { n: 85, ar: 'البروج', en: 'Al-Buruj', v: 22, type: 'Meccan', juz: 30 },
  { n: 86, ar: 'الطارق', en: 'At-Tariq', v: 17, type: 'Meccan', juz: 30 },
  { n: 87, ar: 'الأعلى', en: "Al-A'la", v: 19, type: 'Meccan', juz: 30 },
  { n: 88, ar: 'الغاشية', en: 'Al-Ghashiyah', v: 26, type: 'Meccan', juz: 30 },
  { n: 89, ar: 'الفجر', en: 'Al-Fajr', v: 30, type: 'Meccan', juz: 30 },
  { n: 90, ar: 'البلد', en: 'Al-Balad', v: 20, type: 'Meccan', juz: 30 },
  { n: 91, ar: 'الشمس', en: 'Ash-Shams', v: 15, type: 'Meccan', juz: 30 },
  { n: 92, ar: 'الليل', en: 'Al-Layl', v: 21, type: 'Meccan', juz: 30 },
  { n: 93, ar: 'الضحى', en: 'Ad-Duha', v: 11, type: 'Meccan', juz: 30 },
  { n: 94, ar: 'الشرح', en: 'Ash-Sharh', v: 8, type: 'Meccan', juz: 30 },
  { n: 95, ar: 'التين', en: 'At-Tin', v: 8, type: 'Meccan', juz: 30 },
  { n: 96, ar: 'العلق', en: "Al-'Alaq", v: 19, type: 'Meccan', juz: 30 },
  { n: 97, ar: 'القدر', en: 'Al-Qadr', v: 5, type: 'Meccan', juz: 30 },
  { n: 98, ar: 'البينة', en: 'Al-Bayyinah', v: 8, type: 'Medinan', juz: 30 },
  { n: 99, ar: 'الزلزلة', en: 'Az-Zalzalah', v: 8, type: 'Medinan', juz: 30 },
  { n: 100, ar: 'العاديات', en: "Al-'Adiyat", v: 11, type: 'Meccan', juz: 30 },
  { n: 101, ar: 'القارعة', en: "Al-Qari'ah", v: 11, type: 'Meccan', juz: 30 },
  { n: 102, ar: 'التكاثر', en: 'At-Takathur', v: 8, type: 'Meccan', juz: 30 },
  { n: 103, ar: 'العصر', en: "Al-'Asr", v: 3, type: 'Meccan', juz: 30 },
  { n: 104, ar: 'الهمزة', en: 'Al-Humazah', v: 9, type: 'Meccan', juz: 30 },
  { n: 105, ar: 'الفيل', en: 'Al-Fil', v: 5, type: 'Meccan', juz: 30 },
  { n: 106, ar: 'قريش', en: 'Quraysh', v: 4, type: 'Meccan', juz: 30 },
  { n: 107, ar: 'الماعون', en: "Al-Ma'un", v: 7, type: 'Meccan', juz: 30 },
  { n: 108, ar: 'الكوثر', en: 'Al-Kawthar', v: 3, type: 'Meccan', juz: 30 },
  { n: 109, ar: 'الكافرون', en: 'Al-Kafirun', v: 6, type: 'Meccan', juz: 30 },
  { n: 110, ar: 'النصر', en: 'An-Nasr', v: 3, type: 'Medinan', juz: 30 },
  { n: 111, ar: 'المسد', en: 'Al-Masad', v: 5, type: 'Meccan', juz: 30 },
  { n: 112, ar: 'الإخلاص', en: 'Al-Ikhlas', v: 4, type: 'Meccan', juz: 30 },
  { n: 113, ar: 'الفلق', en: 'Al-Falaq', v: 5, type: 'Meccan', juz: 30 },
  { n: 114, ar: 'الناس', en: 'An-Nas', v: 6, type: 'Meccan', juz: 30 },
];

const DUAS = [
  {
    k: 'sehri-niyyah', cat: 'sehri', title: 'Niyyah for Fasting',
    ar: 'وَبِصَوْمِ غَدٍ نَّوَيْتُ مِنْ شَهْرِ رَمَضَانَ',
    tr: 'Wa bisawmi ghadin nawaitu min shahri Ramadhan',
    en: 'I intend to keep the fast for tomorrow in the month of Ramadan.',
    ur: 'میں نے رمضان کے مہینے میں کل کے روزے کی نیت کی۔',
    src: 'Hadith', hadith: 'The Prophet ﷺ said: whoever does not intend to fast before Fajr has no fast. (Abu Dawud)'
  },
  {
    k: 'iftar-1', cat: 'iftar', title: 'Dua for Breaking Fast',
    ar: 'اللَّهُمَّ لَكَ صُمْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ',
    tr: "Allahumma laka sumtu wa 'ala rizqika aftartu",
    en: 'O Allah! For You I fasted and upon Your provision I break my fast.',
    ur: 'اے اللہ! میں نے تیرے لیے روزہ رکھا اور تیرے رزق سے افطار کیا۔',
    src: 'Abu Dawud', hadith: 'Narrated by Mu\'adh ibn Zahraa (Abu Dawud 2358). Recite at Iftar.'
  },
  {
    k: 'iftar-2', cat: 'iftar', title: 'Short Iftar Dua',
    ar: 'ذَهَبَ الظَّمَأُ وَابْتَلَّتِ الْعُرُوقُ وَثَبَتَ الأَجْرُ إِنْ شَاءَ اللَّهُ',
    tr: "Dhahaba al-zama' wa ibtallatil 'urooq wa thabata al-ajru in sha Allah",
    en: 'Thirst has gone, arteries are moist, and the reward is confirmed, if Allah wills.',
    ur: 'پیاس بجھ گئی، رگیں تر ہو گئیں، اور ثواب ثابت ہوا ان شاء اللہ۔',
    src: 'Abu Dawud', hadith: 'Reported by Ibn Umar (Abu Dawud 2357). Prophet ﷺ read this when breaking fast.'
  },
  {
    k: 'morning-1', cat: 'morning', title: 'Morning Remembrance',
    ar: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ',
    tr: 'Asbahna wa asbahal mulku lillahi wal hamdulillah',
    en: 'We have entered the morning and the dominion belongs to Allah; all praise to Allah.',
    ur: 'ہم نے صبح کی اور اللہ کی بادشاہت نے صبح کی، تمام تعریفیں اللہ کے لیے ہیں۔',
    src: 'Muslim', hadith: 'Narrated by Ibn Masud (Muslim). Recite every morning for protection and blessings.'
  },
  {
    k: 'evening-1', cat: 'evening', title: 'Evening Remembrance',
    ar: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ',
    tr: 'Amsayna wa amsal mulku lillahi wal hamdulillah',
    en: 'We have entered the evening and the dominion belongs to Allah, all praise to Allah.',
    ur: 'ہم نے شام کی اور اللہ کی بادشاہت نے شام کی، تمام تعریفیں اللہ کے لیے ہیں۔',
    src: 'Muslim', hadith: 'Companion of morning remembrance. Recite every evening for protection.'
  },
  {
    k: 'laylatul-qadr', cat: 'forgiveness', title: "Laylat al-Qadr Dua",
    ar: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
    tr: "Allahumma innaka 'afuwwun tuhibbul 'afwa fa'fu 'anni",
    en: 'O Allah, You are Forgiving and love forgiveness, so forgive me.',
    ur: 'اے اللہ! تو معاف کرنے والا ہے، معافی کو پسند کرتا ہے، پس مجھے معاف فرما دے۔',
    src: 'Tirmidhi', hadith: "Aisha (RA) asked what to say on Laylat al-Qadr. Prophet ﷺ taught this dua. (Tirmidhi 3513)"
  },
  {
    k: 'istighfar', cat: 'forgiveness', title: 'Seeking Forgiveness',
    ar: 'رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنتَ التَّوَّابُ الرَّحِيمُ',
    tr: "Rabbigh fir li wa tub 'alayya innaka antat-Tawwabur-Rahim",
    en: 'O Lord! Forgive me and accept my repentance. You are the Oft-Returning, Most Merciful.',
    ur: 'اے میرے رب! مجھے بخش دے اور میری توبہ قبول کر۔ تو بڑا توبہ قبول کرنے والا، مہربان ہے۔',
    src: "At-Tawbah 9:118", hadith: 'Prophet ﷺ recited Istighfar over 100 times daily. Increase in Ramadan greatly.'
  },
  {
    k: 'quran-286', cat: 'morning', title: 'Dua from Al-Baqarah',
    ar: 'رَبَّنَا لَا تُؤَاخِذْنَا إِن نَّسِينَا أَوْ أَخْطَأْنَا',
    tr: "Rabbana la tu'akhidhna in nasina aw akhta'na",
    en: 'Our Lord, do not impose blame upon us if we have forgotten or erred.',
    ur: 'اے ہمارے رب! اگر ہم بھول جائیں یا غلطی کریں تو ہمیں نہ پکڑنا۔',
    src: 'Al-Baqarah 2:286', hadith: 'Allah replied: I have done so. (Muslim 125). Recite daily for forgiveness.'
  },
  {
    k: 'taraweeh-break', cat: 'taraweeh', title: 'Taraweeh Break Dua',
    ar: 'سُبْحَانَ ذِي الْمُلْكِ وَالْمَلَكُوتِ سُبْحَانَ ذِي الْعِزَّةِ وَالْعَظَمَةِ',
    tr: 'Subhana dhil mulki wal malakuti, subhana dhil izzati wal azamati',
    en: 'Glory to the Owner of dominion. Glory to the Owner of Might and Greatness.',
    ur: 'پاک ہے وہ جو بادشاہت کا مالک ہے۔ پاک ہے وہ جو عزت و عظمت کا مالک ہے۔',
    src: 'Tradition', hadith: 'Traditionally recited after every 4 Rakahs of Taraweeh during Ramadan.'
  },
];

const RECIPES = [
  {
    cat: 'sehri', name: 'Aloo Paratha', desc: 'Crispy stuffed flatbread with spiced potato filling', e: '🫓', t: '30m', s: '4', d: 'Easy',
    ingredients: ['2 cups flour', '3 boiled potatoes', '1 tsp cumin', '1 tsp chili', 'Salt', 'Butter'],
    steps: ['Knead dough, rest 20 mins', 'Mash potatoes with spices', 'Stuff and roll dough', 'Cook on tawa with butter till golden']
  },
  {
    cat: 'sehri', name: 'Fruit Yogurt Bowl', desc: 'Seasonal fruits with honey yogurt for sustained energy', e: '🥣', t: '10m', s: '2', d: 'Easy',
    ingredients: ['1 cup yogurt', '1 banana', '½ cup berries', '2 tbsp honey', 'Granola'],
    steps: ['Layer yogurt in bowl', 'Add chopped fruits on top', 'Drizzle honey generously', 'Add granola and serve cold']
  },
  {
    cat: 'sehri', name: 'Haleem', desc: 'Slow-cooked wheat and lentil porridge packed with protein', e: '🍲', t: '2hr', s: '6', d: 'Medium',
    ingredients: ['500g beef', '1 cup wheat', '½ cup lentils', 'Haleem masala', 'Ginger garlic'],
    steps: ['Soak wheat overnight', 'Pressure cook beef 45 mins', 'Add lentils and cook 30 mins', 'Blend and simmer with spices']
  },
  {
    cat: 'iftar', name: 'Dates (Khajoor)', desc: 'Start Iftar with Sunnah — 3 dates as Prophet ﷺ recommended', e: '🌴', t: '0m', s: 'All', d: 'Easy',
    ingredients: ['Medjool dates', 'Water (Zamzam preferred)'],
    steps: ['Place 3 dates ready before Maghrib', 'Recite Iftar dua at Maghrib', 'Break fast with dates first', 'Drink water then begin meal']
  },
  {
    cat: 'iftar', name: 'Samosa Chaat', desc: 'Crispy samosas topped with yogurt and tangy chutneys', e: '🥟', t: '45m', s: '6', d: 'Medium',
    ingredients: ['6 samosas', '1 cup yogurt', 'Tamarind chutney', 'Green chutney', 'Sev', 'Chaat masala'],
    steps: ['Fry samosas till crispy', 'Crush slightly in bowl', 'Pour whisked yogurt', 'Top with chutneys and sev']
  },
  {
    cat: 'iftar', name: 'Chicken Karahi', desc: 'Rich aromatic Pakistani chicken curry cooked in a wok', e: '🍛', t: '50m', s: '5', d: 'Medium',
    ingredients: ['1kg chicken', '4 tomatoes', 'Ginger paste', 'Green chilies', 'Karahi masala', 'Oil'],
    steps: ['Heat oil, fry ginger 2 mins', 'Add chicken, sear 10 mins', 'Add tomatoes and masala', 'Cook till oil separates']
  },
  {
    cat: 'drinks', name: 'Rooh Afza Sharbat', desc: 'Classic rose-flavored iced drink — the taste of Ramadan', e: '🍹', t: '5m', s: '4', d: 'Easy',
    ingredients: ['3 tbsp Rooh Afza', '2 cups chilled milk', 'Ice cubes', 'Rose petals optional'],
    steps: ['Add Rooh Afza to glass', 'Pour cold milk over', 'Add ice cubes', 'Stir gently and serve immediately']
  },
  {
    cat: 'drinks', name: 'Watermelon Mint Juice', desc: 'Hydrating refreshing juice to replenish after fasting', e: '🍉', t: '5m', s: '3', d: 'Easy',
    ingredients: ['Half watermelon', 'Mint leaves', 'Lemon juice', 'Salt and pepper', 'Ice'],
    steps: ['Remove seeds from watermelon', 'Blend with mint and lemon', 'Strain if preferred', 'Serve over ice with pinch of salt']
  },
  {
    cat: 'sweets', name: 'Sheer Khurma', desc: 'Vermicelli pudding with dates, milk and rose water', e: '🍮', t: '30m', s: '8', d: 'Easy',
    ingredients: ['200g vermicelli', '1L milk', '10 dates', '½ cup sugar', 'Cardamom', 'Rose water', 'Dry fruits'],
    steps: ['Fry vermicelli in ghee till golden', 'Add milk, bring to boil', 'Add dates, sugar, cardamom', 'Simmer 15 mins, add rose water']
  },
  {
    cat: 'sweets', name: 'Kheer', desc: 'Traditional rice pudding fragrant with cardamom and saffron', e: '🥛', t: '60m', s: '6', d: 'Easy',
    ingredients: ['½ cup rice', '1L milk', '¾ cup sugar', 'Saffron', 'Cardamom', 'Pistachio'],
    steps: ['Soak rice 30 mins', 'Boil milk, add rice, stir constantly', 'Cook 40 mins on low heat', 'Add sugar and saffron, garnish']
  },
  {
    cat: 'snacks', name: 'Pakoras', desc: 'Golden-fried vegetable fritters — quintessential Iftar snack', e: '🧆', t: '20m', s: '6', d: 'Easy',
    ingredients: ['2 cups chickpea flour', '1 onion sliced', '1 potato', 'Green chilies', 'Spices', 'Oil'],
    steps: ['Mix flour with spices and water', 'Add vegetables, mix well', 'Heat oil to 180°C', 'Fry spoonfuls 3-4 mins till golden']
  },
  {
    cat: 'snacks', name: 'Dahi Bhalle', desc: 'Soft lentil dumplings in cool yogurt with tangy chutneys', e: '🥙', t: '40m', s: '6', d: 'Medium',
    ingredients: ['1 cup urad lentils', '2 cups yogurt', 'Tamarind chutney', 'Chaat masala', 'Cumin'],
    steps: ['Soak lentils overnight, grind', 'Fry small balls till golden', 'Soak in water 10 mins', 'Serve with yogurt and chutneys']
  },
];

const VIDEOS = [
  { cat: 'quran', title: 'Beautiful Recitation — Surah Ar-Rahman', ch: 'Sheikh Mishary Rashid', e: '📖', dur: '8:30', v: '12M', tags: ['Recitation', 'Rahman'] },
  { cat: 'quran', title: 'Complete Surah Al-Baqarah', ch: 'Sheikh Al-Sudais', e: '📖', dur: '2:17:00', v: '45M', tags: ['Long Surah', 'Baqarah'] },
  { cat: 'quran', title: 'Surah Ya-Sin with Translation', ch: 'Sheikh Saad Al-Ghamdi', e: '📖', dur: '22:00', v: '8.5M', tags: ['Ya-Sin', 'Translation'] },
  { cat: 'lecture', title: 'The Importance of Ramadan', ch: 'Dr. Zakir Naik', e: '🎙️', dur: '45:00', v: '8.2M', tags: ['Ramadan', 'Importance'] },
  { cat: 'lecture', title: '30 Days 30 Lessons — Ramadan', ch: 'Mufti Menk', e: '🎙️', dur: '25:00', v: '5.1M', tags: ['Daily Lesson', 'Series'] },
  { cat: 'lecture', title: 'What is Laylat al-Qadr?', ch: 'Yasir Qadhi', e: '🌙', dur: '35:00', v: '9.3M', tags: ['Laylatul Qadr', 'Night'] },
  { cat: 'lecture', title: 'Ramadan — Month of Transformation', ch: 'Omar Suleiman', e: '🎙️', dur: '28:00', v: '11M', tags: ['Transformation', 'Spiritual'] },
  { cat: 'dua', title: 'Duas for Every Part of Ramadan', ch: 'Bilal Assad', e: '🤲', dur: '12:00', v: '3.4M', tags: ['Collection', 'Ramadan'] },
  { cat: 'dua', title: 'Most Powerful Duas in Ramadan', ch: 'Nouman Ali Khan', e: '🤲', dur: '18:30', v: '6.7M', tags: ['Powerful', 'NAK'] },
  { cat: 'dua', title: 'Morning & Evening Adhkar', ch: 'HikmahWay', e: '🤲', dur: '20:00', v: '2.1M', tags: ['Morning', 'Evening'] },
  { cat: 'taraweeh', title: 'Taraweeh Prayer — Complete 20 Rakahs', ch: 'Masjid Al-Haram', e: '🕌', dur: '1:45:00', v: '22M', tags: ['Makkah', 'Full'] },
  { cat: 'taraweeh', title: 'Taraweeh at Home Guide', ch: 'SeekersGuidance', e: '🕌', dur: '15:00', v: '1.9M', tags: ['Home', 'Guide'] },
];

const PRAYER_TIMES_FB = {
  Karachi: { Fajr: '05:07', Sunrise: '06:25', Dhuhr: '12:26', Asr: '15:55', Maghrib: '18:28', Isha: '19:52' },
  Lahore: { Fajr: '04:51', Sunrise: '06:10', Dhuhr: '12:14', Asr: '15:46', Maghrib: '18:18', Isha: '19:40' },
  Islamabad: { Fajr: '04:48', Sunrise: '06:07', Dhuhr: '12:10', Asr: '15:42', Maghrib: '18:13', Isha: '19:36' },
  Sukkur: { Fajr: '05:02', Sunrise: '06:20', Dhuhr: '12:23', Asr: '15:52', Maghrib: '18:25', Isha: '19:49' },
  Peshawar: { Fajr: '04:44', Sunrise: '06:05', Dhuhr: '12:06', Asr: '15:38', Maghrib: '18:09', Isha: '19:32' },
  Quetta: { Fajr: '04:55', Sunrise: '06:18', Dhuhr: '12:22', Asr: '15:50', Maghrib: '18:24', Isha: '19:48' },
  Multan: { Fajr: '04:56', Sunrise: '06:14', Dhuhr: '12:18', Asr: '15:49', Maghrib: '18:21', Isha: '19:44' },
  Hyderabad: { Fajr: '05:05', Sunrise: '06:23', Dhuhr: '12:24', Asr: '15:53', Maghrib: '18:26', Isha: '19:50' },
};

// ── STATE ────────────────────────────────────────────────────
// Store prayers as: { "YYYY-MM-DD_PrayerName": true }
let prayerLog = JSON.parse(localStorage.getItem('ah_plog') || '{}');
let quranProgress = JSON.parse(localStorage.getItem('ah_qp') || '{}');
let currentSurah = null;
let currentTimes = null;
let currentAudio = null;
let chatSessionId = null;
let surahVerses = {};  // cache verses

// ── INIT ────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const t = localStorage.getItem('ah_theme');
  if (t) document.documentElement.dataset.theme = t;
  setTimeout(() => document.getElementById('loader')?.classList.add('out'), 1800);

  generateStars();
  checkAuth();
  renderSurahList();
  renderDuas('all');
  renderRecipes('all');
  renderVideos();
  initPrayerTracker();
  initQuranTracker();
  initFastingTracker();
  startCountdown();
  calcFitrana();
  updateRamadanInfo();

  // Sync fasting log from server
  if (TOKEN) {
    apiFetch('/fasting/log').then(rows => {
      if (Array.isArray(rows)) {
        rows.forEach(r => {
          const ds = typeof r.fast_date === 'string' ? r.fast_date.substring(0, 10) : toDateStr(new Date(r.fast_date));
          fastingLog[ds] = { fasted: r.fasted, sehri_eaten: r.sehri_eaten, ramadan_day: r.ramadan_day };
        });
        localStorage.setItem('ah_flog', JSON.stringify(fastingLog));
        initFastingTracker();
      }
    }).catch(() => { });
  }

  // Scroll effect on navbar
  window.addEventListener('scroll', () => {
    document.querySelector('.navbar')?.classList.toggle('scrolled', window.scrollY > 20);
  });
});

// ══════════════════════════════════════════════════════════
// AUTH
// ══════════════════════════════════════════════════════════
function authHdr() {
  return { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + TOKEN };
}

async function apiFetch(p, o = {}) {
  const r = await fetch(API + p, {
    headers: authHdr(), ...o,
    body: o.body ? JSON.stringify(o.body) : undefined
  });
  return r.json();
}

function checkAuth() {
  if (TOKEN && USER) {
    updateChip();
    loadPrayerTimes();
    syncFromServer();
  } else {
    document.getElementById('loginModal')?.classList.add('open');
  }
}

function updateChip() {
  if (!USER) return;
  const c = document.getElementById('userChip');
  if (c) {
    c.querySelector('.user-avatar').textContent = USER.full_name[0].toUpperCase();
    c.querySelector('.chip-name').textContent = USER.full_name.split(' ')[0];
  }
  const pmName = document.getElementById('pm-name');
  if (pmName) {
    document.getElementById('pm-name').textContent = USER.full_name || '—';
    document.getElementById('pm-email').textContent = USER.email || '—';
    document.getElementById('pm-city').textContent = '📍 ' + (USER.city || '—');
  }
}

async function syncFromServer() {
  if (!TOKEN) return;
  try {
    const prog = await apiFetch('/quran/progress');
    if (Array.isArray(prog)) {
      prog.forEach(p => {
        quranProgress[p.surah_number] = { ayah: p.last_ayah, done: p.is_completed };
      });
      localStorage.setItem('ah_qp', JSON.stringify(quranProgress));
      initQuranTracker();
    }
    const logs = await apiFetch('/prayer/log');
    if (Array.isArray(logs)) {
      logs.forEach(l => {
        if (l.prayed) {
          const ds = typeof l.prayer_date === 'string'
            ? l.prayer_date.substring(0, 10)
            : toDateStr(new Date(l.prayer_date));
          prayerLog[ds + '_' + l.prayer_name] = true;
        }
      });
      localStorage.setItem('ah_plog', JSON.stringify(prayerLog));
      initPrayerTracker();
      renderPrayerStats();
    }
  } catch (e) { }
}

async function doLogin() {
  const email = document.getElementById('loginEmail').value.trim();
  const pw = document.getElementById('loginPw').value;
  if (!email || !pw) return showToast('⚠️', 'Please fill all fields');
  const d = await apiFetch('/auth/login', { method: 'POST', body: { email, password: pw } });
  if (d.error) return showToast('❌', d.error);
  TOKEN = d.token; USER = d.user;
  localStorage.setItem('ah_token', TOKEN);
  localStorage.setItem('ah_user', JSON.stringify(USER));
  closeModal('loginModal');
  updateChip(); loadPrayerTimes(); syncFromServer();
  showToast('🌙', `Welcome back, ${USER.full_name.split(' ')[0]}!`);
}

async function doRegister() {
  const d = {
    full_name: document.getElementById('regName').value.trim(),
    email: document.getElementById('regEmail').value.trim(),
    password: document.getElementById('regPw').value,
    city: document.getElementById('regCity').value,
    country: 'Pakistan',
    latitude: parseFloat(document.getElementById('regLat').value) || 24.86,
    longitude: parseFloat(document.getElementById('regLon').value) || 67.01,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Karachi',
    calc_method: 1,
  };
  if (!d.full_name || !d.email || !d.password || !d.city)
    return showToast('⚠️', 'All fields required');
  const r = await apiFetch('/auth/register', { method: 'POST', body: d });
  if (r.error) return showToast('❌', r.error);
  TOKEN = r.token; USER = r.user;
  localStorage.setItem('ah_token', TOKEN);
  localStorage.setItem('ah_user', JSON.stringify(USER));
  closeModal('loginModal'); updateChip(); loadPrayerTimes();
  showToast('🌙', `Welcome, ${USER.full_name.split(' ')[0]}! Ramadan Mubarak!`);
}

function doLogout() {
  TOKEN = null; USER = null;
  localStorage.removeItem('ah_token');
  localStorage.removeItem('ah_user');
  location.reload();
}

function getLocation() {
  if (!navigator.geolocation) return showToast('⚠️', 'Geolocation not supported');
  navigator.geolocation.getCurrentPosition(pos => {
    document.getElementById('regLat').value = pos.coords.latitude.toFixed(6);
    document.getElementById('regLon').value = pos.coords.longitude.toFixed(6);
    showToast('📍', 'Location detected!');
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${pos.coords.latitude}&lon=${pos.coords.longitude}&format=json`)
      .then(r => r.json()).then(data => {
        const city = data.address?.city || data.address?.town || data.address?.state || '';
        if (city) document.getElementById('regCity').value = city;
      }).catch(() => { });
  }, () => showToast('⚠️', 'Could not get location'));
}

// ══════════════════════════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════════════════════════
function showSection(id) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  const sec = document.getElementById(id);
  if (sec) sec.classList.add('active');
  const nav = document.getElementById('nav-' + id);
  if (nav) nav.classList.add('active');
  document.getElementById('navLinks')?.classList.remove('open');
  window.scrollTo(0, 0);
  if (id === 'prayer') { loadPrayerTimes(); renderPrayerStats(); }
  if (id === 'quran') { checkContinueReading(); }
}

function checkContinueReading() {
  const banner = document.getElementById('quranContinueBanner');
  const text = document.getElementById('qContinueText');

  // Find surah with the most recent last_read_at timestamp
  // quranProgress keys are surah numbers; sort by the stored timestamp
  let lastReadSurah = null;
  let lastReadAyah = null;

  const entries = Object.entries(quranProgress);
  if (entries.length > 0) {
    // Sort by last_read_at descending (most recent first)
    entries.sort((a, b) => {
      const ta = new Date(a[1].last_read_at || 0).getTime();
      const tb = new Date(b[1].last_read_at || Date.now()).getTime();
      return tb - ta;
    });
    lastReadSurah = Number(entries[0][0]);
    lastReadAyah = entries[0][1].ayah || 1;
  }

  if (lastReadSurah) {
    const s = SURAHS.find(x => x.n === lastReadSurah);
    if (s && text && banner) {
      text.textContent = `Surah ${s.en} — Ayah ${lastReadAyah}`;
      banner.classList.remove('hidden');
      window._resumeQuranData = lastReadSurah;
    }
  } else {
    if (banner) banner.classList.add('hidden');
  }
}

function resumeQuran() {
  if (window._resumeQuranData) openSurah(window._resumeQuranData);
}

function toggleNav() {
  document.getElementById('navLinks')?.classList.toggle('open');
}

function toggleTheme() {
  const h = document.documentElement;
  h.dataset.theme = h.dataset.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('ah_theme', h.dataset.theme);
}

// ══════════════════════════════════════════════════════════
// STARS
// ══════════════════════════════════════════════════════════
function generateStars() {
  const c = document.getElementById('starsBg');
  if (!c) return;
  for (let i = 0; i < 80; i++) {
    const s = document.createElement('div');
    s.className = 'star';
    s.style.cssText = `left:${Math.random() * 100}%;top:${Math.random() * 100}%;
      animation-delay:${Math.random() * 4}s;animation-duration:${2 + Math.random() * 3}s;
      width:${1 + Math.random() * 2}px;height:${1 + Math.random() * 2}px;`;
    c.appendChild(s);
  }
}

// ══════════════════════════════════════════════════════════
// FIX 1: NEXT RAMADAN DATE (not current Ramadan)
// ══════════════════════════════════════════════════════════
function updateRamadanInfo() {
  // Next Ramadan starts approx March 1, 2026 (Ramadan 1447 AH)
  // Calculate days until next Ramadan
  const now = new Date();

  // Approximate next Ramadan dates
  // Ramadan 1447 AH: ~Feb 28, 2026
  // Ramadan 1448 AH: ~Feb 17, 2027
  let nextRamadan = new Date('2026-02-28');
  let ramadanYear = '1447';

  if (now > new Date('2026-03-30')) {
    nextRamadan = new Date('2027-02-17');
    ramadanYear = '1448';
  }

  const diffMs = nextRamadan - now;
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);
  const remDays = diffDays % 30;

  // Update countdown label on home page
  const cdLabel = document.getElementById('cdLabel');
  if (cdLabel) cdLabel.textContent = 'Ramadan';

  // Update hijri date display in prayer section
  const hijriEl = document.getElementById('hijriDate');
  if (hijriEl) {
    hijriEl.textContent = `Next Ramadan ${ramadanYear} AH`;
  }

  // Show next Ramadan info box if element exists
  const ramadanInfoEl = document.getElementById('nextRamadanInfo');
  if (ramadanInfoEl) {
    ramadanInfoEl.innerHTML = `
      <div style="display:flex;align-items:center;gap:1rem;flex-wrap:wrap">
        <div style="font-size:2.5rem">🌙</div>
        <div>
          <div style="font-family:var(--ff-display);font-size:1.1rem;color:var(--teal-l);font-weight:700">
            Next Ramadan ${ramadanYear} AH
          </div>
          <div style="font-size:.88rem;color:var(--t2);margin-top:3px">
            Starts around <strong style="color:var(--teal-l)">${nextRamadan.toLocaleDateString('en-PK', { day: 'numeric', month: 'long', year: 'numeric' })}</strong>
          </div>
          <div style="font-size:.82rem;color:var(--t3);margin-top:2px">
            📅 ${diffDays} days away (≈ ${diffMonths} months ${remDays} days)
          </div>
        </div>
      </div>`;
    ramadanInfoEl.style.display = 'block';
  }
}

// ══════════════════════════════════════════════════════════
// PRAYER TIMES
// ══════════════════════════════════════════════════════════
async function loadPrayerTimes() {
  const city = USER?.city || 'Sukkur';
  const now = new Date();

  const pCityEl = document.getElementById('pCityName');
  const pDateEl = document.getElementById('pDate');
  if (pCityEl) pCityEl.textContent = city + ', Pakistan';
  if (pDateEl) pDateEl.textContent = now.toLocaleDateString('en-PK', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  let timings = PRAYER_TIMES_FB[city] || PRAYER_TIMES_FB['Sukkur'];

  if (TOKEN) {
    try {
      const data = await apiFetch('/prayer/times');
      if (data.timings) timings = data.timings;
    } catch (e) { }
  }

  currentTimes = timings;

  const sehriEl = document.getElementById('sehriTime');
  const iftarEl = document.getElementById('iftarTime');
  if (sehriEl) sehriEl.textContent = timings.Fajr || '--:--';
  if (iftarEl) iftarEl.textContent = timings.Maghrib || '--:--';

  renderPrayerCards(timings);
  updateNextPrayer(timings);
  renderPrayerStats();
}

// ── FIX 2: PRAYER MARKING — FULLY WORKING ──────────────────
function renderPrayerCards(t) {
  const prayers = [
    { n: 'Fajr', ar: 'الفجر', icon: '🌙', time: t.Fajr },
    { n: 'Sunrise', ar: 'الشروق', icon: '🌄', time: t.Sunrise },
    { n: 'Dhuhr', ar: 'الظهر', icon: '☀️', time: t.Dhuhr },
    { n: 'Asr', ar: 'العصر', icon: '🌤️', time: t.Asr },
    { n: 'Maghrib', ar: 'المغرب', icon: '🌅', time: t.Maghrib },
    { n: 'Isha', ar: 'العشاء', icon: '🌙', time: t.Isha },
  ];

  const now = new Date();
  const nowM = now.getHours() * 60 + now.getMinutes();
  let curIdx = 0;
  prayers.forEach((p, i) => {
    const [h, m] = (p.time || '00:00').split(':').map(Number);
    if (h * 60 + m <= nowM) curIdx = i;
  });

  const today = toDateStr(now);
  const grid = document.getElementById('prayersGrid');
  if (!grid) return;

  grid.innerHTML = prayers.map((p, i) => {
    const info = PRAYER_INFO[p.n] || {};
    const key = today + '_' + p.n;
    const prayed = !!prayerLog[key];
    const skip = p.n === 'Sunrise';

    return `
    <div class="prayer-card ${i === curIdx ? 'current' : ''}" id="pcard-${p.n}">
      <div class="p-icon">${p.icon}</div>
      <div class="p-ar">${p.ar}</div>
      <div class="p-name">${p.n}</div>
      <div class="p-time">${p.time || '--:--'}</div>
      ${!skip ? `
        <div class="p-check">
          <button
            class="check-btn ${prayed ? 'prayed' : ''}"
            id="cbtn-${p.n}"
            onclick="markPrayer('${p.n}', '${today}', this)">
            ${prayed ? '✅ Prayed' : '○ Mark Prayed'}
          </button>
        </div>` : ''}
      ${i === curIdx ? '<div style="font-size:.65rem;color:var(--teal-l);margin-top:5px;letter-spacing:1px;font-weight:700">▶ CURRENT</div>' : ''}
      ${info.rakats ? `
      <div class="prayer-popup">
        <div class="pp-title">${p.n} Prayer</div>
        <div class="pp-row"><span class="lbl">Rakats:</span><span class="val">${info.type}</span></div>
        <div class="pp-row"><span class="lbl">Time:</span><span class="val">${p.time || '--:--'}</span></div>
        <div class="pp-row" style="align-items:flex-start"><span class="lbl">Info:</span><span class="val" style="font-size:.75rem">${info.info || ''}</span></div>
        ${info.dua_ar ? `<div class="pp-dua">
          <div class="ar">${info.dua_ar}</div>
          <div class="tr">${info.dua_tr}</div>
        </div>` : ''}
      </div>` : ''}
    </div>`;
  }).join('');
}

// ── MARK PRAYER — FIXED ─────────────────────────────────────
async function markPrayer(name, date, btn) {
  const key = date + '_' + name;
  const nowVal = !prayerLog[key];   // toggle

  if (nowVal) {
    prayerLog[key] = true;
  } else {
    delete prayerLog[key];
  }

  // Persist immediately
  localStorage.setItem('ah_plog', JSON.stringify(prayerLog));

  // Update button visually
  btn.className = 'check-btn ' + (nowVal ? 'prayed' : '');
  btn.textContent = nowVal ? '✅ Prayed' : '○ Mark Prayed';

  showToast(nowVal ? '🕌' : '⬜', nowVal ? `${name} marked as prayed!` : `${name} unmarked`);

  // Refresh tracker and stats
  initPrayerTracker();
  renderPrayerStats();

  // Sync to server
  if (TOKEN) {
    try {
      await apiFetch('/prayer/log', {
        method: 'POST',
        body: { prayer_name: name, prayer_date: date, prayed: nowVal }
      });
    } catch (e) { }
  }
}

function updateNextPrayer(t) {
  const prayers = [
    { n: 'Fajr', time: t.Fajr },
    { n: 'Dhuhr', time: t.Dhuhr },
    { n: 'Asr', time: t.Asr },
    { n: 'Maghrib', time: t.Maghrib },
    { n: 'Isha', time: t.Isha },
  ];
  const now = new Date();
  const nowM = now.getHours() * 60 + now.getMinutes();
  let next = prayers.find(p => {
    const [h, m] = (p.time || '00:00').split(':').map(Number);
    return h * 60 + m > nowM;
  });
  if (!next) next = prayers[0];

  const nPName = document.getElementById('nextPName');
  const nPTime = document.getElementById('nextPTime');
  const nPIn = document.getElementById('nextPIn');

  if (nPName) nPName.textContent = next.n;
  if (nPTime) nPTime.textContent = next.time || '--:--';

  if (nPIn) {
    const [h, m] = (next.time || '00:00').split(':').map(Number);
    const target = new Date(); target.setHours(h, m, 0);
    if (target < now) target.setDate(target.getDate() + 1);
    const diff = target - now;
    const dh = Math.floor(diff / 3600000);
    const dm = Math.floor((diff % 3600000) / 60000);
    nPIn.textContent = `in ${dh}h ${dm}m`;
  }
}

// ── PRAYER TRACKER ────────────────────────────────────────────
function initPrayerTracker() {
  const c = document.getElementById('prayerTracker');
  if (!c) return;
  const today = new Date();
  c.innerHTML = '';

  for (let d = 1; d <= 30; d++) {
    const dt = new Date(today.getFullYear(), today.getMonth(), d);
    const ds = toDateStr(dt);
    const count = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
      .filter(p => prayerLog[ds + '_' + p]).length;
    const div = document.createElement('div');
    div.className = `t-cell ${count >= 5 ? 'done' : count > 0 ? 'today' : ''} ${d === today.getDate() ? 'today' : ''}`;
    div.textContent = d;
    div.title = `Day ${d}: ${count}/5 prayers`;
    c.appendChild(div);
  }
}

// ── FIX 3: PRAYER STATS SECTION ──────────────────────────────
function renderPrayerStats() {
  const statsEl = document.getElementById('prayerStatsSection');
  if (!statsEl) return;

  // Count all prayers from the log
  const allKeys = Object.keys(prayerLog).filter(k => prayerLog[k] === true);
  const total = allKeys.length;

  // Count by prayer name
  const counts = { Fajr: 0, Dhuhr: 0, Asr: 0, Maghrib: 0, Isha: 0 };
  allKeys.forEach(k => {
    const parts = k.split('_');
    const name = parts[parts.length - 1];
    if (counts[name] !== undefined) counts[name]++;
  });

  // Days with all 5 prayers
  const daySet = {};
  allKeys.forEach(k => {
    const parts = k.split('_');
    const date = parts.slice(0, -1).join('_');
    if (!daySet[date]) daySet[date] = 0;
    daySet[date]++;
  });
  const fullDays = Object.values(daySet).filter(c => c >= 5).length;

  // Streak — consecutive days with all 5 prayers
  let streak = 0;
  const today = new Date();
  for (let i = 0; i < 30; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const ds = toDateStr(d);
    const c = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
      .filter(p => prayerLog[ds + '_' + p]).length;
    if (c >= 5) streak++;
    else break;
  }

  const pct = total > 0 ? Math.round((fullDays / 30) * 100) : 0;

  statsEl.innerHTML = `
    <div class="card card-teal mt-3">
      <h3 class="fw-d" style="color:var(--teal-l);font-size:.95rem;letter-spacing:1px;margin-bottom:1.2rem">
        📊 YOUR PRAYER HISTORY
      </h3>

      <!-- Overall Stats -->
      <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:1rem;margin-bottom:1.5rem">
        <div style="background:var(--bgc);border:1px solid var(--b);border-radius:var(--radius);padding:1rem;text-align:center;transition:all .3s" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform=''">
          <div style="font-family:var(--ff-d);font-size:2rem;font-weight:700;color:var(--teal-l)">${total}</div>
          <div style="font-size:.72rem;color:var(--t3);letter-spacing:1px;text-transform:uppercase;font-weight:700">Total Prayers</div>
        </div>
        <div style="background:var(--bgc);border:1px solid var(--b);border-radius:var(--radius);padding:1rem;text-align:center;transition:all .3s" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform=''">
          <div style="font-family:var(--ff-d);font-size:2rem;font-weight:700;color:var(--jade-l)">${fullDays}</div>
          <div style="font-size:.72rem;color:var(--t3);letter-spacing:1px;text-transform:uppercase;font-weight:700">Full Days</div>
        </div>
        <div style="background:var(--bgc);border:1px solid var(--b);border-radius:var(--radius);padding:1rem;text-align:center;transition:all .3s" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform=''">
          <div style="font-family:var(--ff-d);font-size:2rem;font-weight:700;color:var(--amber)">${streak}</div>
          <div style="font-size:.72rem;color:var(--t3);letter-spacing:1px;text-transform:uppercase;font-weight:700">Day Streak 🔥</div>
        </div>
        <div style="background:var(--bgc);border:1px solid var(--b);border-radius:var(--radius);padding:1rem;text-align:center;transition:all .3s" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform=''">
          <div style="font-family:var(--ff-d);font-size:2rem;font-weight:700;color:var(--teal-l)">${pct}%</div>
          <div style="font-size:.72rem;color:var(--t3);letter-spacing:1px;text-transform:uppercase;font-weight:700">Completion</div>
        </div>
      </div>

      <!-- Per Prayer Breakdown -->
      <h4 style="font-size:.8rem;color:var(--t2);font-weight:700;letter-spacing:1px;text-transform:uppercase;margin-bottom:.8rem">
        Per Prayer Breakdown
      </h4>
      <div style="display:flex;flex-direction:column;gap:.6rem">
        ${Object.entries(counts).map(([name, count]) => {
    const info = PRAYER_INFO[name] || {};
    const pct2 = Math.round((count / 30) * 100);
    const color = pct2 >= 80 ? 'var(--jade-l)' : pct2 >= 50 ? 'var(--amber)' : 'var(--ruby)';
    return `
          <div style="display:flex;align-items:center;gap:1rem">
            <div style="min-width:90px;display:flex;align-items:center;gap:6px">
              <span>${info.icon || '🕌'}</span>
              <span style="font-size:.82rem;font-weight:700;color:var(--t1)">${name}</span>
            </div>
            <div style="flex:1;position:relative">
              <div class="prog-bar">
                <div class="prog-fill" style="width:${pct2}%;background:linear-gradient(90deg,${color},${color}99)"></div>
              </div>
            </div>
            <div style="min-width:60px;text-align:right;font-size:.8rem;font-weight:700;color:${color}">
              ${count}/30 (${pct2}%)
            </div>
          </div>`;
  }).join('')}
      </div>

      <!-- Motivational Message -->
      <div style="margin-top:1.2rem;padding:.9rem 1.1rem;background:rgba(13,115,119,.07);
        border-radius:var(--radius);border-left:3px solid var(--teal);font-size:.83rem;color:var(--t2);line-height:1.7">
        ${getMotivatMsg(total, streak)}
      </div>
      <button class="btn btn-outline" style="width:100%;margin-top:1rem;justify-content:center;" onclick="sharePrayerProgress()">📤 Share Progress</button>
    </div>`;
}

function sharePrayerProgress() {
  const text = `🌙 My Ramadan Prayer Progress:\nSee my tracker on Al-Hidayah!`;
  if (navigator.share) {
    navigator.share({ title: 'My Prayer Progress', text: text }).catch(() => { });
  } else {
    navigator.clipboard.writeText(text).then(() => showToast('📋', 'Progress copied to clipboard!'));
  }
}

function getMotivatMsg(total, streak) {
  if (total === 0) return '🌟 Start marking your prayers to track your spiritual journey. Every prayer is a step closer to Allah.';
  if (streak >= 7) return `🔥 MashaAllah! ${streak} day streak! The Prophet ﷺ said: "The most beloved deeds to Allah are those done consistently." Keep it up!`;
  if (streak >= 3) return `✨ SubhanAllah! ${streak} days in a row. Consistency is the key — "Pray as if it is your last prayer." (Hadith)`;
  if (total >= 25) return `🌙 Alhamdulillah! ${total} prayers logged. "Indeed, prayer prohibits immorality and wrongdoing." (Quran 29:45)`;
  return `💚 You have prayed ${total} times. Keep going — Allah loves those who return to Him consistently.`;
}

// ══════════════════════════════════════════════════════════
// FIX 4: QURAN — FULL 114 SURAHS + WORKING AUDIO
// ══════════════════════════════════════════════════════════
function renderSurahList(filter = '', typeF = '') {
  const list = document.getElementById('surahList');
  if (!list) return;

  const surahs = SURAHS.filter(s =>
    (s.en.toLowerCase().includes(filter.toLowerCase()) ||
      s.ar.includes(filter) ||
      String(s.n).includes(filter)) &&
    (!typeF || s.type === typeF)
  );

  list.innerHTML = surahs.map(s => {
    const prog = quranProgress[s.n];
    const badge = prog
      ? (prog.done
        ? '<span class="badge badge-jade" style="font-size:.62rem">✓ Done</span>'
        : `<span class="badge badge-teal" style="font-size:.62rem">Ayah ${prog.ayah}</span>`)
      : '';
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
  renderSurahList(
    document.getElementById('surahSearch')?.value || '',
    document.getElementById('typeFilter')?.value || ''
  );
}

async function openSurah(num) {
  currentSurah = num;
  const surah = SURAHS.find(s => s.n === num);
  if (!surah) return;

  // Hide list, show viewer
  const wrap = document.getElementById('surahListWrap');
  const viewer = document.getElementById('quranViewer');
  if (wrap) wrap.classList.add('hidden');
  if (viewer) viewer.classList.remove('hidden');

  const nameEl = document.getElementById('viewSurahName');
  const metaEl = document.getElementById('viewSurahMeta');
  if (nameEl) nameEl.textContent = `${surah.n}. ${surah.en} — ${surah.ar}`;
  if (metaEl) metaEl.textContent = `${surah.type} • ${surah.v} Verses • Juz ${surah.juz}`;

  // Render audio player first
  renderAudioPlayer(surah);

  // Show loading
  const vList = document.getElementById('verseList');
  if (vList) vList.innerHTML = `
    <div style="text-align:center;padding:3rem;color:var(--t3)">
      <div style="font-size:2rem;margin-bottom:.5rem;animation:loaderMoon 1s infinite">🌙</div>
      <div style="font-size:.88rem">Loading Surah ${surah.en}...</div>
    </div>`;

  // Fetch verses from Al-Quran Cloud API
  let verses = [];
  try {
    const resp = await fetch(
      `https://api.alquran.cloud/v1/surah/${num}/editions/quran-simple,en.asad`,
      { signal: AbortSignal.timeout(10000) }
    );
    const data = await resp.json();
    if (data.code === 200 && Array.isArray(data.data)) {
      const arabic = data.data[0]?.ayahs || [];
      const english = data.data[1]?.ayahs || [];
      verses = arabic.map((a, i) => ({
        ar: a.text,
        tr: english[i]?.text || ''
      }));
      surahVerses[num] = verses; // cache
    }
  } catch (e) {
    // Use cached or fallback
    verses = surahVerses[num] || getFallbackVerses(surah);
  }

  if (verses.length === 0) verses = getFallbackVerses(surah);

  const prog = quranProgress[num];
  const lastAyah = prog?.ayah || 1;

  if (vList) {
    vList.innerHTML = `
      <div style="text-align:center;padding:1rem;background:rgba(13,115,119,.05);border-radius:10px;margin-bottom:1.5rem">
        <div class="fw-ar" style="font-size:2.2rem;color:var(--teal-l);direction:rtl">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </div>
        <div style="font-size:.78rem;color:var(--t3);margin-top:6px;font-style:italic">
          In the name of Allah, the Most Gracious, the Most Merciful
        </div>
      </div>
      ${verses.map((v, i) => {
      const words = v.ar.split(' ').map(w => `<span class="verse-word">${w}</span>`).join(' ');
      return `
        <div class="verse-item" id="vi${i + 1}">
          <div class="verse-arabic">${words}
            <span style="font-size:.9rem;color:var(--teal-l);margin-right:8px;display:inline-block">﴿${i + 1}﴾</span>
          </div>
          <div class="verse-trans">
            <span class="verse-num">${i + 1}</span>${v.tr}
          </div>
          <button class="btn btn-ghost btn-sm mt-1" style="font-size:.72rem"
            onclick="setLastRead(${num}, ${i + 1}, ${surah.v})">
            📌 Bookmark here
          </button>
        </div>`
    }).join('')}
    `;
  }

  // Scroll to last read ayah
  setTimeout(() => {
    if (lastAyah > 1) {
      const el = document.getElementById('vi' + lastAyah);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        showToast('📖', `Resuming from Ayah ${lastAyah}`);
      }
    }
  }, 500);
}

function getFallbackVerses(surah) {
  // Show a message prompting to check internet connection
  return [{
    ar: 'جَارٍ تَحْمِيلُ الآيَاتِ...',
    tr: `Could not load verses for ${surah.en}. Please check your internet connection and try again.`
  }];
}

// ── WORKING AUDIO PLAYER ─────────────────────────────────────
function renderAudioPlayer(surah) {
  const ap = document.getElementById('audioPlayer');
  if (!ap) return;

  ap.innerHTML = `
    <div class="audio-player">
      <button class="audio-play-btn" id="audioBtnMain" onclick="toggleAudio(${surah.n})">▶</button>
      <div class="audio-info">
        <div class="audio-title">Surah ${surah.en} (${surah.n})</div>
        <div class="audio-reciter" id="reciterLabel">Sheikh Mishary Rashid Alafasy</div>
      </div>
      <div class="audio-prog-wrap">
        <div class="prog-bar audio-bar" onclick="seekAudio(event, ${surah.n})" style="cursor:pointer">
          <div class="prog-fill" id="audioProg" style="width:0%"></div>
        </div>
        <div class="audio-times">
          <span id="audioTime">0:00</span>
          <span id="audioDur">--:--</span>
        </div>
      </div>
      <select style="max-width:130px;font-size:.75rem" id="reciterSelect"
        onchange="changeReciter(${surah.n})">
        <option value="ar.alafasy">Alafasy</option>
        <option value="ar.abdurrahmaansudais">Sudais</option>
        <option value="ar.husary">Husary</option>
        <option value="ar.minshawi">Minshawi</option>
        <option value="ar.muhammadayyoub">Ayyoub</option>
        <option value="ar.shaatree">Shaatree</option>
        <option value="ar.mahermuaiqly">Muaiqly</option>
      </select>
    </div>`;

  // Pre-load audio
  loadSurahAudio(surah.n, 'ar.alafasy');
}

let audioPlaylist = [];
let audioCurrentIndex = 0;

async function loadSurahAudio(num, reciter) {
  if (currentAudio) { currentAudio.pause(); currentAudio.src = ''; currentAudio = null; }
  const progEl = document.getElementById('audioProg');
  if (progEl) progEl.style.width = '0%';
  const timeEl = document.getElementById('audioTime');
  const durEl = document.getElementById('audioDur');
  if (timeEl) timeEl.textContent = '0';
  if (durEl) durEl.textContent = '--';

  const btn = document.getElementById('audioBtnMain');
  if (btn) btn.innerHTML = '<span style="font-size:.6rem;animation:pulse 1s infinite">LOAD</span>';

  try {
    const r = await fetch(`https://api.alquran.cloud/v1/surah/${num}/${reciter}`);
    const d = await r.json();
    if (d.code === 200 && d.data.ayahs) {
      audioPlaylist = d.data.ayahs.map(a => a.audio);
      audioCurrentIndex = 0;
      if (durEl) durEl.textContent = audioPlaylist.length + ' Ayahs';
      if (btn) { btn.textContent = '▶'; btn.classList.remove('playing'); }
      setupAudioAyah(num);
    } else {
      throw new Error('API failed');
    }
  } catch (e) {
    // Fallback strategy using predictable CDN (EveryAyah)
    const surahPads = String(num).padStart(3, '0');
    // Map reciters to EveryAyah standard IDs
    const reciterMap = {
      'ar.alafasy': 'Alafasy_128kbps',
      'ar.abdurrahmaansudais': 'Abdurrahmaan_As-Sudais_192kbps',
      'ar.husary': 'Husary_128kbps',
      'ar.minshawi': 'Minshawy_Murattal_128kbps',
      'ar.muhammadayyoub': 'Muhammad_Ayyoub_128kbps',
      'ar.shaatree': 'Abu_Bakr_Ash-Shaatree_128kbps',
      'ar.mahermuaiqly': 'MaherAlMuaiqly128kbps'
    };
    const everyAyahReciter = reciterMap[reciter] || 'Alafasy_128kbps';

    // We need to know how many verses to generate fallback URLs
    const surahInfo = SURAHS.find(s => s.n === num);
    if (surahInfo) {
      audioPlaylist = [];
      for (let i = 1; i <= surahInfo.v; i++) {
        const ayahPads = String(i).padStart(3, '0');
        audioPlaylist.push(`https://everyayah.com/data/${everyAyahReciter}/${surahPads}${ayahPads}.mp3`);
      }
      audioCurrentIndex = 0;
      if (durEl) durEl.textContent = audioPlaylist.length + ' Ayahs (Fallback)';
      if (btn) { btn.textContent = '▶'; btn.classList.remove('playing'); }
      setupAudioAyah(num);
      return;
    }
    showToast('⚠️', 'Audio load error. Check internet connection.');
    if (btn) btn.textContent = '▶';
  }
}

function setupAudioAyah(num) {
  if (!audioPlaylist[audioCurrentIndex]) {
    const btn = document.getElementById('audioBtnMain');
    if (btn) { btn.textContent = '▶'; btn.classList.remove('playing'); }
    showToast('📖', 'Recitation complete. JazakAllahu Khayran!');
    document.querySelectorAll('.verse-item').forEach(el => el.classList.remove('playing'));
    return;
  }

  currentAudio = new Audio(audioPlaylist[audioCurrentIndex]);
  currentAudio.preload = 'auto';
  currentAudio.addEventListener('ended', () => {
    document.getElementById(`vi${audioCurrentIndex + 1}`)?.classList.remove('playing');
    audioCurrentIndex++;
    updateGlobalProgress(num);
    setupAudioAyah(num);
    const btn = document.getElementById('audioBtnMain');
    if (currentAudio && btn && btn.classList.contains('playing')) {
      currentAudio.play().catch(() => { });
    }
  });

  currentAudio.addEventListener('error', () => {
    showToast('⚠️', 'Audio error on Ayah ' + (audioCurrentIndex + 1));
    audioCurrentIndex++;
    setupAudioAyah(num);
  });

  currentAudio.addEventListener('timeupdate', () => {
    const btn = document.getElementById('audioBtnMain');
    if (btn && btn.classList.contains('playing')) {
      const el = document.getElementById(`vi${audioCurrentIndex + 1}`);
      if (el) {
        el.classList.add('playing');
        if (currentAudio.currentTime < 0.2) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  });
}

function updateGlobalProgress(num) {
  const total = audioPlaylist.length;
  if (total === 0) return;
  const pct = (audioCurrentIndex / total) * 100;
  const progEl = document.getElementById('audioProg');
  if (progEl) progEl.style.width = pct + '%';
  const timeEl = document.getElementById('audioTime');
  if (timeEl) timeEl.textContent = 'Ayah ' + (audioCurrentIndex);
}

function toggleAudio(num) {
  const btn = document.getElementById('audioBtnMain');
  if (!currentAudio && audioPlaylist.length === 0) return showToast('⏳', 'Loading audio...');
  if (currentAudio && currentAudio.paused) {
    currentAudio.play().then(() => {
      if (btn) { btn.textContent = '⏸'; btn.classList.add('playing'); }
      updateGlobalProgress(num);
    }).catch(err => {
      showToast('⚠️', 'Could not play audio. Try again.');
    });
  } else if (currentAudio) {
    currentAudio.pause();
    if (btn) { btn.textContent = '▶'; btn.classList.remove('playing'); }
    document.querySelectorAll('.verse-item').forEach(el => el.classList.remove('playing'));
  }
}

function seekAudio(e, num) {
  if (audioPlaylist.length === 0) return;
  const rect = e.currentTarget.getBoundingClientRect();
  const pct = (e.clientX - rect.left) / rect.width;
  const target = Math.floor(pct * audioPlaylist.length);
  const wasPlaying = document.getElementById('audioBtnMain')?.classList.contains('playing');
  if (currentAudio) currentAudio.pause();
  document.querySelectorAll('.verse-item').forEach(el => el.classList.remove('playing'));
  audioCurrentIndex = target;
  updateGlobalProgress(num);
  setupAudioAyah(num);
  if (wasPlaying && currentAudio) currentAudio.play().catch(() => { });
}

function changeReciter(num) {
  const sel = document.getElementById('reciterSelect');
  const reciter = sel?.value || 'ar.alafasy';
  const names = {
    'ar.alafasy': 'Alafasy',
    'ar.abdurrahmaansudais': 'Sudais',
    'ar.husary': 'Husary',
    'ar.minshawi': 'Minshawi',
    'ar.muhammadayyoub': 'Ayyoub',
    'ar.shaatree': 'Shaatree',
    'ar.mahermuaiqly': 'Muaiqly',
  };
  const lbl = document.getElementById('reciterLabel');
  if (lbl) lbl.textContent = 'Sheikh ' + (names[reciter] || reciter);
  loadSurahAudio(num, reciter);
  const btn = document.getElementById('audioBtnMain');
  if (btn) { btn.textContent = '▶'; btn.classList.remove('playing'); }
  showToast('🎙️', `Reciter changed to ${names[reciter]}`);
}

function fmtTime(s) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${String(sec).padStart(2, '0')}`;
}

async function setLastRead(surahN, ayah, total) {
  quranProgress[surahN] = { ayah, done: ayah >= total };
  localStorage.setItem('ah_qp', JSON.stringify(quranProgress));
  initQuranTracker();
  showToast('📌', `Bookmark saved: Surah ${surahN}, Ayah ${ayah}`);
  if (TOKEN) {
    try {
      await apiFetch('/quran/progress', {
        method: 'POST',
        body: { surah_number: surahN, last_ayah: ayah, total_ayahs: total, is_completed: ayah >= total }
      });
    } catch (e) { }
  }
}

function closeViewer() {
  if (currentAudio) { currentAudio.pause(); currentAudio.src = ''; currentAudio = null; }
  const wrap = document.getElementById('surahListWrap');
  const viewer = document.getElementById('quranViewer');
  if (wrap) wrap.classList.remove('hidden');
  if (viewer) viewer.classList.add('hidden');
  currentSurah = null;
}

function prevSurah() {
  if (!currentSurah) return;
  const i = SURAHS.findIndex(s => s.n === currentSurah);
  if (i > 0) openSurah(SURAHS[i - 1].n);
}

function nextSurah() {
  if (!currentSurah) return;
  const i = SURAHS.findIndex(s => s.n === currentSurah);
  if (i < SURAHS.length - 1) openSurah(SURAHS[i + 1].n);
}

function initQuranTracker() {
  const c = document.getElementById('quranTracker');
  if (!c) return;
  let done = 0;
  c.innerHTML = '';
  for (let j = 1; j <= 30; j++) {
    const completed = Object.values(quranProgress).filter(p => p.done).length >= j;
    if (completed) done++;
    const div = document.createElement('div');
    div.className = `t-cell ${completed ? 'done' : ''}`;
    div.textContent = j;
    div.title = `Juz ${j}`;
    div.onclick = () => {
      div.classList.toggle('done');
      const d = document.querySelectorAll('#quranTracker .done').length;
      const b = document.getElementById('qProgressBadge');
      const p = document.getElementById('qProgressBar');
      if (b) b.textContent = `${d} / 30 Juz`;
      if (p) p.style.width = (d / 30 * 100) + '%';
      showToast('📖', `Juz ${j} ${div.classList.contains('done') ? 'completed ✨' : 'unmarked'}`);
    };
    c.appendChild(div);
  }
  const b = document.getElementById('qProgressBadge');
  const p = document.getElementById('qProgressBar');
  if (b) b.textContent = `${done} / 30 Juz`;
  if (p) p.style.width = (done / 30 * 100) + '%';
}

// ══════════════════════════════════════════════════════════
// DUAS
// ══════════════════════════════════════════════════════════
function renderDuas(cat) {
  const el = document.getElementById('duasList');
  if (!el) return;
  const list = cat === 'all' ? DUAS : DUAS.filter(d => d.cat === cat);
  el.innerHTML = list.map((d, i) => `
    <div class="dua-card" style="animation:fadeUp .5s ${i * .08}s ease both">
      <div class="dua-top">
        <div class="dua-title">🤲 ${d.title}</div>
        <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap">
          <span class="badge badge-teal">${d.src}</span>
          <span class="badge badge-jade">${d.cat}</span>
        </div>
      </div>
      <div class="dua-arabic">${d.ar}</div>
      <div class="dua-translit">📝 ${d.tr}</div>
      <div class="dua-trans-en">🌐 ${d.en}</div>
      <div class="dua-trans-ur">🇵🇰 ${d.ur}</div>
      <div class="dua-hadith">📚 ${d.hadith}</div>
      <div class="dua-actions">
        <button class="dua-play-btn" onclick="playDuaAudio('${d.k}', \`${d.ar}\`, this)">🔊 Listen</button>
        <button class="btn btn-outline btn-sm"
          onclick="copyDua(\`${d.ar}\`,\`${d.en}\`,\`${d.ur}\`)">📋 Copy</button>
      </div>
    </div>`).join('');
}

function filterDuas(cat, btn) {
  document.querySelectorAll('#duas .pill').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderDuas(cat);
}

function copyDua(ar, en, ur) {
  navigator.clipboard.writeText(ar + '\n\n' + en + '\n\n' + ur)
    .then(() => showToast('📋', 'Dua copied (Arabic + English + Urdu)!'));
}

function playDuaAudio(key, text, btn) {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'ar-SA'; u.rate = 0.75; u.pitch = 1;
    btn.classList.add('playing'); btn.textContent = '⏸ Playing';
    u.onend = () => { btn.classList.remove('playing'); btn.textContent = '🔊 Listen'; };
    u.onerror = () => { btn.classList.remove('playing'); btn.textContent = '🔊 Listen'; };
    window.speechSynthesis.speak(u);
  } else {
    showToast('⚠️', 'Text-to-speech not supported in this browser.');
  }
}

// ══════════════════════════════════════════════════════════
// ZAKAT
// ══════════════════════════════════════════════════════════
function switchZakatTab(id, btn) {
  document.querySelectorAll('#zakat .tab-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('#zakat .tab-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById(id + '-panel').classList.add('active');
}

function calcZakat() {
  const cash = +document.getElementById('z-cash')?.value || 0;
  const invest = +document.getElementById('z-invest')?.value || 0;
  const biz = +document.getElementById('z-biz')?.value || 0;
  const loans = +document.getElementById('z-loans')?.value || 0;
  const debts = +document.getElementById('z-debts')?.value || 0;
  const cur = document.getElementById('z-currency')?.value || 'PKR';
  const sym = { PKR: '₨', USD: '$', GBP: '£', SAR: '﷼' }[cur] || cur;
  const total = cash + invest + biz + loans;
  const net = Math.max(0, total - debts);
  const zakat = net * 0.025;
  const nisab = cur === 'PKR' ? 1920000 : cur === 'USD' ? 4300 : 3600;
  const met = net >= nisab;
  const fmt = n => sym + ' ' + Math.round(n).toLocaleString();

  const rTotal = document.getElementById('r-total');
  const rNet = document.getElementById('r-net');
  const rZakat = document.getElementById('r-zakat');
  const rNisab = document.getElementById('r-nisab');
  const rBox = document.getElementById('zakat-result');

  if (rTotal) rTotal.textContent = fmt(total);
  if (rNet) rNet.textContent = fmt(net);
  if (rZakat) rZakat.textContent = fmt(zakat);
  if (rNisab) {
    rNisab.textContent = met ? '✅ Met' : '❌ Not Met';
    rNisab.style.color = met ? 'var(--jade-l)' : '#E57373';
  }
  if (rBox) rBox.classList.remove('hidden');

  if (met && TOKEN) {
    apiFetch('/zakat/save', {
      method: 'POST', body: {
        calc_type: 'wealth', cash_amount: cash, investments: invest,
        business_goods: biz, receivables: loans, debts,
        total_assets: total, net_zakatable: net, zakat_amount: zakat,
        nisab_met: met, currency: cur
      }
    }).catch(() => { });
  }
}

function calcGold() {
  const gw = +document.getElementById('g-gold')?.value || 0;
  const gp = +document.getElementById('g-goldprice')?.value || 22000;
  const sw = +document.getElementById('g-silver')?.value || 0;
  const sp = +document.getElementById('g-silverprice')?.value || 270;
  const gv = gw * gp, sv = sw * sp;
  const zakat = (gv + sv) * 0.025;
  const fmt = n => '₨ ' + Math.round(n).toLocaleString();
  if (document.getElementById('r-gv')) document.getElementById('r-gv').textContent = fmt(gv);
  if (document.getElementById('r-sv')) document.getElementById('r-sv').textContent = fmt(sv);
  if (document.getElementById('r-gz')) document.getElementById('r-gz').textContent = fmt(zakat);
  document.getElementById('gold-result')?.classList.remove('hidden');
}

function calcUshr() {
  const produce = +document.getElementById('u-produce')?.value || 0;
  const irrigate = document.getElementById('u-irrigate')?.value || 'rain';
  const price = +document.getElementById('u-price')?.value || 0;
  const rate = irrigate === 'rain' ? 0.1 : 0.05;
  const fmt = n => '₨ ' + Math.round(n).toLocaleString();
  if (document.getElementById('r-uv')) document.getElementById('r-uv').textContent = fmt(produce * price);
  if (document.getElementById('r-ushr')) document.getElementById('r-ushr').textContent = fmt(produce * price * rate);
  if (document.getElementById('r-ukind')) document.getElementById('r-ukind').textContent = (produce * rate).toFixed(2);
  document.getElementById('ushr-result')?.classList.remove('hidden');
}

function calcFitrana() {
  const members = +document.getElementById('f-members')?.value || 4;
  const food = document.getElementById('f-food')?.value || 'wheat';
  const custom = +document.getElementById('f-custom')?.value || 0;
  const prices = { wheat: 280, rice: 420, dates: 800 };
  const price = custom || prices[food] || 280;
  const per = price * 1.75;
  const total = per * members;
  const fmt = n => '₨ ' + Math.round(n).toLocaleString();
  if (document.getElementById('r-fp')) document.getElementById('r-fp').textContent = fmt(per);
  if (document.getElementById('r-ft')) document.getElementById('r-ft').textContent = fmt(total);
  if (document.getElementById('r-fw')) document.getElementById('r-fw').textContent = (1.75 * members).toFixed(2);
}

function setScenario(text) {
  const inp = document.getElementById('scenarioInput');
  if (inp) inp.value = text;
}

async function calcScenario() {
  const input = document.getElementById('scenarioInput')?.value.trim();
  if (!input) return showToast('⚠️', 'Please enter a scenario');
  const resp = document.getElementById('scenarioResponse');
  if (!resp) return;
  resp.classList.add('show');
  resp.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
  try {
    const d = await apiFetch('/chatbot/message', {
      method: 'POST',
      body: { message: `Calculate Zakat for: ${input}`, session_id: chatSessionId }
    });
    resp.textContent = d.reply || 'Please configure AI assistant.';
    if (d.session_id) chatSessionId = d.session_id;
  } catch (e) {
    resp.textContent = 'AI unavailable. Basic: Zakat = 2.5% on assets above Nisab (~₨1.92M).';
  }
}

// ══════════════════════════════════════════════════════════
// RECIPES
// ══════════════════════════════════════════════════════════
function renderRecipes(cat) {
  const el = document.getElementById('recipesGrid');
  if (!el) return;
  const list = cat === 'all' ? RECIPES : RECIPES.filter(r => r.cat === cat);
  const bgs = {
    sehri: 'linear-gradient(135deg,#0a1a2a,#062040)',
    iftar: 'linear-gradient(135deg,#1a0a0a,#2a1005)',
    drinks: 'linear-gradient(135deg,#051520,#0a2030)',
    sweets: 'linear-gradient(135deg,#1a0515,#250a20)',
    snacks: 'linear-gradient(135deg,#0a1a05,#152010)',
  };
  el.innerHTML = list.map((r, i) => `
    <div class="recipe-card" style="animation:fadeUp .5s ${i * .06}s ease both"
      onclick="openRecipeModal('${r.name.replace(/'/g, "\\'")}')">
      <button class="recipe-bookmark" onclick="event.stopPropagation();toggleBookmark('${r.name.replace(/'/g, "\\'")}',this)">🔖</button>
      <div class="recipe-img" style="background:${bgs[r.cat] || 'var(--bgc)'}">
        <span class="emoji">${r.e}</span>
      </div>
      <div class="recipe-body">
        <div style="display:flex;gap:5px;margin-bottom:.5rem;flex-wrap:wrap">
          <span class="badge ${r.cat === 'sehri' ? 'badge-teal' : r.cat === 'iftar' ? 'badge-amber' : 'badge-jade'}">${r.cat.toUpperCase()}</span>
          <span class="badge" style="background:rgba(255,255,255,.04);color:var(--t3);border-color:var(--b)">${r.d}</span>
        </div>
        <div class="recipe-name">${r.name}</div>
        <div class="recipe-desc">${r.desc}</div>
        <div class="recipe-meta">
          <span>⏱️ ${r.t}</span><span>👥 ${r.s}</span><span>🧂 ${r.ingredients.length} items</span>
        </div>
      </div>
    </div>`).join('');
}

function filterRecipes(cat, btn) {
  document.querySelectorAll('#recipes .pill').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderRecipes(cat);
}

// ── FIX: filterVideos was missing — called from HTML pills ───
function filterVideos(cat, btn) {
  document.querySelectorAll('#videos .pill').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const el = document.getElementById('videosGrid');
  if (!el) return;
  const list = cat === 'all' ? VIDEOS : VIDEOS.filter(v => v.cat === cat);
  const bgs = {
    quran: 'linear-gradient(135deg,#061510,#0d2a1a)',
    lecture: 'linear-gradient(135deg,#060610,#101028)',
    dua: 'linear-gradient(135deg,#120612,#201030)',
    taraweeh: 'linear-gradient(135deg,#061212,#0a2525)',
  };
  el.innerHTML = list.map((v, i) => `
    <div class="video-card" style="animation:fadeUp .5s ${i * .06}s ease both"
      onclick="playVideo('${v.title.replace(/'/g, "\\'")}')">
      <div class="video-thumb" style="background:${bgs[v.cat] || 'var(--bgc)'}">
        <span>${v.e}</span>
        <div class="play-circle">▶</div>
        <div class="video-duration">${v.dur}</div>
      </div>
      <div class="video-body">
        <div class="video-title">${v.title}</div>
        <div class="video-channel">📺 ${v.ch}</div>
        <div class="video-views">👁️ ${v.v} views</div>
        <div class="video-tags">${v.tags.map(t => `<span class="video-tag">${t}</span>`).join('')}</div>
      </div>
    </div>`).join('');
}

function openRecipeModal(name) {
  const r = RECIPES.find(x => x.name === name);
  if (!r) return;
  const bgs = {
    sehri: 'linear-gradient(135deg,#0a1a2a,#062040)',
    iftar: 'linear-gradient(135deg,#1a0a0a,#2a1005)',
    drinks: 'linear-gradient(135deg,#051520,#0a2030)',
    sweets: 'linear-gradient(135deg,#1a0515,#250a20)',
    snacks: 'linear-gradient(135deg,#0a1a05,#152010)',
  };
  document.getElementById('recipeModalContent').innerHTML = `
    <div style="background:${bgs[r.cat]};border-radius:10px;height:140px;
      display:flex;align-items:center;justify-content:center;
      font-size:5rem;margin-bottom:1.2rem">${r.e}</div>
    <div class="modal-title">${r.name}</div>
    <div style="display:flex;gap:.5rem;margin-bottom:1rem;flex-wrap:wrap">
      <span class="badge badge-teal">${r.cat.toUpperCase()}</span>
      <span class="badge badge-jade">⏱️ ${r.t}</span>
      <span class="badge badge-amber">👥 ${r.s}</span>
      <span class="badge" style="background:rgba(255,255,255,.05);color:var(--t3);border-color:var(--b)">${r.d}</span>
    </div>
    <p style="color:var(--t2);font-size:.88rem;margin-bottom:1rem;line-height:1.7">${r.desc}</p>
    <div class="recipe-detail-grid">
      <div>
        <h4 class="fw-d" style="color:var(--teal-l);font-size:.85rem;letter-spacing:1px;margin-bottom:.8rem">🧂 INGREDIENTS</h4>
        ${r.ingredients.map(ing => `
          <div style="display:flex;align-items:center;gap:.5rem;margin-bottom:.4rem;font-size:.82rem;color:var(--t2)">
            <span style="color:var(--teal);font-size:.7rem">●</span>${ing}
          </div>`).join('')}
      </div>
      <div>
        <h4 class="fw-d" style="color:var(--teal-l);font-size:.85rem;letter-spacing:1px;margin-bottom:.8rem">👨‍🍳 STEPS</h4>
        ${r.steps.map((step, i) => `
          <div class="recipe-step">
            <div class="step-num">${i + 1}</div>
            <div class="step-text">${step}</div>
          </div>`).join('')}
      </div>
    </div>`;
  openModal('recipeModal');
}

function toggleBookmark(name, btn) {
  btn.classList.toggle('saved');
  showToast(btn.classList.contains('saved') ? '🔖' : '📌',
    `${name} ${btn.classList.contains('saved') ? 'bookmarked' : 'removed'}`);
}

// ══════════════════════════════════════════════════════════
// VIDEOS
// ══════════════════════════════════════════════════════════
function renderVideos() {
  const el = document.getElementById('videosGrid');
  if (!el) return;
  const search = (document.getElementById('videoSearch')?.value || '').toLowerCase();
  const cat = document.getElementById('videoSort')?.value || 'all';

  let list = VIDEOS;
  if (cat !== 'all') list = list.filter(v => v.cat === cat);
  if (search) list = list.filter(v =>
    v.title.toLowerCase().includes(search) || v.ch.toLowerCase().includes(search)
  );

  const bgs = {
    quran: 'linear-gradient(135deg,#061510,#0d2a1a)',
    lecture: 'linear-gradient(135deg,#060610,#101028)',
    dua: 'linear-gradient(135deg,#120612,#201030)',
    taraweeh: 'linear-gradient(135deg,#061212,#0a2525)',
  };

  el.innerHTML = list.map((v, i) => `
    <div class="video-card" style="animation:fadeUp .5s ${i * .06}s ease both"
      onclick="playVideo('${v.title.replace(/'/g, "\\'")}')">
      <div class="video-thumb" style="background:${bgs[v.cat] || 'var(--bgc)'}">
        <span>${v.e}</span>
        <div class="play-circle">▶</div>
        <div class="video-duration">${v.dur}</div>
      </div>
      <div class="video-body">
        <div class="video-title">${v.title}</div>
        <div class="video-channel">📺 ${v.ch}</div>
        <div class="video-views">👁️ ${v.v} views</div>
        <div class="video-tags">${v.tags.map(t => `<span class="video-tag">${t}</span>`).join('')}</div>
      </div>
    </div>`).join('');
}

function playVideo(title) {
  showToast('▶️', `Opening: ${title.substring(0, 40)}...`);
}

// ══════════════════════════════════════════════════════════
// WAY OF NIMAZ INTERACTIVE LOGIC
// ══════════════════════════════════════════════════════════
const NIMAZ_STEPS = [
  { title: "Takbeer", ar: "الله أكبر", tr: "Allahu Akbar", en: "Allah is the greatest", desc: "Raise your hands to your ears and say the Takbeer to begin the prayer.", img: "🧍‍♂️" },
  { title: "Qiyam", ar: "بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ...", tr: "Bismillah...", en: "In the name of Allah...", desc: "Fold your hands over your chest. Recite Surah Al-Fatihah, followed by another Surah from the Quran.", img: "🧍" },
  { title: "Ruku", ar: "سُبْحَانَ رَبِّيَ الْعَظِيمِ", tr: "Subhana Rabbiyal Adheem", en: "Glory be to my Lord the Supreme", desc: "Bow down, resting your hands on your knees, keeping your back straight. Say this 3 times.", img: "🙇‍♂️" },
  { title: "Qiyam", ar: "سَمِعَ اللَّهُ لِمَنْ حَمِدَهُ", tr: "Sami' Allahu liman hamidah", en: "Allah hears those who praise Him", desc: "Stand up straight from Ruku.", img: "🧍‍♂️" },
  { title: "Sujud", ar: "سُبْحَانَ رَبِّيَ الْأَعْلَى", tr: "Subhana Rabbiyal A'la", en: "Glory is to my Lord, the Most High", desc: "Prostrate with your forehead, nose, both palms, knees, and toes touching the ground. Say this 3 times.", img: "🧎‍♂️" },
  { title: "Jalsa", ar: "رَبِّ اغْفِرْ لِي", tr: "Rabbighfir li", en: "O my Lord, forgive me", desc: "Sit up from Sujud temporarily before going into the second Sujud.", img: "🧎" },
  { title: "Tashahhud", ar: "التَّحِيَّاتُ لِلَّهِ وَالصَّلَوَاتُ...", tr: "At-tahiyyatu lillahi...", en: "All greetings, prayers, and good deeds are for Allah...", desc: "After completing your rak'ahs, sit and recite the Tashahhud, sending blessings to the Prophet ﷺ.", img: "🧎" },
  { title: "Tasleem", ar: "السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ", tr: "As-salamu alaykum wa rahmatullah", en: "May the peace and mercy of Allah be upon you", desc: "Turn your face to the right, then to the left, saying the Tasleem to conclude the prayer.", img: "👤" }
];
let currentNimazStep = 0;

function renderNimaz() {
  const tabs = document.getElementById('nimazTabs');
  const ar = document.getElementById('nimazAr');
  const tr = document.getElementById('nimazTr');
  const en = document.getElementById('nimazEn');
  const desc = document.getElementById('nimazDesc');
  const title = document.getElementById('nimazStepTitle');
  const imgWrap = document.getElementById('nimazImgWrap');
  const box = document.getElementById('nimazContentBox');
  if (!tabs || !ar || !title) return;

  if (tabs.children.length === 0) {
    tabs.innerHTML = NIMAZ_STEPS.map((s, i) =>
      `<button class="nimaz-tab ${i === currentNimazStep ? 'active' : ''}" onclick="setNimaz(${i})">${i + 1}. ${s.title.split(' ')[0]}</button>`
    ).join('');
  } else {
    Array.from(tabs.children).forEach((t, i) => t.className = `nimaz-tab ${i === currentNimazStep ? 'active' : ''}`);
  }

  const step = NIMAZ_STEPS[currentNimazStep];
  box.style.opacity = '0';
  imgWrap.style.transform = 'scale(0.8)';
  setTimeout(() => {
    imgWrap.innerHTML = step.img;
    title.innerHTML = `${currentNimazStep + 1}. ${step.title}`;
    ar.innerHTML = step.ar;
    tr.innerHTML = step.tr;
    en.innerHTML = step.en;
    desc.innerHTML = step.desc;
    box.style.opacity = '1';
    imgWrap.style.transform = 'scale(1)';

    // Auto scroll tabs
    const activeTab = tabs.children[currentNimazStep];
    if (activeTab) {
      activeTab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, 300);
}

function setNimaz(i) { currentNimazStep = i; renderNimaz(); }
function nextNimaz() { currentNimazStep = (currentNimazStep + 1) % NIMAZ_STEPS.length; renderNimaz(); }
function prevNimaz() { currentNimazStep = (currentNimazStep - 1 + NIMAZ_STEPS.length) % NIMAZ_STEPS.length; renderNimaz(); }

// Hook up into initialization
document.addEventListener('DOMContentLoaded', () => { setTimeout(renderNimaz, 100); });

// ══════════════════════════════════════════════════════════
// CHATBOT
// ══════════════════════════════════════════════════════════
function toggleChat() {
  document.getElementById('chatWindow')?.classList.toggle('open');
}

async function sendChatMessage() {
  const inp = document.getElementById('chatInput');
  const msg = inp?.value.trim();
  if (!msg) return;
  inp.value = '';
  appendMsg(msg, 'user');
  showTyping();
  try {
    const d = await apiFetch('/chatbot/message', {
      method: 'POST',
      body: { message: msg, session_id: chatSessionId }
    });
    hideTyping();
    appendMsg(d.reply || 'No response.', 'bot');
    if (d.session_id) chatSessionId = d.session_id;
  } catch (e) {
    hideTyping();
    appendMsg('Connection error. Please try again.', 'bot');
  }
}

function appendMsg(text, role) {
  const b = document.getElementById('chatBody');
  if (!b) return;
  const d = document.createElement('div');
  d.className = 'chat-msg ' + role;
  d.textContent = text;
  b.appendChild(d);
  b.scrollTop = b.scrollHeight;
}

function showTyping() {
  const b = document.getElementById('chatBody');
  if (!b) return;
  const d = document.createElement('div');
  d.id = 'chatTyping';
  d.className = 'chat-typing';
  d.innerHTML = '<span></span><span></span><span></span>';
  b.appendChild(d);
  b.scrollTop = b.scrollHeight;
}

function hideTyping() {
  document.getElementById('chatTyping')?.remove();
}

document.addEventListener('keydown', e => {
  if (e.key === 'Enter' && document.activeElement?.id === 'chatInput') sendChatMessage();
});

// ══════════════════════════════════════════════════════════
// COUNTDOWN — Shows time until next Ramadan starts
// ══════════════════════════════════════════════════════════
function startCountdown() {
  // Ramadan 1449 AH — approximately Feb 17, 2027
  // (Updated from the old 2026-02-28 target which is now in the past)
  const nextRamadan = new Date('2027-02-17T00:00:00');

  function tick() {
    const now = new Date();
    const diff = Math.max(0, nextRamadan - now);

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    const g = id => document.getElementById(id);

    if (diff > 0) {
      if (days > 1) {
        if (g('cdH')) g('cdH').textContent = pad(days);
        if (g('cdM')) g('cdM').textContent = pad(h);
        if (g('cdS')) g('cdS').textContent = pad(m);
        if (g('cdLabel')) g('cdLabel').textContent = 'Days';
      } else {
        if (g('cdH')) g('cdH').textContent = pad(h);
        if (g('cdM')) g('cdM').textContent = pad(m);
        if (g('cdS')) g('cdS').textContent = pad(s);
        if (g('cdLabel')) g('cdLabel').textContent = 'Soon!';
      }
    } else {
      if (g('cdH')) g('cdH').textContent = '00';
      if (g('cdM')) g('cdM').textContent = '00';
      if (g('cdS')) g('cdS').textContent = '00';
      if (g('cdLabel')) g('cdLabel').textContent = 'Ramadan!';
    }
  }

  tick();
  setInterval(tick, 1000);
}

// ══════════════════════════════════════════════════════════
// TASBIH / DHIKR COUNTER (NEW FEATURE)
// ══════════════════════════════════════════════════════════
const DHIKR_LIST = [
  { type: 'SubhanAllah', ar: 'سُبْحَانَ اللَّهِ', en: 'Glory be to Allah', target: 33 },
  { type: 'Alhamdulillah', ar: 'الْحَمْدُ لِلَّهِ', en: 'All praise is due to Allah', target: 33 },
  { type: 'AllahuAkbar', ar: 'اللَّهُ أَكْبَرُ', en: 'Allah is the Greatest', target: 34 },
  { type: 'Astaghfirullah', ar: 'أَسْتَغْفِرُ اللَّهَ', en: 'I seek forgiveness from Allah', target: 100 },
  { type: 'LaillahaIllallah', ar: 'لَا إِلَٰهَ إِلَّا اللَّهُ', en: 'There is no god but Allah', target: 100 },
];

let tasbihCount = 0;
let tasbihSelected = 0;
let tasbihEl = null;

function openTasbih() {
  const overlay = document.getElementById('tasbihModal');
  if (!overlay) return;
  tasbihCount = 0;
  tasbihSelected = 0;
  renderTasbih();
  overlay.classList.add('open');
}

function closeTasbih() {
  document.getElementById('tasbihModal')?.classList.remove('open');
  saveTasbih();
}

function selectDhikr(idx) {
  saveTasbih();
  tasbihSelected = idx;
  tasbihCount = 0;
  renderTasbih();
}

function renderTasbih() {
  const d = DHIKR_LIST[tasbihSelected];
  const arc = document.getElementById('tasbihArc');
  const countEl = document.getElementById('tasbihCountEl');
  const arEl = document.getElementById('tasbihArEl');
  const enEl = document.getElementById('tasbihEnEl');
  const pct = Math.min(tasbihCount / d.target, 1) * 100;
  if (arc) arc.style.setProperty('--pct', pct + '%');
  if (countEl) countEl.textContent = tasbihCount;
  if (arEl) arEl.textContent = d.ar;
  if (enEl) enEl.textContent = d.en;

  // Update dhikr pills
  document.querySelectorAll('.dhikr-pill').forEach((p, i) =>
    p.classList.toggle('active', i === tasbihSelected)
  );

  // Completion celebration
  if (tasbihCount >= d.target) {
    showToast('✨', `${d.type} completed! MashaAllah — ${d.target} times!`);
    if (navigator.vibrate) navigator.vibrate([100, 50, 200]);
  }
}

function tapTasbih() {
  tasbihCount++;
  const d = DHIKR_LIST[tasbihSelected];
  // Vibrate on every tap (mobile)
  if (navigator.vibrate) navigator.vibrate(30);
  renderTasbih();
  // Auto-save every 10 taps
  if (tasbihCount % 10 === 0) saveTasbih();
}

function resetTasbih() {
  saveTasbih();
  tasbihCount = 0;
  renderTasbih();
}

async function saveTasbih() {
  if (!TOKEN || tasbihCount === 0) return;
  const d = DHIKR_LIST[tasbihSelected];
  try {
    await apiFetch('/tasbih/save', {
      method: 'POST',
      body: { dhikr_type: d.type, dhikr_ar: d.ar, count: tasbihCount, target: d.target }
    });
  } catch (e) { }
}

// ══════════════════════════════════════════════════════════
// FASTING TRACKER (NEW FEATURE)
// ══════════════════════════════════════════════════════════
let fastingLog = JSON.parse(localStorage.getItem('ah_flog') || '{}');

function initFastingTracker() {
  const c = document.getElementById('fastingTracker');
  if (!c) return;
  const today = new Date();
  c.innerHTML = '';

  for (let d = 1; d <= 30; d++) {
    const dt = new Date(today.getFullYear(), today.getMonth(), d);
    const ds = toDateStr(dt);
    const rec = fastingLog[ds];
    const div = document.createElement('div');
    div.className = `t-cell ${rec?.fasted ? 'done' : ''} ${d === today.getDate() ? 'today-cell' : ''}`;
    div.textContent = d;
    div.title = rec ? (rec.fasted ? `Day ${d}: Fasted ✅` : `Day ${d}: Missed ❌`) : `Day ${d}`;
    div.onclick = () => toggleFastingDay(ds, d, div);
    c.appendChild(div);
  }

  const fasted = Object.values(fastingLog).filter(r => r.fasted).length;
  const badge = document.getElementById('fastingBadge');
  const bar = document.getElementById('fastingBar');
  if (badge) badge.textContent = `${fasted} / 30 Days`;
  if (bar) bar.style.width = (fasted / 30 * 100) + '%';
}

async function toggleFastingDay(ds, day, cell) {
  const rec = fastingLog[ds];
  const fasted = !rec?.fasted;
  fastingLog[ds] = { fasted, sehri_eaten: true, ramadan_day: day };
  localStorage.setItem('ah_flog', JSON.stringify(fastingLog));
  cell.classList.toggle('done', fasted);
  cell.title = fasted ? `Day ${day}: Fasted ✅` : `Day ${day}: Missed ❌`;
  initFastingTracker();
  showToast(fasted ? '🌙' : '⬜', fasted ? `Day ${day} fasted! BarakAllahu feekum!` : `Day ${day} unmarked`);
  if (TOKEN) {
    try {
      await apiFetch('/fasting/log', {
        method: 'POST',
        body: { fast_date: ds, ramadan_day: day, fasted, sehri_eaten: true }
      });
    } catch (e) { }
  }
}

// ══════════════════════════════════════════════════════════
// MODAL HELPERS
// ══════════════════════════════════════════════════════════
function openModal(id) { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }

function toggleLoginTab(tab) {
  document.getElementById('loginFormWrap')?.classList.toggle('hidden', tab === 'register');
  document.getElementById('registerFormWrap')?.classList.toggle('hidden', tab === 'login');
  document.querySelectorAll('.login-tab').forEach(b =>
    b.classList.toggle('active', b.dataset.tab === tab)
  );
}

// ══════════════════════════════════════════════════════════
// TOAST
// ══════════════════════════════════════════════════════════
function showToast(icon, msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  document.getElementById('toastIcon').textContent = icon;
  document.getElementById('toastMsg').textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

// ══════════════════════════════════════════════════════════
// UTILITIES
// ══════════════════════════════════════════════════════════
function toDateStr(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function pad(n) { return String(n).padStart(2, '0'); }
