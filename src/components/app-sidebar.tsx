import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Home, Table, Vault, AlignLeft } from "lucide-react";
import { NavMain } from "./nav-menu";
import { NavUser } from "./nav-user";

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: Home,
    },
    {
      title: "Mesas",
      url: "/tables",
      icon: Table,
    },
    {
      title: "Products",
      url: "/products",
      icon: Vault,
    },
    {
      title: "Categories",
      url: "/categories",
      icon: AlignLeft,
    },
    /*{
    title: "Settings",
    url: "#",
    icon: Settings,
  },*/
  ],
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
