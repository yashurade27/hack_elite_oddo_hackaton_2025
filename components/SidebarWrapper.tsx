"use client";
import { usePathname } from 'next/navigation';
import { AppSidebar } from '@/components/AppSidebar';
import AppSideBarOrganzier from './Organizer/AppSideBarOrganizer';

export default function SidebarWrapper() {
  const pathname = usePathname();
  const isOrganizerRoute = pathname.startsWith('/organizer');

  return isOrganizerRoute ? <AppSideBarOrganzier /> : <AppSidebar />;
}