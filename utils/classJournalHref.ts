export function buildClassJournalHref(page: number, keyword: string) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (keyword.trim()) params.set("keyword", keyword.trim());
  const query = params.toString();
  return query ? `/staff/class-management?${query}` : "/staff/class-management";
}
