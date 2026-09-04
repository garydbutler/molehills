import type { Metadata } from "next";
import LegalDocument from "@/components/LegalDocument";

export const metadata: Metadata = {
  title: "Privacy Policy | UNBIG",
  description: "How UNBIG collects, uses, and protects personal information.",
};

export default function PrivacyPolicyPage() {
  return <LegalDocument fileName="privacy-policy.md" />;
}
