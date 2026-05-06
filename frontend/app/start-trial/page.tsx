import type { Metadata } from "next";
import StartTrialFlow from "./_StartTrialFlow";

// Transient redirect surface — not a page we want crawlers ranking.
export const metadata: Metadata = {
  title: "Start your free trial — The Mambo Guild",
  robots: { index: false, follow: false },
};

export default function StartTrialPage() {
  return <StartTrialFlow />;
}
