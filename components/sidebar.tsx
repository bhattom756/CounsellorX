"use client";
import * as React from "react";
import { Sidebar, Menu, MenuItem } from "react-pro-sidebar";
import { Button } from "./ui/button";
import { PanelLeft, CircleFadingPlus, Ellipsis } from "lucide-react";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useUser } from "@/context/UserContext";
import { LogOut, HelpCircle, Settings as SettingsIcon, Wand2, Sparkles, ChevronRight, Bell, Plug, Database, Shield, User as UserIcon, ChevronDown, Play } from "lucide-react";
import { DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from "@/components/ui/dropdown-menu";

const Sdebar = () => {
  const [collapsed, setCollapsed] = React.useState(true);
  const [accountOpen, setAccountOpen] = React.useState(false);
  const [activeAccountTab, setActiveAccountTab] = React.useState<"profile" | "password" | "billing" | "team" | "subscription" | "settings">("profile");
  const { user, logout } = useUser();
  const [theme, setTheme] = React.useState<"light" | "dark">("light");
  const [language, setLanguage] = React.useState<string>("English");

  React.useEffect(() => {
    // initialize from storage
    const savedTheme = (typeof window !== 'undefined' && (localStorage.getItem("theme") as "light" | "dark" | null)) || null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    }
    const savedLang = typeof window !== 'undefined' && localStorage.getItem("language");
    if (savedLang) setLanguage(savedLang);
  }, []);

  const applyTheme = (next: "light" | "dark") => {
    setTheme(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem("theme", next);
      document.documentElement.classList.toggle("dark", next === "dark");
    }
  };

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
                <DropdownMenuContent className="w-[260px] p-2 rounded-xl border border-black/10 bg-white/60 backdrop-blur-md shadow-xl text-gray-800">
                  <DropdownMenuLabel>
                    <div className="flex items-center gap-2 text-gray-900">
                      <RxAvatar size={18} />
                      <span className="truncate text-sm">{user?.email || "Guest"}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="rounded-lg px-3 py-2 hover:bg-black/5 transition-colors">
                    <Sparkles className="size-4" /> Upgrade plan
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg px-3 py-2 hover:bg-black/5 transition-colors">
                    <Wand2 className="size-4" /> Personalization
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg px-3 py-2 hover:bg-black/5 transition-colors" onClick={() => { setActiveAccountTab("settings"); setAccountOpen(true); }}>
                    <SettingsIcon className="size-4" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger className="rounded-lg px-3 py-2">
                      <HelpCircle className="size-4" /> Help
                    </DropdownMenuSubTrigger>
                    <DropdownMenuSubContent className="w-48">
                      <DropdownMenuItem>Documentation</DropdownMenuItem>
                      <DropdownMenuItem>Contact support</DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  <DropdownMenuItem className="rounded-lg px-3 py-2 hover:bg-black/5 transition-colors" onClick={() => logout()}>
                    <LogOut className="size-4" /> Log out
                  </DropdownMenuItem>
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
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-transparent transition-colors duration-150 hover:bg-blue-100 active:scale-95"
                  aria-label={collapsed ? "Open sidebar" : "Close sidebar"}
                  onClick={() => setCollapsed(!collapsed)}
                >
                  <PanelLeft size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent
                className="tooltip-no-arrow border border-white/10 rounded-full bg-gray-700 text-white px-3 py-1 text-[10px] mt-1 shadow-lg"
                side="bottom"
                align="center"
              >
                {collapsed ? "Open sidebar" : "Close sidebar"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
                  className="tooltip-no-arrow border border-white/10 rounded-full bg-gray-700 text-white px-3 py-1 text-[10px] mt-1 shadow-lg"
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

      {/* Account Dialog with Tabs */}
      <Dialog open={accountOpen} onOpenChange={setAccountOpen}>
        <DialogContent className="sm:max-w-xl bg-white/50 backdrop-blur-lg border border-white/30 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg">My Account</DialogTitle>
          </DialogHeader>
          <Tabs value={activeAccountTab} onValueChange={(v:any) => setActiveAccountTab(v)} className="w-full">
            {/* TabsList intentionally hidden in modal to show only selected content */}
            <TabsContent value="settings" className="mt-1">
              <div className="rounded-xl border border-white/20 bg-neutral-900/95 text-white overflow-hidden">
                <div className="flex">
                  {/* Left nav */}
                  <div className="w-56 bg-neutral-900/80 border-r border-white/10 p-2 space-y-1">
                    <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md bg-white/10 text-white">
                      <SettingsIcon className="size-4" /> <span className="text-sm">General</span>
                    </button>
                    <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/5">
                      <Bell className="size-4 text-gray-300" /> <span className="text-sm text-gray-200">Notifications</span>
                    </button>
                    <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/5">
                      <Wand2 className="size-4 text-gray-300" /> <span className="text-sm text-gray-200">Personalization</span>
                    </button>
                    <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/5">
                      <Plug className="size-4 text-gray-300" /> <span className="text-sm text-gray-200">Connected apps</span>
                    </button>
                    <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/5">
                      <Database className="size-4 text-gray-300" /> <span className="text-sm text-gray-200">Data controls</span>
                    </button>
                    <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/5">
                      <Shield className="size-4 text-gray-300" /> <span className="text-sm text-gray-200">Security</span>
                    </button>
                    <button className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-white/5">
                      <UserIcon className="size-4 text-gray-300" /> <span className="text-sm text-gray-200">Account</span>
                    </button>
                  </div>
                  {/* Right content */}
                  <div className="flex-1 p-5 ">
                    <h2 className="text-xl font-semibold">General</h2>
                    <div className="mt-3 border-t border-white/10" />

                    <div className="divide-y divide-white/10 mt-2">
                      {/* Theme */}
                      <div className="py-4 flex items-center justify-between">
                        <div className="text-sm text-gray-300">Theme</div>
                        <div className="inline-flex items-center gap-2 bg-white/5 rounded-md p-1">
                          <button
                            className={`px-3 py-1 rounded-sm text-sm ${theme === 'light' ? 'bg-white text-black' : 'text-gray-200 hover:bg-white/10'}`}
                            onClick={() => applyTheme('light')}
                          >
                            Light
                          </button>
                          <button
                            className={`px-3 py-1 rounded-sm text-sm ${theme === 'dark' ? 'bg-white text-black' : 'text-gray-200 hover:bg-white/10'}`}
                            onClick={() => applyTheme('dark')}
                          >
                            Dark
                          </button>
                        </div>
                      </div>
                      {/* Accent color (static placeholder) */}
                      <div className="py-4 flex items-center justify-between">
                        <div className="text-sm text-gray-300">Accent color</div>
                        <button className="inline-flex items-center gap-2 px-2 py-1 rounded-md hover:bg-white/5 text-sm text-gray-200">
                          • Default <ChevronDown className="size-4" />
                        </button>
                      </div>
                      {/* Language */}
                      <div className="py-4 flex items-center justify-between">
                        <div className="text-sm text-gray-300">Language</div>
                        <div className="inline-flex items-center gap-2">
                          <select
                            value={language}
                            onChange={(e) => { setLanguage(e.target.value); if (typeof window !== 'undefined') localStorage.setItem('language', e.target.value); }}
                            className="bg-transparent border border-white/10 rounded-md px-2 py-1 text-sm text-gray-200 hover:bg-white/5"
                          >
                            <option className="text-black" value="English">English</option>
                            <option className="text-black" value="Hindi">Hindi</option>
                            <option className="text-black" value="Spanish">Spanish</option>
                          </select>
                        </div>
                      </div>
                      {/* Removed Spoken language and Voice per request */}
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="profile" className="mt-1">
              <div className="rounded-xl border border-white/40 bg-white/60 backdrop-blur-md p-5 text-gray-900 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Account</h3>
                  <p className="text-sm text-gray-700 mt-1">Make changes to your account here. Click save when you're done.</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="account-name" className="text-sm">Name</Label>
                  <Input id="account-name" placeholder="Pedro Duarte" defaultValue="Pedro Duarte" className="h-10 bg-white/80 border-gray-200 text-gray-900 placeholder:text-gray-500" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="account-username" className="text-sm">Username</Label>
                  <Input id="account-username" placeholder="@peduarte" defaultValue="@peduarte" className="h-10 bg-white/80 border-gray-200 text-gray-900 placeholder:text-gray-500" />
                </div>
                <Button className="bg-blue-600 text-white hover:bg-blue-700">Save changes</Button>
              </div>
            </TabsContent>
            <TabsContent value="billing" className="mt-1">
              <div className="rounded-xl border border-white/40 bg-white/60 backdrop-blur-md p-4 text-sm text-gray-800">Billing details go here.</div>
            </TabsContent>
            <TabsContent value="password" className="mt-1">
              <div className="rounded-xl border border-white/40 bg-white/60 backdrop-blur-md p-5 text-gray-900 space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Password</h3>
                  <p className="text-sm text-gray-700 mt-1">Change your password here. After saving, you\'ll be logged out.</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="current-password" className="text-sm">Current password</Label>
                  <Input id="current-password" type="password" placeholder="Current password" className="h-10 bg-white/80 border-gray-200 text-gray-900 placeholder:text-gray-500" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="new-password" className="text-sm">New password</Label>
                  <Input id="new-password" type="password" placeholder="New password" className="h-10 bg-white/80 border-gray-200 text-gray-900 placeholder:text-gray-500" />
                </div>
                <Button className="bg-blue-600 text-white hover:bg-blue-700">Save password</Button>
              </div>
            </TabsContent>
            <TabsContent value="team" className="mt-1">
              <div className="rounded-xl border border-white/40 bg-white/60 backdrop-blur-md p-4 text-sm text-gray-800">Team management goes here.</div>
            </TabsContent>
            <TabsContent value="subscription" className="mt-1">
              <div className="rounded-xl border border-white/40 bg-white/60 backdrop-blur-md p-4 text-sm text-gray-800">Subscription plan info goes here.</div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sdebar;
