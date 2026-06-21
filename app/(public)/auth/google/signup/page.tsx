import type { GoogleCallbackRedirectQueryParamsDto } from "@/api/auth/auth.dto";
import GoogleSignupForm from "@/components/auth/GoogleSignupForm";

type PageProps = {
  searchParams?: Promise<GoogleCallbackRedirectQueryParamsDto>;
};

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};

  return <GoogleSignupForm searchParams={resolvedSearchParams} />;
}
