import { isAxiosError } from "axios";

type ApiErrorItem = {
  message?: unknown;
};

type ApiErrorPayload = {
  detail?: unknown;
  message?: unknown;
  title?: unknown;
  errors?: ApiErrorItem[];
};

function isMeaningfulText(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isErrorCodeLike(value: string) {
  return /^[A-Z]{2,}\d+$/.test(value.trim());
}

export function extractApiErrorMessage(error: unknown, fallback: string) {
  if (isAxiosError(error)) {
    const data = error.response?.data;

    if (isMeaningfulText(data)) {
      return data;
    }

    if (data && typeof data === "object") {
      const payload = data as ApiErrorPayload;

      if (isMeaningfulText(payload.detail)) {
        return payload.detail;
      }

      if (isMeaningfulText(payload.message)) {
        return payload.message;
      }

      const firstFieldError = payload.errors?.find((item) => isMeaningfulText(item.message));
      if (firstFieldError && isMeaningfulText(firstFieldError.message)) {
        return firstFieldError.message;
      }

      if (isMeaningfulText(payload.title) && !isErrorCodeLike(payload.title)) {
        return payload.title;
      }
    }
  }

  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  if (error && typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (isMeaningfulText(message)) {
      return message;
    }
  }

  return fallback;
}
