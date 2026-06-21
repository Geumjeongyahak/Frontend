import type { GoogleCallbackRedirectQueryParamsDto } from "@/api/auth/auth.dto";
import GoogleCallbackPage from "@/components/auth/GoogleCallbackPage";

type PageProps = {
  searchParams?: Promise<GoogleCallbackRedirectQueryParamsDto>;
};

export default async function Page({ searchParams }: PageProps) {
  const resolvedSearchParams = (await searchParams) ?? {};

  return <GoogleCallbackPage searchParams={resolvedSearchParams} />;
}
