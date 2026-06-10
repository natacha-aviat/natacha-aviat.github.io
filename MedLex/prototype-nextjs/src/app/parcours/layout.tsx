import { FunnelProvider } from "@/components/FunnelProvider";

export default function ParcoursLayout({ children }: { children: React.ReactNode }) {
  return <FunnelProvider>{children}</FunnelProvider>;
}
