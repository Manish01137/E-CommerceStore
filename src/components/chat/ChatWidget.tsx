"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  getChipLabel,
  getReplyForChip,
  getWelcomeMessage,
  resolveUserMessage,
  type AssistantReply,
  type LinkAction,
} from "@/lib/assistant";

interface ChatMessage {
  id: string;
  sender: "bot" | "user";
  text: string;
  links?: LinkAction[];
  chips?: string[];
}

let idCounter = 0;
function nextId() {
  idCounter += 1;
  return `msg-${idCounter}`;
}

function toMessage(sender: ChatMessage["sender"], reply: AssistantReply | string): ChatMessage {
  if (typeof reply === "string") return { id: nextId(), sender, text: reply };
  return { id: nextId(), sender, text: reply.text, links: reply.links, chips: reply.chips };
}

const ORB_GRADIENT = "conic-gradient(from 0deg, #8c916c, #c7af94, #95714f, #acb087, #8c916c)";

/** Rotating gradient ring with a pulsing halo — the assistant's visual signature. */
function AssistantOrb({ size = 36, pulse = true }: { size?: number; pulse?: boolean }) {
  const reduceMotion = useReducedMotion();
  const ringInset = Math.max(2, size * 0.14);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} aria-hidden>
      {pulse && (
        <motion.div
          className="absolute rounded-full blur-md"
          style={{ inset: -Math.max(4, size * 0.2), background: ORB_GRADIENT }}
          animate={reduceMotion ? undefined : { opacity: [0.3, 0.6, 0.3], scale: [0.92, 1.05, 0.92] }}
          transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
        />
      )}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{ background: ORB_GRADIENT }}
        animate={reduceMotion ? undefined : { rotate: 360 }}
        transition={{ duration: 7, repeat: Infinity, ease: "linear" }}
      />
      <div
        className="absolute flex items-center justify-center rounded-full bg-almond-light"
        style={{ inset: ringInset }}
      >
        <svg width={size * 0.46} height={size * 0.46} viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M12 3 C 8 8 5 11 5 15 A7 7 0 0 0 19 15 C 19 11 16 8 12 3 Z"
            stroke="#585c42"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

/**
 * Reveals a bot reply progressively, like a live-generated answer. Only ever
 * mounted for the message currently streaming — once done, the parent swaps
 * it out for plain text, so this never needs to react to a changing prop.
 */
function StreamingText({ text, onDone }: { text: string; onDone: () => void }) {
  const [count, setCount] = useState(0);
  const onDoneRef = useRef(onDone);
  const doneCalled = useRef(false);
  onDoneRef.current = onDone;

  // Advances local reveal progress only — no cross-component side effects here.
  useEffect(() => {
    if (text.length === 0) return;
    const id = setInterval(() => {
      setCount((c) => Math.min(c + 2, text.length));
    }, 16);
    return () => clearInterval(id);
  }, [text]);

  // Notifies the parent from a plain commit-phase effect once fully revealed.
  useEffect(() => {
    if (count >= text.length && !doneCalled.current) {
      doneCalled.current = true;
      onDoneRef.current();
    }
  }, [count, text.length]);

  const finished = count >= text.length;
  return (
    <>
      {text.slice(0, count)}
      {!finished && (
        <span className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-current align-middle" />
      )}
    </>
  );
}

function ThinkingIndicator({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl rounded-bl-sm bg-almond px-3.5 py-3 w-fit">
      <AssistantOrb size={20} />
      <motion.span
        className="bg-clip-text text-sm font-medium text-transparent"
        style={{
          backgroundImage: "linear-gradient(90deg, #95714f 0%, #d8c6b1 50%, #95714f 100%)",
          backgroundSize: "200% 100%",
        }}
        animate={reduceMotion ? undefined : { backgroundPosition: ["200% 0%", "-200% 0%"] }}
        transition={{ duration: 1.3, repeat: Infinity, ease: "linear" }}
      >
        Thinking…
      </motion.span>
    </div>
  );
}

