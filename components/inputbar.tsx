'use client'
// import  Sidebar  from "@/components/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Paperclip, ArrowUp } from "lucide-react";
import Image from "next/image";
import logo from "public/logo.png";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";

const InputBar = () => {
  return (
    <main className="grid place-items-center">
    <div className="w-[min(920px,92%)]">
      <h1 className="flex items-center justify-center gap-2.5 mb-5 text-[30px] font-bold text-blue-600">
        <Image src={logo} alt="logo" width={30} height={30} />
        How can I help you?
      </h1>
      <div className="main-container p-4">
        <Input placeholder="Message CouncellorX" className="bg-transparent border-0  text-gray-900 placeholder:text-gray-700 h-12" />
        <div className="flex gap-2.5 mt-12">
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="main-container bg-white text-gray-800 border-gray-200">DeepThink</Button>
              </TooltipTrigger>
              <TooltipContent
                className="tooltip-no-arrow rounded-full bg-gray-300 mb-3 text-black px-3 py-1 text-[11px] shadow-lg"
                side="top"
                align="center"
              >
                Think before responding to solve reasoning problems
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={100}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" className="main-container bg-white text-gray-800 border-gray-200">Search</Button>
              </TooltipTrigger>
              <TooltipContent
                className="tooltip-no-arrow rounded-full bg-gray-300 text-black px-3 py-1 mb-3 text-[11px] shadow-lg "
                side="top"
                align="center"
              >
                Search the web when necessar
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <div className="ml-auto flex items-center gap-2.5">
            <Button variant="ghost" className="main-container bg-white text-gray-800" aria-label="Attach"><Paperclip size={18} /></Button>
            <Button className=" bg-blue-600 text-white" aria-label="Send"><ArrowUp size={18} /></Button>
          </div>
        </div>
      </div>
    </div>
  </main>
  )
}

export default InputBar
