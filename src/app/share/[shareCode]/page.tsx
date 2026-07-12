import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui/container";
import { SharedPlanClient } from "@/components/share/shared-plan-client";
import { getSharedPlan } from "@/server/repositories/shared-plans";

export const metadata: Metadata = {
  robots: { follow: false, index: false },
  title: "Shared Puja Plan",
};

export const dynamic = "force-dynamic";

async function loadSharedPlan(shareCode: string) {
  try {
    return await getSharedPlan(shareCode);
  } catch {
    notFound();
  }
}

export default async function SharedPlanPage({
  params,
}: {
  params: Promise<{ shareCode: string }>;
}) {
  const { shareCode } = await params;
  const plan = await loadSharedPlan(shareCode);

  return (
    <Container className="max-w-3xl py-10">
      <SharedPlanClient plan={plan} />
    </Container>
  );
}
