'use-client'
// import  Sidebar  from "@/components/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Paperclip, ArrowUp } from "lucide-react";
import Image from "next/image";
import logo from "public/logo.png";

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
          <Button variant="outline" className="main-container bg-white text-gray-800 border-gray-200">DeepThink</Button>
          <Button variant="outline" className="main-container bg-white text-gray-800 border-gray-200">Search</Button>
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
