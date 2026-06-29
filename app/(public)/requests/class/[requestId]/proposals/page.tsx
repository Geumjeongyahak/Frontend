import { notFound } from "next/navigation";
import MobileExchangeProposalsPage from "@/pwa/components/MobileExchangeProposalsPage";

type PageProps = {
  params: Promise<{
    requestId: string;
  }>;
};

export default async function Page({ params }: PageProps) {
  const { requestId } = await params;
  const parsedRequestId = Number(requestId);

  if (!Number.isInteger(parsedRequestId) || parsedRequestId < 1) {
    notFound();
  }

  return <MobileExchangeProposalsPage requestId={parsedRequestId} />;
}
