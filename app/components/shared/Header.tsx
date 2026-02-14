import { Link, useLocation, useNavigate } from "@remix-run/react";
import { cn } from "~/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "~/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "~/components/ui/accordion";
import {
  Analyst_Routes,
  Super_Admin_Routes,
  Admin_Routes,
} from "~/components/shared/Sidebar";
import {
  ChevronDown,
  Menu,
  Wallet,
  ReceiptText,
  Settings,
  LogOut,
  UserRoundPen,
  UsersRound,
  Settings2Icon,
} from "lucide-react";
import logo from "~/assets/images/new-logo.png";
import { removeCookie } from "typescript-cookie";
import Notifications from "./notifications";

interface HeaderProps {
  isAdmin?: boolean;
  isSuperAdmin?: boolean;
  userName: string;
  role: string;
}

const Header = ({ isAdmin, isSuperAdmin, userName, role }: HeaderProps) => {
  const pathname = useLocation().pathname;
  const navigate = useNavigate();

  const ROUTES =
    role === "admin" ? [...Analyst_Routes, ...Admin_Routes] : Analyst_Routes;

  return (
    <div className="w-full py-5 flex items-center sm:justify-end justify-between">
      {/* Sidebar for Mobile View */}
      <div className="block sm:hidden">
        <Sheet>
          <SheetTrigger>
            <Menu className="text-black" />
          </SheetTrigger>
          <SheetContent
            side="left"
            className="bg-Black flex flex-col border-none overflow-y-auto"
          >
            <SheetHeader>
              <div className="flex items-center gap-x-2">
                <img src={logo} alt="logo" className="w-40" />
                {/* <h1 className="text-3xl font-semibold text-white">Kastor</h1> */}
              </div>
            </SheetHeader>
            <div className="flex-1 flex flex-col mt-5">
              {isAdmin
                ? Admin_Routes.map((route) => (
                    <SheetClose asChild key={route.id}>
                      <Link
                        to={route.id}
                        className={cn(
                          "flex items-center p-3 text-base font-medium text-darkGray hover:text-white",
                          pathname.includes(route.id) && "text-white"
                        )}
                      >
                        {route.icon}
                        <span className="ml-2">{route.name}</span>
                      </Link>
                    </SheetClose>
                  ))
                : isSuperAdmin
                ? Super_Admin_Routes.map((route) => (
                    <SheetClose asChild key={route.id}>
                      <Link
                        to={route.id}
                        className={cn(
                          "flex items-center p-3 text-base font-medium text-darkGray hover:text-white",
                          pathname.includes(route.id) && "text-white"
                        )}
                      >
                        {route.icon}
                        <span className="ml-2">{route.name}</span>
                      </Link>
                    </SheetClose>
                  ))
                : ROUTES.map((route) =>
                    route.childrens ? (
                      <Accordion key={route.name} type="single" collapsible>
                        <AccordionItem
                          value={route.name}
                          className={cn(
                            "border-none p-3 text-base font-medium text-darkGray hover:text-white",
                            pathname.includes(route.id) && "text-white"
                          )}
                        >
                          <AccordionTrigger className="py-3 hover:no-underline">
                            <Link to={route.id} className="flex items-center">
                              {route.icon}
                              <span className="ml-2">{route.name}</span>
                            </Link>
                          </AccordionTrigger>
                          <AccordionContent>
                            {route?.childrens?.map((child) => (
                              <Link
                                key={child.id}
                                to={child.id}
                                className={cn(
                                  "flex items-center p-3 text-base font-medium text-darkGray hover:text-white",
                                  pathname.includes(child.id) && "text-white"
                                )}
                              >
                                <span className="ml-2">{child.name}</span>
                              </Link>
                            ))}
                          </AccordionContent>
                        </AccordionItem>
                      </Accordion>
                    ) : (
                      <SheetClose asChild key={route.id}>
                        <Link
                          to={route.id}
                          className={cn(
                            "flex items-center p-3 text-base font-medium text-darkGray hover:text-white",
                            pathname.includes(route.id) && "text-white"
                          )}
                        >
                          {route.icon}
                          <span className="ml-2">{route.name}</span>
                        </Link>
                      </SheetClose>
                    )
                  )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <div className="flex items-center gap-x-3">
        <Notifications />
        <DropdownMenu>
          <DropdownMenuTrigger className="h-[60px] border border-Stroke w-fit rounded-[26px] flex items-center gap-x-2 p-4">
            <div className="text-left">
              <h2 className="text-sm font-medium text-Black uppercase">
                {userName}
              </h2>
              <h3 className="text-[10px] font-medium text-darkGray">
                {role?.charAt(0).toUpperCase() + role.slice(1)}
              </h3>
            </div>
            <ChevronDown
              size={20}
              className="data-[state=open]:rotate-180 data-[state=close]:rotate-0 transition duration-300 ease-in-out"
            />
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {role !== "super-admin" && (
              <>
                <Link to="/catalog/administration">
                  <DropdownMenuItem>
                    <Settings size={18} className="mr-2" />
                    Administration
                  </DropdownMenuItem>
                </Link>
                <Link to="/catalog/administration">
                  <DropdownMenuItem>
                    <Settings2Icon  size={18} className="mr-2" />
                    Config
                  </DropdownMenuItem>
                </Link>


                {!isAdmin && (
                  <>
                    <Link to="/subscription">
                      <DropdownMenuItem>
                        <Wallet size={18} className="mr-2" />
                        Subscription
                      </DropdownMenuItem>
                    </Link>
                    <Link to="/billing">
                      <DropdownMenuItem>
                        <ReceiptText size={18} className="mr-2" />
                        Billing
                      </DropdownMenuItem>
                    </Link>
                    <Link to="/users">
                      <DropdownMenuItem>
                        <UsersRound size={18} className="mr-2" />
                        Users
                      </DropdownMenuItem>
                    </Link>
                  </>
                )}
              </>
            )}

            <DropdownMenuSeparator />
            <Link
              to={
                role === "super-admin"
                  ? "/super-admin/profile"
                  : "/profile"
              }
            >
              <DropdownMenuItem>
                <UserRoundPen size={18} className="mr-2" />
                Profile
              </DropdownMenuItem>
            </Link>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={async () => {
                await removeCookie("idToken");
                navigate("/", { replace: true });
              }}
            >
              <LogOut size={18} className="mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default Header;
