"use client";
import { usePathname } from 'next/navigation';
import { AppSidebar } from '@/components/AppSidebar';
import AppSideBarAdmin from './Admin/AppSideBarAdmin';

export default function SidebarWrapper() {
  const pathname = usePathname();
  const isAdminRoute = pathname.startsWith('/dashboard');

  return isAdminRoute ? <AppSideBarAdmin /> : <AppSidebar />;
}