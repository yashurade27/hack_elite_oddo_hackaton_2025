"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider } from "@/components/ui/sidebar";
import SidebarWrapper from "@/components/SidebarWrapper";
import Navbar from "@/components/Navbar";

interface MainLayoutContentProps {
  children: React.ReactNode;
}

export default function MainLayoutContent({ children }: MainLayoutContentProps) {
  const pathname = usePathname();
  const isOrganizerRoute = pathname.startsWith("/organizer");

  // For organizer routes, don't wrap with SidebarProvider since the organizer layout handles it
  if (isOrganizerRoute) {
    return <>{children}</>;
  }

  // For all other routes, use the standard layout with sidebar and navbar
  return (
    <SidebarProvider defaultOpen={true}>
      <SidebarWrapper />
      <main className="w-full">
        <Navbar />
        <div className="px-4">{children}</div>
      </main>
    </SidebarProvider>
  );
}