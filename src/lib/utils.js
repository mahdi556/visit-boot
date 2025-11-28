// 📂 src/lib/utils.js
export function toPersianDate(date) {
  if (!date) {
    return 'تعیین نشده';
  }

  try {
    const persianNumbers = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
    
    const convertToPersian = (num) => {
      return num.toString().replace(/\d/g, (digit) => persianNumbers[parseInt(digit)]);
    };

    const gregorianDate = new Date(date);
    
    // بررسی معتبر بودن تاریخ
    if (isNaN(gregorianDate.getTime())) {
      return 'تاریخ نامعتبر';
    }

    const persianDate = new Intl.DateTimeFormat('fa-IR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    }).format(gregorianDate);

    return convertToPersian(persianDate);
  } catch (error) {
    console.error('Error converting to Persian date:', error);
    return 'خطا در تبدیل تاریخ';
  }
}

export function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function toISOStringWithoutTimezone(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// تابع جدید برای بررسی معتبر بودن تاریخ
export function isValidDate(date) {
  return date && !isNaN(new Date(date).getTime());
}