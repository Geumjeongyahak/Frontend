const ADMIN_RETURN_TO = "/admin";

export function getSafeLoginReturnTo(value: string | null | undefined) {
  return value === ADMIN_RETURN_TO ? ADMIN_RETURN_TO : "/";
}
