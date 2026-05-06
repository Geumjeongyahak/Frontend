const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxZ9VY6A9rXkNInZnXt_cSO6SVgkd196DV7_mfqeXJViUmFSVgSRfvM9tX9oOy63P-n7Q/exec";

export async function sendClassAttendanceToGoogleSheet(payload: {
  date: string;
  className: string;
  attendances: {
    name: string;
    status: string;
  }[];
}) {
  const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
    method: "POST",
    redirect: "follow",
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("출석 저장 실패");
  }

  return response.json();
}
