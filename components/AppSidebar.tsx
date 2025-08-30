"use client"
import {
  Home,
  User,
  Settings,
  Compass,
  CalendarCheck2,
  Ticket,
  Bell,
  Heart,
  Gift,
  Calendar,
  Star,
  MapPin,
  CreditCard,
  Users,
  HelpCircle,
  LogOut,
  ChevronDown,
  ChevronRight,
  Music,
  Gamepad2,
  Briefcase,
  Coffee,
  Camera,
  Dumbbell,
  Palette,
  Plus
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import useSession from "@/hooks/useSession"
import { useState } from "react"

// Categories with icons
const categories = [
  { title: "Music", url: "/category/music", icon: Music },
  { title: "Sports ", url: "/category/sports", icon: Dumbbell },
  { title: "Technology", url: "/category/tech", icon: Gamepad2 },
  { title: "Business", url: "/category/business", icon: Briefcase },
  { title: "Food", url: "/category/food", icon: Coffee },
  { title: "Arts ", url: "/category/arts", icon: Palette },
]

// Navigation items for main menu
const mainItems = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
  {
    title: "Trending",
    url: "/trending",
    icon: Star,
  },
]

// User-specific items
const userItems = [
  {
    title: "My Tickets",
    url: "/tickets",
    icon: Ticket,
  },
  {
    title: "Bookings",
    url: "/bookings",
    icon: CalendarCheck2,
  },
  {
    title: "Favorites",
    url: "/favorites",
    icon: Heart,
  },
  {
    title: "Reviews",
    url: "/reviews",
    icon: Star,
  }
]

// Rewards & engagement items
const rewardsItems = [
  {
    title: "Loyalty Points",
    url: "/loyalty",
    icon: Gift,
  },
  {
    title: "Referrals",
    url: "/referrals",
    icon: Users,
  },
  {
    title: "Payments",
    url: "/payments",
    icon: CreditCard,
  }
]

// Account management items
const accountItems = [
  {
    title: "Profile",
    url: "/profile",
    icon: User,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
  {
    title: "Help",
    url: "/help",
    icon: HelpCircle,
  }
]

export function AppSidebar() {
  const { user } = useSession();
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);

  return (
    <Sidebar collapsible="icon">
  <SidebarContent>
    {/* Main Navigation */}
    <SidebarGroup>
      <SidebarGroupLabel className="py-8">
        <SidebarMenuButton
          asChild
          className="data-[slot=sidebar-menu-button]:!p-1.5"
        >
          <a href="/">
            <CalendarCheck2 className="!size-5" />
            <span className="text-base font-semibold">EventHive</span>
          </a>
        </SidebarMenuButton>
      </SidebarGroupLabel>
        <SidebarSeparator className="my-2"/>
          <SidebarGroupContent className="p1-[0.35rem]">
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
              
              <Collapsible open={isCategoriesOpen} onOpenChange={setIsCategoriesOpen}>
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <Calendar />
                      <span>Categories</span>
                      {isCategoriesOpen ? 
                      <ChevronDown className="ml-auto w-4 h-4" /> : 
                      <ChevronRight className="ml-auto w-4 h-4" />
                }
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenu>
                      {categories.map((category) => (
                        <SidebarMenuItem key={category.title}>
                          <SidebarMenuButton asChild className="pl-6">
                            <a href={category.url}>
                              <category.icon className="w-4 h-4" />
                              <span className="text-sm">{category.title}</span>
                            </a>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      ))}
                    </SidebarMenu>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Notifications */}
        {user && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <a href="/notifications">
                      <Bell />
                      <span>Notifications</span>
                      {/* Add notification badge here if needed */}
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* User-specific content */}
        {user && (
          <SidebarGroup>
            <SidebarGroupLabel>My Events</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {userItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Rewards Section */}
        {user && (
          <SidebarGroup>
            <SidebarGroupLabel>Rewards</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {rewardsItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Account Section */}
        {user && (
          <SidebarGroup>
            <SidebarGroupLabel>Account</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {accountItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <button onClick={() => {/* Add logout logic */}}>
                      <LogOut />
                      <span>Logout</span>
                    </button>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <div className="px-3 py-2">
          <div className="flex items-center justify-center">
            <CalendarCheck2 className="w-6 h-6 text-primary" />
          </div>
          <p className="text-xs text-center mt-2 text-muted-foreground">
            EventHive v1.0
          </p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}