import type { Metadata } from "next";
import LegalDocument from "@/components/LegalDocument";

export const metadata: Metadata = {
  title: "Terms of Service | UNBIG",
  description: "The terms that govern use of the UNBIG website and mobile app.",
};

export default function TermsOfServicePage() {
  return <LegalDocument fileName="terms-of-service.md" />;
}
