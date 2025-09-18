"use client"
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
import React, { useRef, useState } from "react"
import { uploadFileToStorage, uploadFileWithProgress } from "@/lib/firebase"

type AttachmentButtonProps = {
  onUploaded?: (info: { url: string; path: string; file: File }) => void
  onSelected?: (file: File) => void
}

export function AttachmentButton(props: AttachmentButtonProps) {
  const { onUploaded, onSelected } = props
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleClick = () => {
    if (inputRef.current) inputRef.current.value = "" // ensure same-file reselect fires
    inputRef.current?.click()
  }

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
    const fileList = e.target.files
    if (!fileList || fileList.length === 0) return
    const files = Array.from(fileList)
    try {
      setIsUploading(true)
      setProgress(0)
      for (const file of files) {
        onSelected?.(file)
        const result = await uploadFileWithProgress(file, "uploads", (p) => setProgress(p))
        onUploaded?.({ ...result, file })
        setProgress(0)
      }
    } catch (err) {
      console.error("Upload failed", err)
    } finally {
      setIsUploading(false)
      setTimeout(() => setProgress(0), 400)
      if (inputRef.current) inputRef.current.value = ""
    }
  }

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <div className="relative">
        <button
          type="button"
          onClick={handleClick}
          disabled={isUploading}
          className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-white/40 bg-white/60 backdrop-blur-md shadow-sm hover:bg-white/70 active:scale-95 transition disabled:opacity-60"
          aria-label="Attach file"
        >
          <Paperclip className="text-gray-800" size={18} />
        </button>
        {isUploading && (
          <div className="pointer-events-none absolute inset-0 rounded-full border-2 border-blue-200/50" />
        )}
      </div>
      {progress > 0 && (
        <div className="h-1 w-12 rounded-full bg-white/40 overflow-hidden">
          <div className="h-full bg-blue-600 transition-[width] duration-200" style={{ width: `${progress}%` }} />
        </div>
      )}
      <input ref={inputRef} onChange={handleChange} type="file" className="hidden" accept="*/*" multiple />
    </div>
  )
}

const InputBar = () => {
  const [message, setMessage] = useState("")
  return (
    <main className="grid place-items-center">
    <div className="w-[min(920px,92%)]">
      <h1 className="flex items-center justify-center gap-2.5 mb-5 text-[30px] font-bold text-blue-600">
        <Image src={logo} alt="logo" width={30} height={30} />
        How can I help you?
      </h1>
      <div className="main-container p-4">
        <Input
          placeholder="Message CouncellorX"
          className="bg-transparent border-0  text-gray-900 placeholder:text-gray-700 h-12"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
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
            <AttachmentButton onSelected={(file) => {
              setMessage((prev) => prev ? `${prev} [${file.name}]` : `[${file.name}]`)
            }} onUploaded={({ url, path, file }) => {
              console.log("Uploaded:", { name: file.name, url, path })
            }} />
            <Button className=" bg-blue-600 text-white" aria-label="Send"><ArrowUp size={18} /></Button>
          </div>
        </div>
      </div>
    </div>
  </main>
  )
}

export default InputBar
