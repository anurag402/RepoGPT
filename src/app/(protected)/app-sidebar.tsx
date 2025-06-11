"use client";

import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
import { Plus, LucideMenu, LucideChevronLeft, LucideChevronRight, Bot, CreditCard, LayoutDashboard, Presentation } from "lucide-react";
import { redirect, usePathname } from "next/navigation";
import useProject from "@/hooks/use-project";

const items = [
  {
    title: "Dashboard",
    url: "/dashboard",
    icon: LayoutDashboard
  },
  {
    title: "Q&A",
    url: "/qa",
    icon: Bot
  },
  {
    title: "Meetings",
    url: "/meetings",
    icon: Presentation
  },
  {
    title: "Billing",
    url: "/billing",
    icon: CreditCard
  },
]


export default function AppSidebar() {
  const pathname = usePathname();
  const { open, setOpen } = useSidebar();  
  const { projects, projectId, setProjectId } = useProject();

  return (
    <Sidebar collapsible="icon" variant="floating">
      <SidebarHeader>
        <div className="relative flex items-center gap-2 w-full">
          <Image
            src="/logo.png"
            alt="logo"
            width={40}
            height={40}
            className="rounded-xl"
          />

          {open && (
            <h1 className="flex-1 text-xl font-bold text-primary/80">
              RepoGPT
            </h1>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setOpen(!open)}
            aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
            className={cn(
              open
                ? "ml-auto"
                : "absolute left-[130%] top-[120%] -translate-x-1/2 -translate-y-1/2 bg-gray-50 rounded-full shadow-md ring-1 ring-gray-200"
            )}
          >
            {open ? <LucideChevronLeft size={20} /> : <LucideChevronRight size={20} />}
          </Button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenu key={item.title}>
                  <SidebarMenuButton asChild>
                    <Link
                      href={item.url}
                      className={cn({
                        "!bg-primary !text-white": pathname === item.url,
                      })}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenu>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Your Projects</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {projects?.map((project, idx) => (
                <SidebarMenuItem key={idx}>
                  <SidebarMenuButton asChild>
                    <div
                      className="flex items-center gap-2 overflow-hidden w-full hover:cursor-pointer"
                      onClick={() => {
                        setProjectId(project.id)
                        redirect('/dashboard')
                      }}
                    >
                      <div
                        className={cn(
                          "rounded-sm border w-6 h-6 flex items-center justify-center text-sm shrink-0 text-blue-600",
                          { "bg-primary text-white": project.id === projectId }
                        )}
                      >
                        {project.name[0]}
                      </div>
                      {open && (
                        <div className="overflow-x-auto whitespace-nowrap max-w-[80%] scrollbar-none">
                          <div className="inline-block">{project.name}</div>
                        </div>
                      )}
                    </div>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}

              <div className="h-2" />

              <SidebarMenuItem>
                <Link href="/create">
                  <Button size="sm" variant="outline" className="w-full">
                    <Plus />
                    {open && "Create Project"}
                  </Button>
                </Link>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
