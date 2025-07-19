'use server'

import { db } from "@/lib/db";
import { CertificateDisplay } from "@/components/gamification/CertificateDisplay";
import { redirect } from "next/navigation";

interface CertPageProps {
  params: Promise<{
    verificationCode: string;
  }>;
}

const CertPage = async ({ params }: CertPageProps) => {
  const { verificationCode } = await params;
  const certificate = await db.certificate.findUnique({
    where: {
      verificationCode,
    },
    include: {
      course: {
        select: {
          title: true,
        },
      },
    },
  });

  if (!certificate) {
    return redirect('/');
  }

  // This is a placeholder for user name. In a real app, you'd have a user relation.
  const user = { name: "A Student" };

  const certificateData = {
    ...certificate,
    user,
    issuedAt: certificate.issuedAt.toISOString(),
  };

  return (
    <div className="container mx-auto p-4">
      <CertificateDisplay certificate={certificateData} />
    </div>
  );
};

export default CertPage;
