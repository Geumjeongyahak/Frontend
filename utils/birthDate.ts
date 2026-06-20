export function formatBirthDate(prefix?: string) {
  if (!prefix || !/^\d{6}$/.test(prefix)) {
    return "등록된 생년월일이 없습니다.";
  }

  const yearPrefix = Number(prefix.slice(0, 2)) > 30 ? "19" : "20";
  return `${yearPrefix}${prefix.slice(0, 2)}.${prefix.slice(2, 4)}.${prefix.slice(4, 6)}`;
}

export function toBirthDateInputValue(prefix?: string) {
  if (!prefix || !/^\d{6}$/.test(prefix)) {
    return "";
  }

  const yearPrefix = Number(prefix.slice(0, 2)) > 30 ? "19" : "20";
  return `${yearPrefix}${prefix.slice(0, 2)}-${prefix.slice(2, 4)}-${prefix.slice(4, 6)}`;
}

export function toResidentRegistrationNumberPrefix(date: string) {
  const [year, month, day] = date.split("-");

  if (!year || !month || !day) {
    return "";
  }

  return `${year.slice(-2)}${month}${day}`;
}
