import EmailVerificationForm from "@/components/auth/EmailVerificationForm";

type PageProps = {
  searchParams?: Promise<{ email?: string; code?: string; status?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const { email = "", code = "", status = "" } = (await searchParams) ?? {};

  return (
    <EmailVerificationForm
      email={decodeURIComponent(email)}
      verificationCode={decodeURIComponent(code)}
      resultStatus={status}
    />
  );
}
