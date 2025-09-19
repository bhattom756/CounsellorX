"use client";
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
import React, { useRef, useState } from "react";
import { uploadFileToStorage, uploadFileWithProgress } from "@/lib/firebase";
import { analyzeCase } from "@/lib/api";
import toast, { Toaster } from "react-hot-toast";
import { FaMicrophone } from "react-icons/fa6";
import { ScaleLoader } from "react-spinners";

type AttachmentButtonProps = {
  onUploaded?: (info: { url: string; path: string; file: File }) => void;
  onSelected?: (file: File) => void;
};

export function AttachmentButton(props: AttachmentButtonProps) {
  const { onUploaded, onSelected } = props;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleClick = () => {
    if (inputRef.current) inputRef.current.value = "";
    inputRef.current?.click();
  };

  const handleChange: React.ChangeEventHandler<HTMLInputElement> = async (
    e
  ) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    try {
      setIsUploading(true);
      setProgress(0);
      for (const file of files) {
        onSelected?.(file);
        const result = await uploadFileWithProgress(file, "uploads", (p) =>
          setProgress(p)
        );
        onUploaded?.({ ...result, file });
        setProgress(0);
      }
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setIsUploading(false);
      setTimeout(() => setProgress(0), 400);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

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
          <div
            className="h-full bg-blue-600 transition-[width] duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
      <input
        ref={inputRef}
        onChange={handleChange}
        type="file"
        className="hidden"
        accept="*/*"
        multiple
      />
    </div>
  );
}

type ChatMessage = { role: "user" | "assistant"; content: string };

