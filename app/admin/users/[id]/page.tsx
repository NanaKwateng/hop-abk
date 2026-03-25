// app/admin/users/[id]/page.tsx
import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { fetchMemberById } from "@/actions/member";
import { fetchMemberPayments, fetchPaymentAnalytics } from "@/actions/payments";
import { fetchMemberTestimonials } from "@/actions/testimonials";
import { MemberDetailPage } from "@/components/users/member-detail-page";
import { UserDetailSkeleton } from "@/components/dashboard/users/user-detail-skeleton";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const member = await fetchMemberById(id);

  if (!member) {
    return { title: "Member Not Found" };
  }

  return {
    title: `${member.firstName} ${member.lastName} | Member Profile`,
    description: `Profile and payment records for ${member.firstName} ${member.lastName}`,
    robots: { index: false, follow: false },
  };
}

export default async function Page({ params }: PageProps) {
  const { id } = await params;
  const currentYear = new Date().getFullYear();

  const [member, payments, analytics, testimonials] = await Promise.all([
    fetchMemberById(id),
    fetchMemberPayments(id, currentYear),
    fetchPaymentAnalytics(id),
    fetchMemberTestimonials(id),
  ]);

  if (!member) {
    notFound();
  }

  return (
    <Suspense fallback={<UserDetailSkeleton />}>
      <MemberDetailPage
        member={member}
        initialPayments={payments}
        initialAnalytics={analytics}
        initialTestimonials={testimonials}
      />
    </Suspense>
  );
}



