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
import { MdDeleteOutline } from "react-icons/md";
import { useChat, formatRelativeTime } from "@/context/ChatContext";
import toast from "react-hot-toast";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useUser } from "@/context/UserContext";
import { LogOut, HelpCircle, Settings as SettingsIcon, Wand2, Sparkles, ChevronRight, Bell, Plug, Database, Shield, User as UserIcon, ChevronDown, Play } from "lucide-react";
import { DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger } from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { auth, db } from "@/lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { EmailAuthProvider, reauthenticateWithCredential, updatePassword } from "firebase/auth";
import { collection, getDocs, deleteDoc } from "firebase/firestore";

const Sdebar = () => {
  const { sessions, newSession, loadSession, currentSessionId } = useChat();
  const [collapsed, setCollapsed] = React.useState(true);
  const [accountOpen, setAccountOpen] = React.useState(false);
  const [activeAccountTab, setActiveAccountTab] = React.useState<
    "upgrade" | "personalization" | "settings" | "help" | "profile" | "password" | "billing" | "team" | "subscription"
  >("settings");
  const { user, logout } = useUser();
  const router = useRouter();
  const [theme, setTheme] = React.useState<"light" | "dark">("light");
  const [language, setLanguage] = React.useState<string>("English");
  const [settingsSection, setSettingsSection] = React.useState<
    "general" | "notifications" | "connected" | "data" | "security" | "account"
  >("general");
  const [currentPwd, setCurrentPwd] = React.useState("");
  const [newPwd, setNewPwd] = React.useState("");
  const [confirmPwd, setConfirmPwd] = React.useState("");
  const [isChangingPwd, setIsChangingPwd] = React.useState(false);
  const [editUsername, setEditUsername] = React.useState<string>("");
  const [isSavingUsername, setIsSavingUsername] = React.useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [sessionToDelete, setSessionToDelete] = React.useState<string | null>(null);

  React.useEffect(() => {
    setEditUsername(user?.displayName || "");
  }, [user]);

  const handleChangePassword = async () => {
    try {
      if (!user?.email) {
        toast.error("You must be signed in to change password");
        return;
      }
      if (!currentPwd || !newPwd || !confirmPwd) {
        toast.error("Fill all password fields");
        return;
      }
      if (newPwd !== confirmPwd) {
        toast.error("New passwords do not match");
        return;
      }
      if (newPwd.length < 6) {
        toast.error("Password must be at least 6 characters");
        return;
      }
      if (!auth.currentUser) {
        toast.error("No authenticated user");
        return;
      }
      setIsChangingPwd(true);
      toast.loading("Updating password...", { id: "pwd" });
      // Reauthenticate
      const cred = EmailAuthProvider.credential(user.email, currentPwd);
      await reauthenticateWithCredential(auth.currentUser, cred);
      // Update
      await updatePassword(auth.currentUser, newPwd);
      toast.success("Password updated. Redirecting to login...", { id: "pwd" });
      await logout();
      router.push("/login");
    } catch (e: any) {
      console.error(e);
      toast.error(e?.message || "Failed to update password", { id: "pwd" });
    } finally {
      setIsChangingPwd(false);
    }
  };

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
    <div className="flex min-h-screen w-full">
      <div className={`min-h-full h-full flex  ${collapsed ? "bg-transparent" : ""}`}>
        <Sidebar
          collapsed={collapsed}
          collapsedWidth="0px"
          width="240px"
          rootStyles={{ height: "100vh" }}
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
            <div className="flex-1 overflow-y-auto">
            <Menu>
              {!collapsed && (
                <div className="flex justify-center mt-5">
                  <Button className="w-[12rem] text-md bg-white border-1 border-white rounded-xl transition-colors duration-150 hover:bg-blue-50 hover:border-blue-200 active:scale-95" onClick={async () => {
                    const id = await newSession();
                    if (id) {
                      toast.success("Started new chat");
                    }
                  }}>
                    <CircleFadingPlus size={20} /> New Chat
                  </Button>
                </div>
              )}
              {!collapsed && (
                <div className="mt-8">
                  <Label
                    htmlFor="chat"
                    className="text-md font-medium mx-[18px]  "
                  >
                    Chat History
                  </Label>
                  {sessions.length === 0 && (
                    <MenuItem className="text-gray-500">No chats yet</MenuItem>
                  )}
                  {sessions.map((s, i) => (
                    <MenuItem key={s.id} className={currentSessionId === s.id ? "font-semibold" : ""}>
                      <div className="w-full flex items-center justify-between gap-2" onClick={() => { loadSession(s.id); }}>
                        <div>
                          {i + 1}. {s.title}
                          <div className="text-xs text-gray-500">{formatRelativeTime(s.updatedAt || s.createdAt)}</div>
                        </div>
                        <button
                          className="p-1 rounded hover:bg-red-50"
                          onClick={(e) => { e.stopPropagation(); setSessionToDelete(s.id); setDeleteDialogOpen(true); }}
                          aria-label="Delete chat"
                          title="Delete chat"
                        >
                          <MdDeleteOutline size={18} className="text-red-600" />
                        </button>
                      </div>
                    </MenuItem>
                  ))}
                </div>
              )}
            </Menu>
            </div>
            <div className="mt-auto p-3">
              <DropdownMenu >
                <DropdownMenuTrigger className="w-full bg-white p-2 border-1 border-white
                 rounded-3xl">
                  <div className="flex items-center justify-between w-full gap-3">
                    <div className="flex items-center gap-2 font-semibold px-1">
                      <RxAvatar size={25} /> <span>{user?.displayName || user?.email || "Guest"}</span>
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
                  <DropdownMenuItem className="rounded-lg px-3 py-2 hover:bg-black/5 transition-colors" onClick={() => { setActiveAccountTab("upgrade"); setAccountOpen(true); }}>
                    <Sparkles className="size-4" /> Upgrade plan
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg px-3 py-2 hover:bg-black/5 transition-colors" onClick={() => { setActiveAccountTab("personalization"); setAccountOpen(true); }}>
                    <Wand2 className="size-4" /> Personalization
                  </DropdownMenuItem>
                  <DropdownMenuItem className="rounded-lg px-3 py-2 hover:bg-black/5 transition-colors" onClick={() => { setActiveAccountTab("settings"); setAccountOpen(true); }}>
                    <SettingsIcon className="size-4" /> Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="rounded-lg px-3 py-2 hover:bg-black/5 transition-colors" onClick={() => { setActiveAccountTab("help"); setAccountOpen(true); }}>
                      <HelpCircle className="size-4" /> Help
                  </DropdownMenuItem>
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
                    className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-transparent transition-all duration-150 hover:bg-blue-100 hover:scale-105 active:scale-95"
                    aria-label="New chat"
                    onClick={async () => { const id = await newSession(); if (id) toast.success("Started new chat"); }}
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
        <div className="main-container flex items-center justify-center">  <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  className="inline-flex items-center justify-center w-20 h-9 rounded-full bg-transparent transition-colors duration-150 hover:bg-blue-100 active:scale-95"
                  aria-label="Lawyers Page"
                  onClick={() => router.push("/lawyers")}
                >
                  Lawyers
                </Button>
              </TooltipTrigger>
              <TooltipContent
                className="tooltip-no-arrow border border-white/10 rounded-full bg-gray-700 text-white px-3 py-1 text-[10px] mt-1 shadow-lg"
                side="bottom"
                align="center"
              >
                {collapsed ? "Lawyers Page" : "Lawyers Page"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider></div>
      </main>

      {/* Account Dialog with Tabs */}
      <Dialog open={accountOpen} onOpenChange={setAccountOpen}>
        <DialogContent className="sm:max-w-3xl md:max-w-5xl bg-white/50 backdrop-blur-lg border border-white/30 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg">My Account</DialogTitle>
            <DialogDescription>Manage your plan, personalization, settings and help.</DialogDescription>
          </DialogHeader>
          <Tabs value={activeAccountTab} onValueChange={(v:any) => setActiveAccountTab(v)} className="w-full">
            {activeAccountTab !== "settings" && (
            <TabsList className="mb-3 bg-white/10 backdrop-blur rounded-lg p-1 inline-flex gap-1">
              <TabsTrigger value="upgrade" className="px-3 py-1 rounded-md text-sm transition-all duration-150 hover:bg-white/20 data-[state=active]:bg-white data-[state=active]:text-black">
                Upgrade plan
              </TabsTrigger>
              <TabsTrigger value="personalization" className="px-3 py-1 rounded-md text-sm transition-all duration-150 hover:bg-white/20 data-[state=active]:bg-white data-[state=active]:text-black">
                Personalization
              </TabsTrigger>
              <TabsTrigger value="help" className="px-3 py-1 rounded-md text-sm transition-all duration-150 hover:bg-white/20 data-[state=active]:bg-white data-[state=active]:text-black">
                Help
              </TabsTrigger>
            </TabsList>
            )}

            <TabsContent value="upgrade" className="mt-1 transition-opacity duration-150 data-[state=inactive]:opacity-0 data-[state=active]:opacity-100">
              <div className="main-container p-5 text-gray-900 space-y-4">
                <h3 className="text-lg font-semibold">Choose your plan</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button className="rounded-lg border border-gray-200 p-4 text-left hover:shadow-md hover:scale-[1.01] transition-all duration-150">
                    <div className="font-medium">Pro</div>
                    <div className="text-sm text-gray-600">Unlimited chats, priority support</div>
                  </button>
                  <button className="rounded-lg border border-gray-200 p-4 text-left hover:shadow-md hover:scale-[1.01] transition-all duration-150">
                    <div className="font-medium">Team</div>
                    <div className="text-sm text-gray-600">Share sessions, admin controls</div>
                  </button>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all">Upgrade</button>
                  <button className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 active:scale-95 transition-all">Maybe later</button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="personalization" className="mt-1 transition-opacity duration-150 data-[state=inactive]:opacity-0 data-[state=active]:opacity-100">
              <div className="main-container p-5 text-gray-900 space-y-4">
                <h3 className="text-lg font-semibold">Personalization</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Conciseness</span>
                    <input type="range" className="accent-blue-600 cursor-pointer" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Tone</span>
                    <select className="border rounded-md px-2 py-1 text-sm hover:shadow-sm transition">
                      <option>Neutral</option>
                      <option>Friendly</option>
                      <option>Formal</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all">Save</button>
                  <button className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-50 active:scale-95 transition-all">Reset</button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="mt-1 transition-opacity duration-150 data-[state=inactive]:opacity-0 data-[state=active]:opacity-100">
              <div className="main-container p-3">
                <div className="flex">
                  {/* Left nav */}
                  <div className="w-56 p-2 space-y-1">
                    <button onClick={() => setSettingsSection('general')} className={`w-full flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${settingsSection==='general' ? 'bg-white/80 text-gray-900' : 'hover:bg-white/40 text-gray-800'}`}>
                      <SettingsIcon className="size-4" /> <span className="text-sm">General</span>
                    </button>
                    <button onClick={() => setSettingsSection('notifications')} className={`w-full flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${settingsSection==='notifications' ? 'bg-white/80 text-gray-900' : 'hover:bg-white/40 text-gray-800'}`}>
                      <Bell className="size-4" /> <span className="text-sm">Notifications</span>
                    </button>
                    <button onClick={() => setSettingsSection('connected')} className={`w-full flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${settingsSection==='connected' ? 'bg-white/80 text-gray-900' : 'hover:bg-white/40 text-gray-800'}`}>
                      <Plug className="size-4" /> <span className="text-sm">Connected apps</span>
                    </button>
                    <button onClick={() => setSettingsSection('data')} className={`w-full flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${settingsSection==='data' ? 'bg-white/80 text-gray-900' : 'hover:bg-white/40 text-gray-800'}`}>
                      <Database className="size-4" /> <span className="text-sm">Data controls</span>
                    </button>
                    <button onClick={() => setSettingsSection('security')} className={`w-full flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${settingsSection==='security' ? 'bg-white/80 text-gray-900' : 'hover:bg-white/40 text-gray-800'}`}>
                      <Shield className="size-4" /> <span className="text-sm">Security</span>
                    </button>
                    <button onClick={() => setSettingsSection('account')} className={`w-full flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${settingsSection==='account' ? 'bg-white/80 text-gray-900' : 'hover:bg-white/40 text-gray-800'}`}>
                      <UserIcon className="size-4" /> <span className="text-sm">Account</span>
                    </button>
                  </div>
                  {/* Right content */}
                  <div className="flex-1 p-4">
                    {settingsSection === 'general' && (
                      <div className="main-container p-4 text-gray-900">
                    <h2 className="text-xl font-semibold">General</h2>
                        <div className="mt-3 border-t border-black/10" />
                        <div className="divide-y divide-black/10 mt-2">
                      <div className="py-4 flex items-center justify-between">
                            <div className="text-sm">Theme</div>
                            <div className="inline-flex items-center gap-2 bg-white/60 rounded-md p-1">
                              <button className="px-3 py-1 rounded-sm text-sm bg-white text-black">Light</button>
                        </div>
                      </div>
                      <div className="py-4 flex items-center justify-between">
                            <div className="text-sm">Accent color</div>
                            <button className="inline-flex items-center gap-2 px-2 py-1 rounded-md hover:bg-white/70 text-sm">
                          • Default <ChevronDown className="size-4" />
                        </button>
                      </div>
                      <div className="py-4 flex items-center justify-between">
                            <div className="text-sm">Language</div>
                        <div className="inline-flex items-center gap-2">
                          <select
                            value={language}
                            onChange={(e) => { setLanguage(e.target.value); if (typeof window !== 'undefined') localStorage.setItem('language', e.target.value); }}
                                className="bg-white/70 border border-black/10 rounded-md px-2 py-1 text-sm hover:bg-white"
                          >
                            <option className="text-black" value="English">English</option>
                            <option className="text-black" value="Hindi">Hindi</option>
                            <option className="text-black" value="Spanish">Spanish</option>
                          </select>
                        </div>
                      </div>
                        </div>
                      </div>
                    )}
                    {settingsSection === 'notifications' && (
                      <div className="main-container p-4 text-gray-900">
                        <h2 className="text-xl font-semibold">Notifications</h2>
                        <p className="mt-2 text-sm">Email summaries and product updates.</p>
                      </div>
                    )}
                    {settingsSection === 'connected' && (
                      <div className="main-container p-4 text-gray-900">
                        <h2 className="text-xl font-semibold">Connected apps</h2>
                        <p className="mt-2 text-sm">Manage integrations.</p>
                      </div>
                    )}
                    {settingsSection === 'data' && (
                      <div className="main-container p-4 text-gray-900">
                        <h2 className="text-xl font-semibold">Data controls</h2>
                        <p className="mt-2 text-sm">Export or delete data.</p>
                      </div>
                    )}
                    {settingsSection === 'security' && (
                      <div className="main-container p-4 text-gray-900">
                        <h2 className="text-xl font-semibold">Security</h2>
                        <p className="mt-2 text-sm">Two-factor authentication and devices.</p>
                      </div>
                    )}
                    {settingsSection === 'account' && (
                      <div className="main-container p-8 text-gray-900">
                        <h2 className="text-2xl font-semibold mb-4">Account</h2>
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                          <div className="main-container p-5 col-span-1 lg:col-span-2">
                            <label className="block text-sm text-gray-700 mb-1">Username</label>
                            <div className="flex gap-2">
                              <input value={editUsername} onChange={(e)=>setEditUsername(e.target.value)} className="flex-1 px-3 py-3 rounded-md border border-black/10 bg-white/90" placeholder="Enter username" />
                              {editUsername !== (user?.displayName || "") && (
                                <button disabled={isSavingUsername} onClick={async()=>{
                                  if (!auth.currentUser) { toast.error("Not signed in"); return; }
                                  if (!editUsername.trim()) { toast.error("Username cannot be empty"); return; }
                                  try {
                                    setIsSavingUsername(true);
                                    toast.loading("Saving username...", { id: "uname" });
                                    // Update Firebase Auth displayName
                                    const { updateProfile } = await import('firebase/auth');
                                    await updateProfile(auth.currentUser, { displayName: editUsername.trim() });
                                    // Update Firestore user doc
                                    await updateDoc(doc(db, 'users', auth.currentUser.uid), { username: editUsername.trim() });
                                    toast.success("Username updated", { id: "uname" });
                                  } catch (e: any) {
                                    console.error(e);
                                    toast.error(e?.message || "Failed to save username", { id: "uname" });
                                  } finally {
                                    setIsSavingUsername(false);
                                  }
                                }} className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60">{isSavingUsername ? 'Saving...' : 'Save'}</button>
                              )}
                            </div>
                          </div>
                          <div className="main-container p-5">
                            <div className="text-sm text-gray-700">Email</div>
                            <div className="text-lg font-medium break-all">{user?.email || "—"}</div>
                          </div>
                        </div>
                        <div className="mt-6">
                          <h3 className="text-lg font-semibold mb-2">Change password</h3>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <input type="password" placeholder="Current password" className="w-full px-3 py-3 rounded-md border border-black/10 bg-white/90" value={currentPwd} onChange={(e)=>setCurrentPwd(e.target.value)} />
                            <input type="password" placeholder="New password" className="w-full px-3 py-3 rounded-md border border-black/10 bg-white/90" value={newPwd} onChange={(e)=>setNewPwd(e.target.value)} />
                            <input type="password" placeholder="Confirm new password" className="w-full px-3 py-3 rounded-md border border-black/10 bg-white/90" value={confirmPwd} onChange={(e)=>setConfirmPwd(e.target.value)} />
                          </div>
                          <div className="mt-3">
                            <button disabled={isChangingPwd} onClick={handleChangePassword} className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 active:scale-95 transition-all disabled:opacity-60">{isChangingPwd ? 'Changing...' : 'Change password'}</button>
                          </div>
                        </div>
                    </div>
                    )}
                    </div>
                  </div>
                </div>
            </TabsContent>

            <TabsContent value="help" className="mt-1 transition-opacity duration-150 data-[state=inactive]:opacity-0 data-[state=active]:opacity-100">
              <div className="main-container p-5 text-gray-900 space-y-3">
                <h3 className="text-lg font-semibold">Help & Support</h3>
                <p className="text-sm">For any help, email our support team at <a href="mailto:support@councellorx.help" className="text-blue-600 hover:underline">support@councellorx.help</a>.</p>
                <div className="text-sm text-gray-700">You can switch tabs above without closing this view.</div>
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="main-container z-[1000] fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[30rem] max-w-[90vw]">
          <DialogHeader>
            <DialogTitle className="text-lg">Delete chat?</DialogTitle>
            <DialogDescription>Are you sure you want to delete this chat? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex items-center justify-between gap-3">
            <Button variant="outline" className="bg-white" onClick={() => setDeleteDialogOpen(false)}>No</Button>
            <Button className="bg-red-600 text-white hover:bg-red-700" onClick={async()=>{
              if (!sessionToDelete || !auth.currentUser) { setDeleteDialogOpen(false); return; }
              try {
                toast.loading("Deleting chat...", { id: "del" });
                const uid = auth.currentUser.uid;
                const msgsCol = collection(db, 'users', uid, 'sessions', sessionToDelete, 'messages');
                const msgsSnap = await getDocs(msgsCol);
                await Promise.all(msgsSnap.docs.map(d => deleteDoc(d.ref)));
                await deleteDoc(doc(db, 'users', uid, 'sessions', sessionToDelete));
                toast.success("Chat deleted", { id: 'del' });
                setDeleteDialogOpen(false);
                setSessionToDelete(null);
                await newSession();
              } catch (e:any) {
                console.error(e);
                toast.error(e?.message || 'Failed to delete chat', { id: 'del' });
              }
            }}>Delete</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Sdebar;