const InputBar = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [showCaseOptions, setShowCaseOptions] = useState(false);
  const [showNatureOptions, setShowNatureOptions] = useState(false);
  const [selectedCase, setSelectedCase] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showDocumentRequirements, setShowDocumentRequirements] =
    useState(false);
  const [showDocumentUpload, setShowDocumentUpload] = useState(false);
  const [uploadedDocuments, setUploadedDocuments] = useState<any[]>([]);
  const [showStatementRequest, setShowStatementRequest] = useState(false);
  const [isMicClicked, setIsMicClicked] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);

  const handleSend = async () => {
    const text = message.trim();
    if (!text) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setMessage("");

    if (messages.length === 0) {
      setShowCaseOptions(true);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Please select from a case:" },
      ]);
    } else if (selectedCase && !showNatureOptions && messages.length <= 2) {
      setShowNatureOptions(true);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Now choose Civil or Criminal:" },
      ]);
    } else if (selectedCase && showNatureOptions) {
      // Gemini API for case analysis
      setLoading(true);
      try {
        const response = await analyzeCase({
          statement: text,
          caseType: selectedCase.toLowerCase(),
          documents: [],
          lang: "en",
        });
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `Tell me about your case. You can send a voice recording or type it in here. I'll analyze your ${selectedCase} case and provide guidance.`,
          },
        ]);
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "Tell me about your case. You can send a voice recording or type it in here.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    } else if (selectedCase) {
      // After case setup, use Gemini for all responses
      setLoading(true);
      try {
        const response = await analyzeCase({
          statement: text,
          caseType: selectedCase.toLowerCase(),
          documents: [],
          lang: "en",
        });
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              response.draftedStatement ||
              "I understand your concern. Let me help you with your legal case.",
          },
        ]);

        // Show document requirements after AI response
        setTimeout(() => {
          setShowDocumentRequirements(true);
        }, 1000);
      } catch (error) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              "I understand your concern. Let me help you with your legal case.",
          },
        ]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleCaseSelect = (caseType: string) => {
    setSelectedCase(caseType);
    setShowCaseOptions(false);
    setShowNatureOptions(true);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: caseType },
      { role: "assistant", content: "Now choose Civil or Criminal:" },
    ]);
  };

  const handleNatureSelect = (nature: string) => {
    setShowNatureOptions(false);
    setMessages((prev) => [
      ...prev,
      { role: "user", content: nature },
      {
        role: "assistant",
        content: `Tell me about your case. You can send a voice recording or type it in here.`,
      },
    ]);
  };

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Transcription failed");
      }

      const result = await response.json();
      return result.text;
    } catch (error) {
      console.error("Transcription error:", error);
      toast.error("Failed to transcribe audio. Please try again.");
      return null;
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/webm" });
        setAudioChunks([]);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
        
        // Start transcribing
        setIsRecording(false);
        setIsTranscribing(true);
        
        // Transcribe the audio
        const transcribedText = await transcribeAudio(audioBlob);
        if (transcribedText) {
          // Put into input field for user to review/edit
          setMessage(transcribedText);
          toast.success("Audio transcribed to English. You can edit before sending.");
        }
        
        // Reset states
        setIsTranscribing(false);
        setIsMicClicked(false);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setAudioChunks(chunks);
      setIsRecording(true);
      setIsMicClicked(true);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }
  };

  const handleMicClick = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleDocumentUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    toast.loading(`Uploading ${files.length} document(s)...`, { id: "upload" });

    try {
      const uploadPromises = files.map(async (file) => {
        // Send to Python FastAPI for processing
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("http://localhost:8000/process", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) throw new Error("Upload failed");

        const result = await response.json();
        return { name: file.name, summary: result.data, file };
      });

      const results = await Promise.all(uploadPromises);
      setUploadedDocuments((prev) => [...prev, ...results]);

      toast.success(`Successfully uploaded ${files.length} document(s)!`, {
        id: "upload",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload documents. Please try again.", {
        id: "upload",
      });
    }
  };

  return (
    <main className="grid place-items-center min-h-screen">
      <div className="w-[min(920px,92%)]">
        {messages.length === 0 && (
          <h1 className="flex items-center justify-center gap-2.5 mb-5 text-[30px] font-bold text-blue-600">
            <Image src={logo} alt="logo" width={30} height={30} />
            How can I help you?
          </h1>
        )}

        {/* Messages div above input bar */}
        {messages.length > 0 && (
          <div
            className="main-container p-4 mb-4 h-[60vh] overflow-y-auto space-y-3"
            ref={(el) => {
              if (el) {
                el.scrollTop = el.scrollHeight;
              }
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={m.role === "assistant" ? "p-3" : "flex justify-end"}
              >
                {m.role === "user" ? (
                  <div className="inline-block text-gray-900 px-3 py-2">
                    {m.content}
                  </div>
                ) : (
                  <div className="text-gray-900 whitespace-pre-wrap">
                    {m.content}
                  </div>
                )}
              </div>
            ))}

            {/* Case selection buttons */}
            {showCaseOptions && (
              <div className="p-3">
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleCaseSelect("Divorce")}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Divorce
                  </Button>
                  <Button
                    onClick={() => handleCaseSelect("Rental/Loan")}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Rental/Loan
                  </Button>
                </div>
              </div>
            )}

            {/* Nature selection buttons */}
            {showNatureOptions && (
              <div className="p-3">
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleNatureSelect("Civil")}
                    className="bg-green-600 text-white hover:bg-green-700"
                  >
                    Civil
                  </Button>
                  <Button
                    onClick={() => handleNatureSelect("Criminal")}
                    className="bg-red-600 text-white hover:bg-red-700"
                  >
                    Criminal
                  </Button>
                </div>
              </div>
            )}

            {loading && (
              <div className="p-3 text-gray-600">Analyzing your case...</div>
            )}

            {/* Document Requirements */}
            {showDocumentRequirements && (
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">
                  Required Documents for {selectedCase} Case:
                </h4>
                <div className="text-sm text-blue-700 mb-3">
                  {selectedCase.toLowerCase().includes("divorce") ? (
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Marriage certificate</li>
                      <li>
                        Financial statements (bank statements, tax returns)
                      </li>
                      <li>Property deeds and ownership documents</li>
                      <li>Employment records and income proof</li>
                      <li>Any prenuptial or postnuptial agreements</li>
                      <li>Communication records (emails, texts) if relevant</li>
                    </ul>
                  ) : (
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Rental agreement or loan contract</li>
                      <li>Payment records and receipts</li>
                      <li>Property ownership documents</li>
                      <li>Communication records with landlord/lender</li>
                      <li>Photos of property condition (if applicable)</li>
                      <li>Bank statements showing payments</li>
                    </ul>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setShowDocumentRequirements(false);
                      setShowDocumentUpload(true);
                    }}
                    className="bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Upload Documents
                  </Button>
                  <Button
                    onClick={() => {
                      setShowDocumentRequirements(false);
                      setShowStatementRequest(true);
                    }}
                    variant="outline"
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    Skip for now
                  </Button>
                </div>
              </div>
            )}

            {/* Document Upload Section */}
            {showDocumentUpload && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">
                  Upload Your Documents:
                </h4>
                <p className="text-sm text-green-700 mb-3">
                  Upload whatever documents you have. You can select multiple
                  files at once.
                </p>
                <div className="flex gap-2 items-center">
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
                    onChange={handleDocumentUpload}
                    className="hidden"
                    id="document-upload"
                  />
                  <label
                    htmlFor="document-upload"
                    className="px-4 py-2 bg-green-600 text-white rounded cursor-pointer hover:bg-green-700"
                  >
                    Choose Files
                  </label>
                  <Button
                    onClick={() => {
                      setShowDocumentUpload(false);
                      setShowStatementRequest(true);
                    }}
                    variant="outline"
                    className="border-green-600 text-green-600 hover:bg-green-50"
                  >
                    Done Uploading
                  </Button>
                </div>
                {uploadedDocuments.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm font-medium text-green-800">
                      Uploaded Documents:
                    </p>
                    <ul className="text-sm text-green-700">
                      {uploadedDocuments.map((doc, i) => (
                        <li key={i}>✓ {doc.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Statement Request */}
            {showStatementRequest && (
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <h4 className="font-semibold text-purple-800 mb-2">
                  Tell Your Story:
                </h4>
                <p className="text-sm text-purple-700 mb-3">
                  Now can you submit a statement of what actually happened? You
                  can either type it here or attach a voice recording.
                </p>
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      setShowStatementRequest(false);
                      // Focus on input field
                      const input = document.querySelector(
                        'input[placeholder*="Message"]'
                      ) as HTMLInputElement;
                      if (input) input.focus();
                    }}
                    className="bg-purple-600 text-white hover:bg-purple-700"
                  >
                    Type Statement
                  </Button>
                  <Button
                    variant="outline"
                    className="border-purple-600 text-purple-600 hover:bg-purple-50"
                  >
                    Voice Recording
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Original input bar component - DO NOT TOUCH */}
        <div className="main-container p-4">
          <Input
            placeholder="Message CouncellorX"
            className="bg-transparent border-0  text-gray-900 placeholder:text-gray-700 h-12"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />
          <div className="flex gap-2.5 mt-12">
            <TooltipProvider delayDuration={100}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    className="main-container bg-white text-gray-800 border-gray-200"
                  >
                    DeepThink
                  </Button>
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
                  <Button
                    variant="outline"
                    className="main-container bg-white text-gray-800 border-gray-200"
                  >
                    Search
                  </Button>
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
              <AttachmentButton
                onSelected={(file) => {
                  setMessage((prev) =>
                    prev ? `${prev} [${file.name}]` : `[${file.name}]`
                  );
                }}
                onUploaded={({ url, path, file }) => {
                  console.log("Uploaded:", { name: file.name, url, path });
                }}
              />
               {!isMicClicked ? (
                 <Button
                   onClick={handleMicClick}
                   className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-white/40 bg-white/60 backdrop-blur-md shadow-sm hover:bg-white/70 active:scale-95 transition disabled:opacity-60"
                   aria-label="Start recording"
                 >
                   <FaMicrophone size={25} className="text-gray-800" />
                 </Button>
              ) : (
                <div
                  className="inline-flex items-center justify-center w-10 h-10 md:w-10 md:h-10 rounded-full border border-white/40 bg-white/60 backdrop-blur-md shadow-sm cursor-pointer"
                  onClick={() => {
                    if (isRecording) stopRecording();
                  }}
                  title={isRecording ? "Click to stop recording" : undefined}
                >
                  {isRecording ? (
                    <div className="flex items-center justify-center">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                  ) : isTranscribing ? (
                    <ScaleLoader
                      color="#3b82f6"
                      loading={true}
                      height={4}
                      width={4}
                      aria-label="Transcribing audio"
                      data-testid="loader"
                    />
                  ) : null}
                </div>
              )}

              <Button
                onClick={handleSend}
                className=" bg-blue-600 text-white"
                aria-label="Send"
              >
                <ArrowUp size={18} />
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Toaster position="top-center" />
    </main>
  );
};

export default InputBar;
