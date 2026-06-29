function normalizePath(pathname: string) {
  if (!pathname || pathname === "/") {
    return "/";
  }

  return pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;
}

export function getBackNavigationTarget(pathname: string) {
  const normalizedPath = normalizePath(pathname);

  const rules: Array<{ pattern: RegExp; resolve: (matched: RegExpMatchArray) => string }> = [
    { pattern: /^\/requests\/class\/[^/]+\/proposals$/, resolve: () => "/requests/class" },
    { pattern: /^\/requests\/class$/, resolve: () => "/" },
    { pattern: /^\/requests\/payment$/, resolve: () => "/" },
    { pattern: /^\/schedule$/, resolve: () => "/" },
    { pattern: /^\/notifications$/, resolve: () => "/" },
    { pattern: /^\/mypage$/, resolve: () => "/" },
    { pattern: /^\/journal\/write$/, resolve: () => "/" },
    { pattern: /^\/login$/, resolve: () => "/" },
    { pattern: /^\/register$/, resolve: () => "/" },
    { pattern: /^\/apply\/(status|write)$/, resolve: () => "/apply" },
    { pattern: /^\/apply$/, resolve: () => "/" },
    { pattern: /^\/auth\/google\/signup$/, resolve: () => "/register" },
    { pattern: /^\/auth\/(email-verification|google\/callback)$/, resolve: () => "/login" },
    { pattern: /^\/info\/events\/(new|[^/]+)$/, resolve: () => "/info/events" },
    { pattern: /^\/info\/events$/, resolve: () => "/" },
    { pattern: /^\/info\/(classes|departments|history)$/, resolve: () => "/" },
    { pattern: /^\/info$/, resolve: () => "/" },
    {
      pattern:
        /^\/staff\/archive\/(document-forms|exam-materials|handover-documents|meeting-records)\/(new|[^/]+)$/,
      resolve: (matched) => `/staff/archive/${matched[1]}`,
    },
    {
      pattern: /^\/staff\/archive\/(document-forms|exam-materials|handover-documents|meeting-records)$/,
      resolve: () => "/",
    },
    { pattern: /^\/staff\/archive\/(phone-book|school-rules)$/, resolve: () => "/" },
    { pattern: /^\/staff\/archive$/, resolve: () => "/" },
    { pattern: /^\/staff\/board\/(new|[^/]+)$/, resolve: () => "/staff/board" },
    { pattern: /^\/staff\/board$/, resolve: () => "/" },
    { pattern: /^\/staff\/calendar$/, resolve: () => "/" },
    {
      pattern: /^\/staff\/finance-management\/(new|[^/]+)$/,
      resolve: () => "/staff/finance-management",
    },
    { pattern: /^\/staff\/finance-management$/, resolve: () => "/" },
    {
      pattern: /^\/staff\/class-management\/exchange-request\/[^/]+\/accepted$/,
      resolve: () => "/staff/class-management/exchange-request",
    },
    {
      pattern: /^\/staff\/class-management\/(absence-request|class-journal|exchange-request)\/(new|[^/]+)$/,
      resolve: (matched) => `/staff/class-management/${matched[1]}`,
    },
    {
      pattern: /^\/staff\/class-management\/(absence-request|class-journal|exchange-request)$/,
      resolve: () => "/",
    },
    { pattern: /^\/staff\/class-management\/weekly-schedule$/, resolve: () => "/" },
    { pattern: /^\/staff\/class-management$/, resolve: () => "/" },
    { pattern: /^\/staff$/, resolve: () => "/" },
    { pattern: /^\/admin\/login$/, resolve: () => "/admin" },
    { pattern: /^\/admin$/, resolve: () => "/" },
  ];

  for (const rule of rules) {
    const matched = normalizedPath.match(rule.pattern);
    if (!matched) {
      continue;
    }

    return rule.resolve(matched);
  }

  if (normalizedPath === "/") {
    return null;
  }

  return "/";
}

export function shouldConfirmExitOnBack(pathname: string, isMobileViewport: boolean) {
  return normalizePath(pathname) === "/" && isMobileViewport;
}
