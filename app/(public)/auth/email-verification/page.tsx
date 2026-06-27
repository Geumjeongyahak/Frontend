import EmailVerificationForm from "@/components/auth/EmailVerificationForm";

type PageProps = {
  searchParams?: Promise<{ email?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const { email = "" } = (await searchParams) ?? {};

  return <EmailVerificationForm email={decodeURIComponent(email)} />;
}
