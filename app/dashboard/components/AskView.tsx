"use client";

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Job } from "@/lib/types";
import { daysSince } from "@/lib/dates";

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

interface AskViewProps {
  jobs: Job[];
}

function buildPipelineSummary(jobs: Job[]): string {
  const active = jobs.filter((j) => !j.dismissed && j.workType !== "On-site");
  const newJobs = active.filter((j) => j.status === "New");
  const bookmarked = active.filter((j) => j.bookmarked && !j.applied);
  const applied = active.filter((j) => j.status === "Applied");
  const interviewing = active.filter((j) => j.status === "Interview");

  const lines: string[] = [];
  lines.push(`Total active jobs: ${active.length}`);
  lines.push(`New (unreviewed): ${newJobs.length}`);
  lines.push(`Bookmarked/Pursuing: ${bookmarked.length}`);
  lines.push(`Applied: ${applied.length}`);
  lines.push(`Interviewing: ${interviewing.length}`);

  if (interviewing.length > 0) {
    lines.push("\n### Interviewing");
    interviewing.forEach((j) => {
      lines.push(
        `- ${j.jobTitle} at ${j.company} (Round: ${j.interviewRound || "TBD"}, Score: ${j.totalScore ?? "N/A"})`
      );
    });
  }

  if (applied.length > 0) {
    lines.push("\n### Applied");
    applied.forEach((j) => {
      lines.push(
        `- ${j.jobTitle} at ${j.company} (Applied: ${j.dateApplied || "?"}, Follow-ups: ${j.followUpCount}, Last follow-up: ${j.lastFollowUpDate || "none"}, Score: ${j.totalScore ?? "N/A"})`
      );
    });
  }

  if (bookmarked.length > 0) {
    lines.push("\n### Pursuing (Bookmarked)");
    bookmarked.forEach((j) => {
      lines.push(
        `- ${j.jobTitle} at ${j.company} (Score: ${j.totalScore ?? "N/A"}, Resume: ${j.resumeReviewStatus || "N/A"})`
      );
    });
  }

  if (newJobs.length > 0) {
    lines.push(`\n### New Jobs (top 10 by score)`);
    [...newJobs]
      .sort((a, b) => (b.totalScore ?? 0) - (a.totalScore ?? 0))
      .slice(0, 10)
      .forEach((j) => {
        lines.push(
          `- ${j.jobTitle} at ${j.company} (Score: ${j.totalScore ?? "N/A"}, ${j.workType}, ${j.salaryRange || "salary unknown"})`
        );
      });
  }

  return lines.join("\n");
}

function getSuggestions(jobs: Job[]): string[] {
  const active = jobs.filter((j) => !j.dismissed && j.workType !== "On-site");
  const interviewing = active.filter((j) => j.status === "Interview");
  const applied = active.filter((j) => j.status === "Applied");
  const newJobs = active.filter((j) => j.status === "New");
  const bookmarked = active.filter((j) => j.bookmarked && !j.applied);
  const overdueFollowUps = applied.filter((j) => {
    const d = daysSince(j.lastFollowUpDate || j.dateApplied);
    return d !== null && d >= 10;
  });
  const resumesReady = active.filter(
    (j) => j.resumeReviewStatus === "AI Draft Ready" && j.tailoredSummary
  );

  const suggestions: string[] = [];

  // Always lead with a daily focus question
  suggestions.push("What should I focus on today?");

  // Interview-specific
  if (interviewing.length > 0) {
    const next = interviewing[0];
    suggestions.push(
      `Help me prep for my ${next.company} interview`
    );
    if (interviewing.length > 1) {
      suggestions.push("Compare my active interviews — which looks strongest?");
    }
  }

  // Follow-up nudges
  if (overdueFollowUps.length > 0) {
    if (overdueFollowUps.length === 1) {
      suggestions.push(
        `Draft a follow-up for ${overdueFollowUps[0].company}`
      );
    } else {
      suggestions.push(
        `I have ${overdueFollowUps.length} overdue follow-ups — help me prioritize`
      );
    }
  }

  // Resume review
  if (resumesReady.length > 0) {
    suggestions.push(
      `Walk me through my tailored resume for ${resumesReady[0].company}`
    );
  }

  // Bookmarked but not yet applied
  if (bookmarked.length > 0 && suggestions.length < 4) {
    suggestions.push(
      `Should I apply to ${bookmarked[0].company}? What are the pros and cons?`
    );
  }

  // New jobs to review
  if (newJobs.length > 0 && suggestions.length < 4) {
    suggestions.push(
      `I have ${newJobs.length} new ${newJobs.length === 1 ? "job" : "jobs"} — which should I look at first?`
    );
  }

  // Applied but no interviews yet
  if (applied.length > 0 && interviewing.length === 0 && suggestions.length < 4) {
    suggestions.push(
      "I've applied to several roles but no interviews yet — what can I do?"
    );
  }

  // Fallbacks if pipeline is thin
  if (suggestions.length < 4) {
    const fallbacks = [
      "How can I strengthen my resume?",
      "What industries should I be targeting?",
      "Help me write a networking message for LinkedIn",
      "What salary should I negotiate for?",
    ];
    for (const f of fallbacks) {
      if (suggestions.length >= 4) break;
      if (!suggestions.includes(f)) suggestions.push(f);
    }
  }

  return suggestions.slice(0, 4);
}

function ChatIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="#1a4b58"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  );
}

// ── Multi-conversation localStorage ──

const CONVERSATIONS_KEY = "career-compass-conversations";
const MAX_CONVERSATIONS = 50;

interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

function loadConversations(): Conversation[] {
  try {
    const raw = localStorage.getItem(CONVERSATIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveConversations(convos: Conversation[]) {
  try {
    const trimmed = convos.slice(0, MAX_CONVERSATIONS);
    localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(trimmed));
  } catch {
    // storage full — silently ignore
  }
}

function generateTitle(messages: ChatMessage[]): string {
  const first = messages.find((m) => m.role === "user");
  if (!first) return "New conversation";
  const text = first.content.trim();
  return text.length > 50 ? text.slice(0, 50) + "\u2026" : text;
}

function formatConvoDate(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay === 1) return "Yesterday";
  if (diffDay < 7) return `${diffDay}d ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function AskView({ jobs }: AskViewProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Load conversations on mount
  useEffect(() => {
    const convos = loadConversations();
    setConversations(convos);
    // Resume the most recent conversation if it exists
    if (convos.length > 0) {
      setActiveId(convos[0].id);
      setMessages(convos[0].messages);
    }
    setLoaded(true);
  }, []);

  // Persist active conversation whenever messages change
  useEffect(() => {
    if (!loaded || !activeId) return;
    setConversations((prev) => {
      const updated = prev.map((c) =>
        c.id === activeId
          ? {
              ...c,
              messages,
              title: generateTitle(messages),
              updatedAt: new Date().toISOString(),
            }
          : c
      );
      saveConversations(updated);
      return updated;
    });
  }, [messages, activeId, loaded]);

  function startNewChat() {
    if (abortRef.current) abortRef.current.abort();
    const id = Date.now().toString();
    const newConvo: Conversation = {
      id,
      title: "New conversation",
      messages: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setConversations((prev) => {
      const updated = [newConvo, ...prev];
      saveConversations(updated);
      return updated;
    });
    setActiveId(id);
    setMessages([]);
    setStreaming(false);
    setShowHistory(false);
  }

  function openConversation(id: string) {
    const convo = conversations.find((c) => c.id === id);
    if (!convo) return;
    if (abortRef.current) abortRef.current.abort();
    setActiveId(id);
    setMessages(convo.messages);
    setStreaming(false);
    setShowHistory(false);
  }

  function deleteConversation(id: string) {
    setConversations((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      saveConversations(updated);
      return updated;
    });
    if (activeId === id) {
      setActiveId(null);
      setMessages([]);
    }
  }

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height =
        Math.min(inputRef.current.scrollHeight, 120) + "px";
    }
  }, [input]);

  async function sendMessage(text?: string) {
    const content = (text || input).trim();
    if (!content || streaming) return;

    // Auto-create a conversation if none active
    if (!activeId) {
      const id = Date.now().toString();
      const newConvo: Conversation = {
        id,
        title: "New conversation",
        messages: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setConversations((prev) => {
        const updated = [newConvo, ...prev];
        saveConversations(updated);
        return updated;
      });
      setActiveId(id);
    }

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content,
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setStreaming(true);
    setShowHistory(false);

    const assistantId = (Date.now() + 1).toString();
    setMessages((prev) => [
      ...prev,
      { id: assistantId, role: "assistant", content: "" },
    ]);

    try {
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          pipelineData: buildPipelineSummary(jobs),
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        throw new Error("Failed to get response");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error("No reader");

      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const data = line.slice(6);
          if (data === "[DONE]") break;

          try {
            const parsed = JSON.parse(data);
            if (parsed.text) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId
                    ? { ...m, content: m.content + parsed.text }
                    : m
                )
              );
            }
          } catch {
            // skip malformed chunks
          }
        }
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? {
                ...m,
                content:
                  "Sorry, I couldn\u2019t get a response. Please try again.",
              }
            : m
        )
      );
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const suggestions = useMemo(() => getSuggestions(jobs), [jobs]);
  const isEmpty = messages.length === 0;

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 64px)" }}>
      {/* Header */}
      <div className="pt-5 pb-4 flex items-center justify-between flex-shrink-0">
        <h1 className="heading-serif text-[24px] text-text-primary">
          {showHistory ? "History" : "Ask"}
        </h1>
        <div className="flex items-center gap-3">
          {conversations.length > 0 && !showHistory && (
            <button
              onClick={() => setShowHistory(true)}
              className="text-xs text-text-tertiary font-medium bg-transparent border-none cursor-pointer"
            >
              History
            </button>
          )}
          {showHistory && (
            <button
              onClick={() => setShowHistory(false)}
              className="text-xs text-text-tertiary font-medium bg-transparent border-none cursor-pointer"
            >
              Back
            </button>
          )}
          {!showHistory && (
            <button
              onClick={startNewChat}
              className="text-xs text-teal font-semibold bg-transparent border-none cursor-pointer"
            >
              New chat
            </button>
          )}
        </div>
      </div>

      {/* History view */}
      {showHistory ? (
        <div className="flex-1 overflow-y-auto pb-4 min-h-0">
          {conversations.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">
                <ChatIcon />
              </div>
              <p className="text-sm text-text-secondary font-medium">
                No conversations yet
              </p>
              <p className="text-xs text-text-tertiary mt-1">
                Start a chat to see your history here.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {conversations.map((convo) => (
                <div
                  key={convo.id}
                  className={`bg-surface rounded-card shadow-card px-4 py-3 cursor-pointer flex items-center justify-between gap-3 ${
                    convo.id === activeId ? "ring-1 ring-teal/30" : ""
                  }`}
                  onClick={() => openConversation(convo.id)}
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-text-primary font-medium truncate">
                      {convo.title}
                    </p>
                    <p className="text-xs text-text-tertiary mt-0.5">
                      {convo.messages.length} {convo.messages.length === 1 ? "message" : "messages"} &middot; {formatConvoDate(convo.updatedAt)}
                    </p>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(convo.id);
                    }}
                    className="text-text-tertiary bg-transparent border-none cursor-pointer p-1 flex-shrink-0"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <>
      {/* Messages area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto pb-4 min-h-0">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-full px-4">
            <div className="w-[52px] h-[52px] rounded-full flex items-center justify-center mb-4"
              style={{
                background: "linear-gradient(135deg, #1a4b58, #0f2d3a)",
              }}
            >
              <ChatIcon />
            </div>
            <h2 className="heading-serif text-[20px] text-text-primary mb-1">
              Career Coach
            </h2>
            <p className="text-sm text-text-secondary text-center mb-6 max-w-[280px]">
              Ask me anything about your job search, pipeline, or career strategy.
            </p>

            <div className="w-full max-w-[340px] flex flex-col gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage(s)}
                  className="text-left px-4 py-3 bg-surface rounded-card shadow-card text-sm text-text-secondary cursor-pointer border-none hover:shadow-card-hover transition-shadow"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-teal text-white rounded-br-md"
                      : "bg-surface shadow-card text-text-primary rounded-bl-md"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <AssistantContent
                      content={msg.content}
                      isStreaming={streaming && msg.id === messages[messages.length - 1]?.id}
                    />
                  ) : (
                    <span className="whitespace-pre-wrap">{msg.content}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 pb-2 pt-2">
        <div className="flex items-end gap-2 bg-surface rounded-2xl shadow-card px-3 py-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about your job search..."
            rows={1}
            className="flex-1 bg-transparent border-none outline-none text-sm text-text-primary placeholder:text-text-tertiary resize-none leading-relaxed"
            style={{ fontFamily: "inherit", maxHeight: 120 }}
            disabled={streaming}
          />
          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || streaming}
            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-none cursor-pointer transition-colors ${
              input.trim() && !streaming
                ? "bg-teal text-white"
                : "bg-surface-alt text-text-tertiary"
            }`}
          >
            {streaming ? (
              <div className="w-4 h-4 border-2 border-text-tertiary border-t-teal rounded-full spinner" />
            ) : (
              <SendIcon />
            )}
          </button>
        </div>
      </div>
        </>
      )}
    </div>
  );
}

