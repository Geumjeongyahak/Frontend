type ProblemLike = {
  response?: {
    data?: unknown;
  };
};

function getProblemData(error: unknown) {
  if (!error || typeof error !== "object" || !("response" in error)) {
    return null;
  }

  const data = (error as ProblemLike).response?.data;
  return data && typeof data === "object" ? data : null;
}

function getStringField(data: object, field: string) {
  return field in data && typeof data[field as keyof typeof data] === "string"
    ? data[field as keyof typeof data]
    : "";
}

export function getSignupErrorMessage(error: unknown) {
  const data = getProblemData(error);
  const code = data ? getStringField(data, "code") : "";
  const detail = data ? getStringField(data, "detail") : "";

  switch (code) {
    case "AUTH007":
      return "이미 Google 계정으로 가입된 이메일입니다. Google로 로그인해 주세요.";
    case "BIZ-01-002":
      return "이미 사용 중인 이메일입니다.";
    case "VAL001":
    case "VAL002":
    case "VAL003":
      return "입력한 회원가입 정보를 확인해 주세요.";
    default:
      return detail || "회원가입 정보를 확인해 주세요.";
  }
}

export function getVerificationStatusMessage(status: string, errorCode = "") {
  if (status === "success") {
    return "이메일 인증이 완료되었습니다. 로그인해 주세요.";
  }

  if (status === "expired" || errorCode === "AUTH015") {
    return "인증 링크가 만료되었습니다. 인증 메일을 다시 받아 주세요.";
  }

  if (errorCode === "VAL003") {
    return "인증 링크가 올바르지 않습니다. 회원가입 후 받은 메일의 버튼을 다시 열어 주세요.";
  }

  if (status === "invalid" || errorCode === "AUTH014") {
    return "인증 링크가 올바르지 않습니다. 인증 메일을 다시 받아 주세요.";
  }

  return "메일의 인증하기 버튼을 눌러 인증을 완료해 주세요.";
}
