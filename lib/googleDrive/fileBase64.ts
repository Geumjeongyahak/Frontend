export async function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const result = reader.result;

      if (typeof result !== "string") {
        reject(new Error("파일을 base64 문자열로 변환하지 못했습니다."));
        return;
      }

      const [, base64 = ""] = result.split(",");
      resolve(base64);
    };

    reader.onerror = () => {
      reject(reader.error ?? new Error("파일을 읽는 중 오류가 발생했습니다."));
    };

    reader.readAsDataURL(file);
  });
}
