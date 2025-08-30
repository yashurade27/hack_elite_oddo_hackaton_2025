"use client";
import { Moon, Sun, User, LogOut, Map } from "lucide-react";
import React from "react";
import { SidebarTrigger } from "./ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "./ui/dropdown-menu";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import useSession from "@/hooks/useSession";

interface NavbarProps {}

const Navbar: React.FC<NavbarProps> = () => {
  const path = usePathname();
  const router = useRouter();
  const { setTheme } = useTheme();
  const { user, isLoading, signOut } = useSession();

  // Generate breadcrumbs based on the current path
  const generateBreadcrumbs = () => {
    if (path === "/" || !path) return null;
    
    const segments = path.split('/').filter(Boolean);
    
    const breadcrumbs = segments.map((segment, index) => {
      // Create the path for this breadcrumb
      const href = `/${segments.slice(0, index + 1).join('/')}`;
      
      // Format the display text
      let displayText = segment.charAt(0).toUpperCase() + segment.slice(1);
      
      // Handle dynamic segments (those with parameters)
      if (segment.startsWith('[') && segment.endsWith(']')) {
        displayText = segment.slice(1, -1).charAt(0).toUpperCase() + segment.slice(2, -1);
      } 
      // Handle trip ID routes
      else if (segment.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
        displayText = 'EventHive';
      }
      
      return { href, displayText };
    });
    
    return breadcrumbs;
  };
  
  const breadcrumbs = generateBreadcrumbs();

  return (
    <div className="flex items-center justify-between p-4 sticky top-0 z-40 bg-background border-b backdrop-blur-sm bg-opacity-90">
      <div className="gap-3 flex items-center">
        <SidebarTrigger />
        <Link href="/">
          <h1 className="text-lg font-bold hover:text-primary cursor-pointer transition-colors">EventHive</h1>
        </Link>
      </div>
      <div className="hidden md:block overflow-x-auto max-w-[50vw]">
        {breadcrumbs && (
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              
              {breadcrumbs.map((crumb, i) => (
                <React.Fragment key={i}>
                  {i === breadcrumbs.length - 1 ? (
                    <BreadcrumbItem>
                      <BreadcrumbPage>{crumb.displayText}</BreadcrumbPage>
                    </BreadcrumbItem>
                  ) : (
                    <>
                      <BreadcrumbItem>
                        <BreadcrumbLink href={crumb.href}>{crumb.displayText}</BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator />
                    </>
                  )}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}
      </div>
      <div className="flex items-center gap-3 sm:gap-6">
        {/* Theme Toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
              <Sun className="h-[1rem] w-[1rem] sm:h-[1.2rem] sm:w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
              <Moon className="absolute h-[1rem] w-[1rem] sm:h-[1.2rem] sm:w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
              <span className="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="mr-2 h-4 w-4" />
              <span>Light</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="mr-2 h-4 w-4" />
              <span>Dark</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" x2="16" y1="21" y2="21" />
                <line x1="12" x2="12" y1="17" y2="21" />
              </svg>
              <span>System</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Menu */}
        {isLoading ? (
          <Avatar>
            <AvatarFallback className="animate-pulse">...</AvatarFallback>
          </Avatar>
        ) : user && Object.keys(user).length > 0 ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="cursor-pointer">
                {user.image ? (
                  <AvatarImage src={user.image} alt={user.name || "User"} />
                ) : null}
                <AvatarFallback>
                  {user.name ? user.name.charAt(0).toUpperCase() : 
                   user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                {user.name || user.email || 'My Account'}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer w-full flex items-center">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/mybookings" className="cursor-pointer w-full flex items-center">
                    <Map className="mr-2 h-4 w-4" />
                    <span>My Bookings</span>
                  </Link>
                </DropdownMenuItem>
               
              </DropdownMenuGroup>
              {user && (user.role === 'ADMIN' ) && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer w-full flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                        <rect width="7" height="9" x="3" y="3" rx="1" />
                        <rect width="7" height="5" x="14" y="3" rx="1" />
                        <rect width="7" height="9" x="14" y="12" rx="1" />
                        <rect width="7" height="5" x="3" y="16" rx="1" />
                      </svg>
                      <span>Admin Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => {
                  signOut();
                  router.push('/');
                }}
                className="cursor-pointer text-destructive focus:text-destructive"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="flex gap-2">
            <Button asChild variant="outline" size="sm" className="hidden sm:flex">
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild size="sm" className="hidden sm:flex">
              <Link href="/register">Sign Up</Link>
            </Button>
            <Button asChild size="sm" className="flex sm:hidden">
              <Link href="/register">
                <User size={16} />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;