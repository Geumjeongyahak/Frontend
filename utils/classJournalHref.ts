export function buildClassJournalHref(page: number, keyword = "", mine = false) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (keyword.trim()) params.set("keyword", keyword.trim());
  if (mine) params.set("mine", "1");
  const query = params.toString();
  return query ? `/staff/class-management/class-journal?${query}` : "/staff/class-management/class-journal";
}
