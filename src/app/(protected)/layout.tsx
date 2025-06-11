import { SidebarProvider } from "@/components/ui/sidebar";
import { UserButton } from "@clerk/nextjs";
import AppSidebar from "./app-sidebar";
import React from "react";
import { currentUser } from "@clerk/nextjs/server";

type Props = {
  children: React.ReactNode;
};

const SidebarLayout = async ({ children }: Props) => {
  const user = await currentUser();
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="m-2 w-full">
        <div className="border-sidebar-border bg-sidebar flex items-center gap-2 rounded-md border p-2 px-4 shadow">
          {/* <SearchBar /> */}
          <div className="ml-auto font-bold">{user?.firstName ?? "Guest"}</div>
          <UserButton />
        </div>
        <div className="h-4"></div>
        <div className="border-sidebar-border bg-sidebar h-[calc(100vh-6rem)] overflow-y-scroll rounded-md border p-4 shadow">
          {children}
        </div>
      </main>
    </SidebarProvider>
  );
};

export default SidebarLayout;
