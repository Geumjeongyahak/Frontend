const GOOGLE_DRIVE_UPLOAD_URL =
  "https://script.google.com/macros/s/AKfycbwbqn9pNLSq1yalCgcwDmXXESZpWVvZajy5qWd3pjkmhXWDazB0mMOdGdnJ-6pmVK6Zmg/exec";

export async function financeReceiptToGoogleDrive(file: File) {
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };

    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  const response = await fetch(GOOGLE_DRIVE_UPLOAD_URL, {
    method: "POST",
    body: JSON.stringify({
      fileName: file.name,
      mimeType: file.type,
      base64,
    }),
  });

  if (!response.ok) {
    throw new Error("Google Drive 업로드에 실패했습니다.");
  }

  return response.json();
}
