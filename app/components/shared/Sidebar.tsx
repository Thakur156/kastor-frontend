/* eslint-disable jsx-a11y/no-autofocus */
import { Link, useLocation } from "@remix-run/react";
import {
  Database,
  Home,
  LayoutDashboard,
  LayoutPanelLeft,
  ReceiptText,
  ScanSearch,
  Settings,
  Share2,
  User2,
  Wallet,
  MessageCircleMore,
} from "lucide-react";
import { useState } from "react";

import logo from "~/assets/images/new-logo.png";
import logoIcon from "~/assets/images/logo-icon.svg";
import { cn } from "~/lib/utils";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";

interface Route {
  id: string;
  name: string;
  icon: JSX.Element;
  childrens?: { id: string; name: string }[];
}

export const Analyst_Routes: Route[] = [
  {
    id: "/home",
    name: "Home",
    icon: <Home size={20} />,
  },
  {
    id: "/query",
    name: "Query",
    icon: <ScanSearch size={20} />,
    childrens: [
      {
        id: "/query/saved-queries",
        name: "Saved Queries",
      },
    ],
  },

  {
    id: "/catalog",
    name: "Catalogs",
    icon: <LayoutDashboard size={20} />,
  },
  {
    id: "/sources",
    name: "Sources",
    icon: <Database size={20} />,
  },
  {
    id: "/chat",
    name: "Chat",
    icon: <MessageCircleMore size={20} />,
  },
];

export const Admin_Routes: Route[] = [
  // {
  //   id: "/users",
  //   name: "Users",
  //   icon: <User2 size={20} />,
  // },
  {
    id: "/catalog-management",
    name: "Catalogs Management",
    icon: <LayoutPanelLeft size={20} />,
  },
  // {
  //   id: "/subscription",
  //   name: "Subscription",
  //   icon: <Wallet size={20} />,
  // },
  // {
  //   id: "/billing",
  //   name: "Billing",
  //   icon: <ReceiptText size={20} />,
  // },
];

export const Super_Admin_Routes = [
  {
    id: "/super-admin/home",
    name: "Home",
    icon: <Home size={20} />,
  },
  {
    id: "/super-admin/subscription",
    name: "Subscription",
    icon: <Wallet size={20} />,
  },
  {
    id: "/super-admin/connections",
    name: "Connections",
    icon: <Share2 size={20} />,
  },
  {
    id: "/super-admin/settings",
    name: "Settings",
    icon: <Settings size={20} />,
  },
];

interface SidebarProps {
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  role: string;
}

const Sidebar = ({ isAdmin, isSuperAdmin, role }: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(true);
  const pathname = useLocation().pathname;

  const Routes =
    role === "admin" ? [...Analyst_Routes, ...Admin_Routes] : Analyst_Routes;

  return (
    <>
      <div className="w-[83px] h-full  flex-col bg-Black rounded-2xl hidden sm:flex">
        <div
          className={cn(
            "bg-black h-full flex flex-col w-[280px] p-7 overflow-y-auto overflow-x-hidden absolute transition-[width] duration-500 ease-in-out z-50",
            collapsed && "px-0 py-5 w-[83px] items-center"
          )}
          onMouseOver={() => setCollapsed(false)}
          onMouseLeave={() => setCollapsed(true)}
        >
          <div className="flex items-center gap-x-2">
            {collapsed ? (
              <img src={logoIcon} alt="logo" className="w-12" />
            ) : (
              <img src={logo} alt="logo" className="w-40" />
            )}
          </div>
          {isAdmin ? (
            <div className="flex-1 flex flex-col items-center mt-5 w-full ">
              {Admin_Routes.map((route) => (
                <div
                  key={route.id}
                  className={cn(
                    "w-full flex justify-between mb-4",
                    !collapsed && "justify-start",
                    collapsed && "pl-5"
                  )}
                >
                  <Link
                    key={route.id}
                    to={route.id}
                    className={cn(
                      "w-fit flex items-center rounded-md p-3 text-base font-medium text-darkGray hover:text-white",
                      pathname === route.id && "text-white",
                      pathname === route.id && collapsed && "bg-[#48484A]"
                    )}
                  >
                    {route.icon}
                    <span className={cn("ml-2 hidden", !collapsed && "block")}>
                      {route.name}
                    </span>
                  </Link>

                  <div
                    className={cn(
                      "w-[6px] rounded-s-[20px]",
                      pathname == route.id && collapsed && "bg-Blue"
                    )}
                  ></div>
                </div>
              ))}
            </div>
          ) : isSuperAdmin ? (
            <div
              className={cn(
                "flex-1 flex-col items-center mt-12 space-y-4",
                !collapsed && "items-start"
              )}
            >
              {Super_Admin_Routes.map((route) => (
                <Link
                  key={route.id}
                  to={route.id}
                  className={cn(
                    "w-full flex justify-center items-center p-3 text-base font-medium text-darkGray hover:text-white",
                    pathname.includes(route.id) && "text-white ",
                    !collapsed && "justify-start"
                  )}
                >
                  {route.icon}
                  <span className={cn("ml-2 hidden", !collapsed && "block")}>
                    {route.name}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div
              className={cn(
                "flex-1 flex-col items-center mt-12 space-y-4",
                !collapsed && "items-start"
              )}
              key={Date.now()}
            >
              {Routes.map((route) => {
                return route?.childrens ? (
                  <Accordion key={route.id} type="single" collapsible>
                    <AccordionItem
                      value={route.name}
                      className={cn(
                        "border-none  px-3 text-base font-medium text-darkGray hover:text-white w-full",
                        pathname == route.id && "text-white ",
                        !collapsed && "items-start"
                      )}
                    >
                      <AccordionTrigger
                        iconClass={collapsed ? "hidden" : "block"}
                        className="py-3 hover:no-underline outline-none"
                        tabIndex={-1}
                      >
                        <Link to={route.id} className="flex items-center">
                          {route.icon}
                          <span
                            className={cn("ml-2 hidden", !collapsed && "block")}
                          >
                            {route.name}
                          </span>
                        </Link>
                      </AccordionTrigger>
                      <AccordionContent
                        className={collapsed ? "hidden" : "block"}
                      >
                        {route?.childrens?.map((child) => (
                          <Link
                            key={child.id}
                            to={child.id}
                            className={cn(
                              "flex items-center p-3 text-base font-medium text-darkGray hover:text-white",
                              pathname == child.id && "text-white "
                            )}
                          >
                            <span
                              className={cn(
                                "ml-2 hidden",
                                !collapsed && "block"
                              )}
                            >
                              {child.name}
                            </span>
                          </Link>
                        ))}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ) : (
                  <Link
                    key={route.id}
                    to={route.id}
                    className={cn(
                      "w-full flex justify-center items-center p-3 text-base font-medium text-darkGray hover:text-white",
                      pathname == route.id && "text-white ",
                      !collapsed && "justify-start"
                    )}
                  >
                    {route.icon}
                    <span className={cn("ml-2 hidden", !collapsed && "block")}>
                      {route.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
