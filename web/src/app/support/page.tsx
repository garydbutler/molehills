import type { Metadata } from "next";
import LegalDocument from "@/components/LegalDocument";

export const metadata: Metadata = {
  title: "Support | UNBIG",
  description: "Help with UNBIG accounts, subscriptions, and the mobile app.",
};

export default function SupportPage() {
  return <LegalDocument fileName="support.md" />;
}