function LinkPill({ link }: { link: LinkAction }) {
  const external = link.href.startsWith("http") || link.href.startsWith("mailto:");
  return (
    <a
      href={link.href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="inline-flex items-center rounded-full border border-moss-deep/25 bg-almond px-3 py-1.5 text-xs font-semibold text-moss-deep transition-colors hover:bg-sage/40"
    >
      {link.label}
    </a>
  );
}

export default function ChatWidget() {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [streamingId, setStreamingId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (open && !initialized.current) {
      initialized.current = true;
      const welcome = toMessage("bot", getWelcomeMessage());
      setMessages([welcome]);
      if (!reduceMotion) setStreamingId(welcome.id);
    }
  }, [open, reduceMotion]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, typing]);

  if (pathname.startsWith("/admin")) return null;

  const lastMessage = messages[messages.length - 1];
  const activeChips =
    lastMessage?.sender === "bot" && lastMessage.id !== streamingId ? lastMessage.chips : undefined;

  async function respond(replyPromise: Promise<AssistantReply>) {
    setTyping(true);
    const reply = await replyPromise;
    await new Promise((r) => setTimeout(r, 450));
    setTyping(false);
    const botMessage = toMessage("bot", reply);
    if (!reduceMotion) setStreamingId(botMessage.id);
    setMessages((m) => [...m, botMessage]);
  }

  function handleChip(id: string) {
    setMessages((m) => [...m, toMessage("user", getChipLabel(id))]);
    void respond(getReplyForChip(id));
  }

  function handleSend() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setMessages((m) => [...m, toMessage("user", text)]);
    void respond(resolveUserMessage(text));
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? "Close chat" : "Open Ethereal Assistant chat"}
        aria-expanded={open}
        className={`fixed bottom-5 right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full transition-transform duration-200 hover:scale-105 active:scale-95 ${
          open ? "bg-moss text-almond-light shadow-drawer" : ""
        }`}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
            <path d="M6 6 L18 18 M18 6 L6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        ) : (
          <AssistantOrb size={56} />
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="dialog"
            aria-label="Ethereal Assistant chat"
            initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-x-4 bottom-24 z-40 flex max-h-[70vh] flex-col overflow-hidden rounded-2xl border border-sand bg-almond-light shadow-[0_0_60px_-10px_rgba(140,145,108,0.4),-8px_0_40px_rgba(95,71,50,0.18)] sm:inset-x-auto sm:right-5 sm:w-96"
          >
            <div className="flex items-center gap-3 bg-moss px-4 py-3.5 text-almond-light">
              <AssistantOrb size={38} />
              <div className="min-w-0">
                <p className="font-serif text-base leading-tight">Ethereal Assistant</p>
                <p className="text-xs text-almond-light/75">Smart answers, instantly</p>
              </div>
            </div>

            <div
              ref={scrollRef}
              aria-live="polite"
              className="flex-1 space-y-3 overflow-y-auto px-4 py-4"
            >
              {messages.map((m) => (
                <div key={m.id} className={`flex flex-col ${m.sender === "user" ? "items-end" : "items-start"}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      m.sender === "user"
                        ? "rounded-br-sm bg-moss text-almond-light"
                        : "rounded-bl-sm bg-gradient-to-br from-almond to-sand/40 text-earth-deep"
                    }`}
                  >
                    {m.sender === "bot" && m.id === streamingId ? (
                      <StreamingText
                        text={m.text}
                        onDone={() => setStreamingId((cur) => (cur === m.id ? null : cur))}
                      />
                    ) : (
                      m.text
                    )}
                  </div>
                  {m.sender === "bot" && m.id !== streamingId && m.links && m.links.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {m.links.map((link) => (
                        <LinkPill key={link.href} link={link} />
                      ))}
                    </div>
                  )}
                </div>
              ))}

              {typing && <ThinkingIndicator reduceMotion={!!reduceMotion} />}
            </div>

            {activeChips && activeChips.length > 0 && !typing && (
              <div className="flex flex-wrap gap-2 border-t border-sand px-4 py-3">
                {activeChips.map((id) => (
                  <button
                    key={id}
                    onClick={() => handleChip(id)}
                    className="rounded-full border border-moss-deep/30 px-3 py-1.5 text-xs font-semibold text-moss-deep transition-colors hover:bg-sage/40"
                  >
                    {getChipLabel(id)}
                  </button>
                ))}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2 border-t border-sand p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question…"
                aria-label="Message the Ethereal Assistant"
                className="field flex-1 py-2 text-sm"
              />
              <button
                type="submit"
                aria-label="Send message"
                disabled={!input.trim()}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-moss text-almond-light transition-opacity disabled:opacity-40"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                  <path d="M4 12 L20 4 L14 20 L11 13 L4 12 Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                </svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
