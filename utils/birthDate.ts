function isResidentRegistrationNumberPrefix(value?: string) {
  return Boolean(value && /^\d{6}$/.test(value));
}

function isIsoBirthDate(value?: string) {
  return Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value));
}

export function formatBirthDate(value?: string) {
  if (value && isIsoBirthDate(value)) {
    return value.replace(/-/g, ".");
  }

  if (!value || !isResidentRegistrationNumberPrefix(value)) {
    return "등록된 생년월일이 없습니다.";
  }

  const yearPrefix = Number(value.slice(0, 2)) > 30 ? "19" : "20";
  return `${yearPrefix}${value.slice(0, 2)}.${value.slice(2, 4)}.${value.slice(4, 6)}`;
}

export function toBirthDateInputValue(value?: string) {
  if (value && isIsoBirthDate(value)) {
    return value;
  }

  if (!value || !isResidentRegistrationNumberPrefix(value)) {
    return "";
  }

  const yearPrefix = Number(value.slice(0, 2)) > 30 ? "19" : "20";
  return `${yearPrefix}${value.slice(0, 2)}-${value.slice(2, 4)}-${value.slice(4, 6)}`;
}

export function toResidentRegistrationNumberPrefix(date: string) {
  if (isResidentRegistrationNumberPrefix(date)) {
    return date;
  }

  const [year, month, day] = date.split("-");

  if (!year || !month || !day) {
    return "";
  }

  return `${year.slice(-2)}${month}${day}`;
}
