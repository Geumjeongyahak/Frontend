import PasswordResetForm from "@/components/auth/PasswordResetForm";

type PageProps = {
  searchParams?: Promise<{ email?: string; code?: string }>;
};

export default async function Page({ searchParams }: PageProps) {
  const { email = "", code = "" } = (await searchParams) ?? {};

  return (
    <PasswordResetForm
      email={decodeURIComponent(email)}
      resetCode={decodeURIComponent(code)}
    />
  );
}
