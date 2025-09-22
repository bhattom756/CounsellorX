"use client";
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { db, auth } from "@/lib/firebase";
import { collection, addDoc, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc, Timestamp, updateDoc } from "firebase/firestore";
import toast from "react-hot-toast";

export type ChatMessage = { id?: string; role: "user" | "assistant"; content: string; createdAt?: Date };
export type ChatSession = { id: string; title: string; createdAt?: Date; updatedAt?: Date; lastPreview?: string };

type ChatContextType = {
  sessions: ChatSession[];
  currentSessionId: string | null;
  messages: ChatMessage[];
  newSession: () => Promise<string | null>;
  loadSession: (id: string) => void;
  appendMessage: (message: Omit<ChatMessage, "id">) => Promise<void>;
  clearCurrent: () => void;
};

const ChatContext = createContext<ChatContextType>({
  sessions: [],
  currentSessionId: null,
  messages: [],
  newSession: async () => null,
  loadSession: () => {},
  appendMessage: async () => {},
  clearCurrent: () => {},
});

function formatTitleFromText(text: string): string {
  const base = text.replace(/\s+/g, " ").trim();
  return base.length > 40 ? base.slice(0, 40) + "…" : base || "New chat";
}

function toDate(v?: Timestamp | Date): Date | undefined {
  if (!v) return undefined;
  // @ts-ignore Timestamp duck-typing
  return typeof v.toDate === "function" ? v.toDate() : v;
}

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const messagesUnsub = useRef<null | (() => void)>(null);

  // Subscribe to user's sessions
  useEffect(() => {
    if (!auth.currentUser) return;
    const uid = auth.currentUser.uid;
    const q = query(collection(db, "users", uid, "sessions"), orderBy("updatedAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const next = snap.docs.map((d) => {
        const data: any = d.data();
        return {
          id: d.id,
          title: data.title || "Untitled",
          createdAt: toDate(data.createdAt),
          updatedAt: toDate(data.updatedAt),
          lastPreview: data.lastPreview || "",
        } as ChatSession;
      });
      setSessions(next);
    });
    return () => unsub();
  }, [auth.currentUser]);

  // Load messages when session changes
  const loadSession = useCallback((id: string) => {
    if (!auth.currentUser) {
      toast.error("Sign in required to load chats");
      return;
    }
    setCurrentSessionId(id);
    messagesUnsub.current?.();
    const uid = auth.currentUser.uid;
    const q = query(collection(db, "users", uid, "sessions", id, "messages"), orderBy("createdAt", "asc"));
    messagesUnsub.current = onSnapshot(q, (snap) => {
      const next: ChatMessage[] = snap.docs.map((d) => {
        const data: any = d.data();
        return { id: d.id, role: data.role, content: data.content, createdAt: toDate(data.createdAt) };
      });
      setMessages(next);
    });
  }, []);

  const clearCurrent = useCallback(() => {
    setMessages([]);
  }, []);

  const newSession = useCallback(async () => {
    if (!auth.currentUser) {
      toast.error("Sign in required to start a chat");
      return null;
    }
    try {
      const uid = auth.currentUser.uid;
      const sessionsCol = collection(db, "users", uid, "sessions");
      const ref = await addDoc(sessionsCol, {
        title: "New chat",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastPreview: "",
      });
      setCurrentSessionId(ref.id);
      clearCurrent();
      toast.success("New chat started");
      // subscribe to messages of the new session
      loadSession(ref.id);
      return ref.id;
    } catch (e) {
      console.error(e);
      toast.error("Failed to start chat");
      return null;
    }
  }, [clearCurrent, loadSession]);

  const appendMessage = useCallback(async (message: Omit<ChatMessage, "id">) => {
    setMessages((prev) => [...prev, { ...message, createdAt: message.createdAt ?? new Date() }]);
    if (!auth.currentUser || !currentSessionId) return;
    try {
      const uid = auth.currentUser.uid;
      const msgCol = collection(db, "users", uid, "sessions", currentSessionId, "messages");
      await addDoc(msgCol, {
        role: message.role,
        content: message.content,
        createdAt: serverTimestamp(),
      });
      const titleCandidate = message.role === "user" ? formatTitleFromText(message.content) : undefined;
      const sessRef = doc(db, "users", uid, "sessions", currentSessionId);
      await updateDoc(sessRef, {
        updatedAt: serverTimestamp(),
        ...(titleCandidate ? { title: titleCandidate, lastPreview: message.content.slice(0, 80) } : { lastPreview: message.content.slice(0, 80) }),
      });
    } catch (e) {
      console.error(e);
      toast.error("Failed to save message");
    }
  }, [currentSessionId]);

  const value = useMemo(
    () => ({ sessions, currentSessionId, messages, newSession, loadSession, appendMessage, clearCurrent }),
    [sessions, currentSessionId, messages, newSession, loadSession, appendMessage, clearCurrent]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export const useChat = () => useContext(ChatContext);

// Utility to format relative time: 5m/10m/20m granularity, else days
export function formatRelativeTime(date?: Date): string {
  if (!date) return "just now";
  const ms = Date.now() - date.getTime();
  const m = Math.floor(ms / 60000);
  if (m < 5) return "5 mins ago";
  if (m < 10) return "10 mins ago";
  if (m < 20) return "20 mins ago";
  const d = Math.floor(m / (60 * 24));
  if (d <= 0) return "today";
  if (d === 1) return "1 day ago";
  return `${d} days ago`;
}


