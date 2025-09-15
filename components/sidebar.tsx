"use client";
import * as React from "react";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Button } from "./ui/button";
import {
  ArrowLeftToLine,
  ArrowRightToLine,
  CircleFadingPlus,
  Ellipsis,
} from "lucide-react";
import Image from "next/image";
import logo from "public/logo.png";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { RxAvatar } from "react-icons/rx";

const Sdebar = () => {
  const [collapsed, setCollapsed] = React.useState(true);

  return (
    <div className="flex h-screen min-h-screen w-full">
      <div className={`h-screen flex  ${collapsed ? "bg-transparent" : ""}`}>
        <Sidebar
          collapsed={collapsed}
          collapsedWidth="0px"
          width="240px"
        >
          <div className="flex flex-col h-full">
            <div className="flex justify-center p-3 pt-3 gap-3">
              <Image src={logo} width={25} height={23} alt="log-img" />
              {!collapsed && (
                <span className="text-md text-xl font-bold text-blue-800">
                  CouncellorX
                </span>
              )}
            </div>
            <Menu>
              {!collapsed && (
                <div className="flex justify-center mt-5">
                  <Button className="w-[12rem] text-md bg-white border-1 border-white rounded-xl">
                    <CircleFadingPlus size={20} /> New Chat
                  </Button>
                </div>
              )}
              {!collapsed && (
                <MenuItem className="flex justify-center"></MenuItem>
              )}
              {!collapsed && (
                <>
                  <Label
                    htmlFor="chat"
                    className="text-md font-medium mx-[18px]  "
                  >
                    Chat History
                  </Label>
                  <MenuItem>1. Searched for zyxzjjkhkhjkjhh</MenuItem>
                  <MenuItem>2. Fix code bug for zyxzjjkhkhjkjhh</MenuItem>
                </>
              )}
            </Menu>
            <div className="mt-auto p-3">
              <DropdownMenu >
                <DropdownMenuTrigger className="w-full bg-white p-2 border-1 border-white
                 rounded-3xl">
                  <div className="flex items-center justify-between w-full gap-3">
                    <div className="flex items-center gap-2 font-semibold px-1">
                      <RxAvatar size={25} /> <span>My Account</span>
                    </div>
                    <Ellipsis size={23} />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-57 text-gray-800 ">
                   <DropdownMenuLabel><p className="font-semibold">My Account</p></DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Billing</DropdownMenuItem>
                  <DropdownMenuItem>Team</DropdownMenuItem>
                  <DropdownMenuItem>Subscription</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </Sidebar>
      </div>
      <main className="flex-1 p-2 flex items-start gap-2 ">
        {collapsed && (
          <div className="p-[7px] rounded-3xl border border-white/30 backdrop-blur-[11px] relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.1),_inset_0_1px_0_rgba(255,255,255,0.5),_inset_0_-1px_0_rgba(255,255,255,0.1),_inset_0_0_20px_10px_rgba(255,255,255,1)]">
            <Image src={logo} width={23} height={23} alt="log-img" />
          </div>
        )}
        <div className="main-container flex items-center gap-2 rounded-3xl border border-white/30 backdrop-blur-[11px] relative overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.1),_inset_0_1px_0_rgba(255,255,255,0.5),_inset_0_-1px_0_rgba(255,255,255,0.1),_inset_0_0_20px_10px_rgba(255,255,255,1)]">
          <Button
            variant="ghost"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-transparent transition-colors duration-150 hover:bg-blue-100 active:scale-95"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? (
              <ArrowRightToLine size={18} />
            ) : (
              <ArrowLeftToLine size={18} />
            )}
          </Button>
          {collapsed && (
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-transparent transition-colors duration-150 hover:bg-blue-100 active:scale-95"
                    aria-label="New chat"
                  >
                    <CircleFadingPlus size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent
                  className="border-0"
                  side="bottom"
                  align="center"
                >
                  New chat
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </main>
    </div>
  );
};

export default Sdebar;
