'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface CertificateDisplayProps {
  certificate: {
    course: {
      title: string;
    };
    user: {
      name: string;
    };
    issuedAt: string;
    verificationCode: string;
  };
}

export const CertificateDisplay = ({ certificate }: CertificateDisplayProps) => {
  return (
    <Card className="w-full max-w-2xl mx-auto mt-10 shadow-lg">
      <CardHeader className="bg-gray-100 dark:bg-gray-800 p-8">
        <CardTitle className="text-center text-3xl font-bold text-gray-800 dark:text-gray-200">Certificate of Completion</CardTitle>
      </CardHeader>
      <CardContent className="p-8 text-center">
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">This is to certify that</p>
        <p className="text-4xl font-bold text-blue-600 mb-6">{certificate.user.name}</p>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">has successfully completed the course</p>
        <p className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-8">{certificate.course.title}</p>
        <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-500 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <p>Issued on: {new Date(certificate.issuedAt).toLocaleDateString()}</p>
            <p>Verification Code: {certificate.verificationCode}</p>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-6 w-6 text-green-500" />
            <span className="font-semibold">Verified</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};