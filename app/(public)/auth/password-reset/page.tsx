import PasswordResetRequestForm from "@/components/auth/PasswordResetRequestForm";

type PageProps = {
  searchParams?: Promise<{ email?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const { email = "" } = (await searchParams) ?? {};

  return <PasswordResetRequestForm initialEmail={decodeURIComponent(email)} />;
}
