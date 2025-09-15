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
    <div
      style={{
        display: "flex",
        height: "100vh",
        minHeight: "100vh",
        width: "100%",
      }}
    >
      <div
        className={collapsed ? "" : "glass-sidebar"}
        style={{
          height: "100vh",
          display: "flex",
          background: collapsed ? "transparent" : undefined,
          backgroundColor: collapsed ? "transparent" : undefined,
          border: collapsed ? "none" : undefined,
        }}
      >
        <Sidebar
          collapsed={collapsed}
          collapsedWidth="0px"
          width="240px"
          rootStyles={{
            height: "100%",
            background: "transparent",
            backgroundColor: "transparent",
          }}
          style={{
            height: "100%",
            background: "transparent",
            backgroundColor: "transparent",
            border: "none",
          }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", height: "100%" }}
          >
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
            <div style={{ marginTop: "auto", padding: "12px" }}>
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
          <div className="p-[7px] glass-button rounded-3xl">
            <Image src={logo} width={23} height={23} alt="log-img" />
          </div>
        )}
        <div className="flex items-center gap-2 rounded-3xl glass-button">
          <Button
            variant="ghost"
            style={{ border: "none", boxShadow: "none", padding: 0 }}
            className="icon-btn"
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
                    style={{ border: "none", boxShadow: "none", padding: 0 }}
                    className="icon-btn"
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
