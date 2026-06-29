import EmailVerificationForm from "@/components/auth/EmailVerificationForm";

type PageProps = {
  searchParams?: Promise<{
    email?: string;
    code?: string;
    token?: string;
    status?: string;
    errorCode?: string;
  }>;
};

export default async function Page({ searchParams }: PageProps) {
  const { email = "", code = "", token = "", status = "", errorCode = "" } = (await searchParams) ?? {};

  return (
    <EmailVerificationForm
      email={decodeURIComponent(email)}
      verificationCode={decodeURIComponent(code)}
      token={decodeURIComponent(token)}
      resultStatus={status}
      errorCode={errorCode}
    />
  );
}
