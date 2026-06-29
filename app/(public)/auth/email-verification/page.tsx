import EmailVerificationForm from "@/components/auth/EmailVerificationForm";

type PageProps = {
  searchParams?: Promise<{ email?: string; code?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const { email = "", code = "" } = (await searchParams) ?? {};

  return (
    <EmailVerificationForm
      email={decodeURIComponent(email)}
      verificationCode={decodeURIComponent(code)}
    />
  );
}