// ── Markdown-lite renderer for assistant messages ──

function AssistantContent({
  content,
  isStreaming,
}: {
  content: string;
  isStreaming: boolean;
}) {
  if (!content && isStreaming) {
    return (
      <span className="inline-flex items-center gap-1.5 text-text-tertiary">
        <span className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse" />
        <span
          className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse"
          style={{ animationDelay: "0.2s" }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full bg-teal animate-pulse"
          style={{ animationDelay: "0.4s" }}
        />
      </span>
    );
  }

  // Simple markdown rendering: bold, bullets, line breaks
  const lines = content.split("\n");
  return (
    <div className="whitespace-pre-wrap">
      {lines.map((line, i) => {
        const trimmed = line.trimStart();

        // Bullet points
        if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
          return (
            <div key={i} className="flex gap-2 ml-1">
              <span className="text-teal flex-shrink-0 mt-0.5">&bull;</span>
              <span>{renderInline(trimmed.slice(2))}</span>
            </div>
          );
        }

        // Numbered lists
        const numMatch = trimmed.match(/^(\d+)\.\s/);
        if (numMatch) {
          return (
            <div key={i} className="flex gap-2 ml-1">
              <span className="text-teal flex-shrink-0 font-mono text-xs mt-0.5">
                {numMatch[1]}.
              </span>
              <span>{renderInline(trimmed.slice(numMatch[0].length))}</span>
            </div>
          );
        }

        // Headers
        if (trimmed.startsWith("### ")) {
          return (
            <p key={i} className="font-semibold text-text-primary mt-3 mb-1">
              {renderInline(trimmed.slice(4))}
            </p>
          );
        }
        if (trimmed.startsWith("## ")) {
          return (
            <p key={i} className="font-bold text-text-primary mt-3 mb-1">
              {renderInline(trimmed.slice(3))}
            </p>
          );
        }

        // Empty lines
        if (!trimmed) return <br key={i} />;

        // Regular text
        return (
          <span key={i}>
            {renderInline(line)}
            {i < lines.length - 1 ? "\n" : ""}
          </span>
        );
      })}
      {isStreaming && (
        <span className="inline-block w-0.5 h-4 bg-teal ml-0.5 animate-pulse align-text-bottom" />
      )}
    </div>
  );
}

function renderInline(text: string): React.ReactNode {
  // Handle **bold** markers
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-text-primary">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}
