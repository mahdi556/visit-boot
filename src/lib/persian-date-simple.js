// 📂 src/lib/persian-date-simple.js
// تبدیل ساده تاریخ میلادی به شمسی بدون کتابخانه خارجی

const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const weekdays = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنجشنبه', 'جمعه', 'شنبه'];
const months = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

function convertToPersian(num) {
  return num.toString().replace(/\d/g, (digit) => persianNumbers[parseInt(digit)]);
}

// الگوریتم تبدیل میلادی به شمسی
function gregorianToJalaali(gy, gm, gd) {
  const g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  let jy = (gy <= 1600) ? 0 : 979;
  gy -= (gy <= 1600) ? 621 : 1600;
  let gy2 = (gm > 2) ? (gy + 1) : gy;
  let days = (365 * gy) + (parseInt((gy2 + 3) / 4)) - (parseInt((gy2 + 99) / 100)) 
    + (parseInt((gy2 + 399) / 400)) - 80 + gd + g_d_m[gm - 1];
  jy += 33 * (parseInt(days / 12053)); 
  days %= 12053;
  jy += 4 * (parseInt(days / 1461));
  days %= 1461;
  jy += parseInt((days - 1) / 365);
  if (days > 365) days = (days - 1) % 365;
  let jm = (days < 186) ? 1 + parseInt(days / 31) : 7 + parseInt((days - 186) / 30);
  let jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30));
  return { jy: jy, jm: jm, jd: jd };
}

// تبدیل تاریخ میلادی به شمسی
export function toPersianDate(date) {
  if (!date) {
    return 'تعیین نشده';
  }

  try {
    const gregorianDate = new Date(date);
    
    if (isNaN(gregorianDate.getTime())) {
      return 'تاریخ نامعتبر';
    }

    const gy = gregorianDate.getFullYear();
    const gm = gregorianDate.getMonth() + 1;
    const gd = gregorianDate.getDate();

    const jalaali = gregorianToJalaali(gy, gm, gd);
    const weekday = weekdays[gregorianDate.getDay()];
    const monthName = months[jalaali.jm - 1];
    
    const persianDate = `${weekday} ${convertToPersian(jalaali.jd)} ${monthName} ${convertToPersian(jalaali.jy)}`;
    
    return persianDate;
  } catch (error) {
    console.error('Error converting to Persian date:', error);
    return 'خطا در تبدیل تاریخ';
  }
}

// تبدیل شمسی به میلادی (الگوریتم معکوس)
function jalaaliToGregorian(jy, jm, jd) {
  jy += 1595;
  let days = -355668 + (365 * jy) + (parseInt(jy / 33) * 8) + parseInt(((jy % 33) + 3) / 4) 
    + jd + ((jm < 7) ? (jm - 1) * 31 : ((jm - 7) * 30) + 186);
  let gy = 400 * parseInt(days / 146097);
  days %= 146097;
  if (days > 36524) {
    gy += 100 * parseInt(--days / 36524);
    days %= 36524;
    if (days >= 365) days++;
  }
  gy += 4 * parseInt(days / 1461);
  days %= 1461;
  if (days > 365) {
    gy += parseInt((days - 1) / 365);
    days = (days - 1) % 365;
  }
  let gd = days + 1;
  const sal_a = [0, 31, ((gy % 4 === 0 && gy % 100 !== 0) || (gy % 400 === 0)) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  let gm;
  for (gm = 0; gm < 13; gm++) {
    let v = sal_a[gm];
    if (gd <= v) break;
    gd -= v;
  }
  return { gy: gy, gm: gm, gd: gd };
}

// تبدیل تاریخ شمسی به میلادی
export function persianToGregorian(year, month, day) {
  try {
    const gregorian = jalaaliToGregorian(year, month, day);
    return new Date(gregorian.gy, gregorian.gm - 1, gregorian.gd);
  } catch (error) {
    console.error('Error converting Persian to Gregorian:', error);
    return null;
  }
}

// اضافه کردن روز به تاریخ
export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// فرمت تاریخ برای input
export function toISOStringWithoutTimezone(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// بررسی معتبر بودن تاریخ
export function isValidDate(date) {
  return date && !isNaN(new Date(date).getTime());
}

// گرفتن تاریخ فردا
export function getTomorrow() {
  return addDays(new Date(), 1);
}

// گرفتن تاریخ پس‌فردا
export function getDayAfterTomorrow() {
  return addDays(new Date(), 2);
}

// گرفتن تاریخ ۳ روز بعد
export function getThreeDaysLater() {
  return addDays(new Date(), 3);
}

// گرفتن تاریخ شمسی امروز
export function getTodayJalaali() {
  const today = new Date();
  const gy = today.getFullYear();
  const gm = today.getMonth() + 1;
  const gd = today.getDate();
  return gregorianToJalaali(gy, gm, gd);
}

// اضافه کردن روز به تاریخ شمسی
export function addDaysToJalaali(jalaaliDate, days) {
  try {
    const gregorianDate = jalaaliToGregorian(jalaaliDate.jy, jalaaliDate.jm, jalaaliDate.jd);
    const newGregorianDate = addDays(new Date(gregorianDate.gy, gregorianDate.gm - 1, gregorianDate.gd), days);
    const gy = newGregorianDate.getFullYear();
    const gm = newGregorianDate.getMonth() + 1;
    const gd = newGregorianDate.getDate();
    return gregorianToJalaali(gy, gm, gd);
  } catch (error) {
    console.error('Error adding days to Jalaali date:', error);
    return jalaaliDate;
  }
}
export function getToday() {
  return new Date();
}
