import { notFound } from "next/navigation";
import FinanceRequestDetailPage from "@/components/staff/FinanceRequestDetailPage";
import {
  financeRequests,
  getFinanceRequestById,
} from "@/components/staff/staffFinanceData";

type PageProps = {
  params: Promise<{
    requestId: string;
  }>;
};

export function generateStaticParams() {
  return financeRequests.map((request) => ({
    requestId: String(request.id),
  }));
}

export default async function Page({ params }: PageProps) {
  const { requestId } = await params;
  const request = getFinanceRequestById(Number(requestId));

  if (!request) {
    notFound();
  }

  return <FinanceRequestDetailPage request={request} />;
}
