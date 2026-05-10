"use client";

import {
  useState,
  useEffect,
  useLayoutEffect,
  useRef,
  useCallback,
} from "react";

const uid = () => Math.random().toString(36).slice(2);

const botMsg = (text, quickReplies, propertyResults) => ({
  id: uid(),
  role: "bot",
  text,
  time: new Date(),
  quickReplies,
  propertyResults,
});

const userMsg = (text) => ({
  id: uid(),
  role: "user",
  text,
  time: new Date(),
});

function matchQA(input, list) {
  const lower = input.toLowerCase();
  let best = null;
  let bestScore = 0;
  for (const qa of list) {
    let score = 0;
    for (const kw of qa.keywords || []) {
      if (lower.includes(String(kw).toLowerCase())) score += String(kw).length;
    }
    if (
      String(qa.question || "")
        .toLowerCase()
        .split(" ")
        .some((w) => lower.includes(w) && w.length > 3)
    )
      score += 2;
    if (score > bestScore) {
      bestScore = score;
      best = qa;
    }
  }
  return bestScore > 0 ? best : null;
}

const fmtTime = (d) =>
  d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

/** Short intro for property-search; listing details render as cards below. */
function buildPropertySearchIntro(json) {
  const intent = json.intent || {};
  const data = json.data || [];
  const locParts = [];
  if (intent.bedrooms != null) locParts.push(`${intent.bedrooms} BHK`);
  if (intent.city) locParts.push(intent.city);
  const loc = locParts.length ? locParts.join(" · ") : "your search";

  if (data.length === 0) {
    return `I could not find active listings for **${loc}** right now.\n\nUse **Open all matching listings** to open the directory with filters, or ask for a **callback**.`;
  }

  return `Here are **${data.length}** curated matches for **${loc}**. Each card shows the **name**, **price**, and **specification** — tap **View property** to open the full listing.\n\nYou can also use **Open all matching listings** for the full directory.`;
}

const CHAT_THREAD_TTL_MS = 7 * 24 * 60 * 60 * 1000;

const chatThreadStorageKey = (variant) => `gr-chatbot-thread:${variant}`;

function loadChatThread(variant) {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(chatThreadStorageKey(variant));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed.savedAt !== "number" ||
      !Array.isArray(parsed.messages) ||
      parsed.messages.length === 0
    ) {
      return null;
    }
    if (Date.now() - parsed.savedAt > CHAT_THREAD_TTL_MS) {
      localStorage.removeItem(chatThreadStorageKey(variant));
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function serializeMessagesForStorage(messages) {
  return messages.map((m) => ({
    ...m,
    time: m.time instanceof Date ? m.time.toISOString() : m.time,
  }));
}

function reviveMessagesFromStorage(messages) {
  if (!Array.isArray(messages)) return [];
  return messages.map((m) => ({
    ...m,
    time: m.time ? new Date(m.time) : new Date(),
  }));
}

function saveChatThread(variant, snapshot) {
  if (typeof window === "undefined") return;
  const { messages, flow, leadName, leadQuery, lastListingsUrl } = snapshot;
  if (!messages?.length) return;
  try {
    localStorage.setItem(
      chatThreadStorageKey(variant),
      JSON.stringify({
        savedAt: Date.now(),
        messages: serializeMessagesForStorage(messages),
        flow: flow || "chat",
        leadName: leadName || "",
        leadQuery: leadQuery || "",
        lastListingsUrl: lastListingsUrl || "",
      }),
    );
  } catch {
    /* quota / private mode */
  }
}

const VARIANT_CONFIG = {
  website: {
    assistantTitle: "Global Realty Assistant",
    greet:
      "👋 Hi there! I'm **Global Realty Assistant**. I'm here to help with listings, site visits, and property questions.\n\nHow can I help you today?",
    defaultQuick: [
      "Browse properties",
      "Contact us",
      "Schedule a visit",
      "RERA & documentation",
      "Get a callback",
    ],
    applyHref: "/contact",
    poweredBy: "Global Realty Assistant",
    subBadges: [
      { icon: "⚡", text: "Quick responses" },
      { icon: "🔒", text: "Your privacy" },
      { icon: "💰", text: "Transparent info" },
    ],
  },
  admin: {
    assistantTitle: "Admin Assistant",
    greet:
      "👋 Hi! I'm **Admin Assistant**. I can point you to CMS, properties, inquiries, and site settings.\n\nWhat would you like to do?",
    defaultQuick: [
      "Open properties",
      "Open inquiries",
      "Site config",
      "CMS — Help center",
      "Add property",
    ],
    applyHref: "/admin-properties/add",
    poweredBy: "Admin Assistant",
    subBadges: [
      { icon: "⚡", text: "Admin tips" },
      { icon: "🔒", text: "Secure panel" },
      { icon: "💰", text: "Listings" },
    ],
  },
};

/** Panel animates from FAB size at bottom-right (see `transform` + `transformOrigin`). */
const CHAT_PANEL_DESIGN_WIDTH = 380;
const CHAT_LAUNCHER_SIZE = 60;
const CHAT_PANEL_CLOSED_SCALE = CHAT_LAUNCHER_SIZE / CHAT_PANEL_DESIGN_WIDTH;

/**
 * Floating chatbot — same UX as CHATBOT_FULL_REPLICATE_SPEC (Payloan-style).
 * @param {{ variant?: "website" | "admin" }} props
 */
export default function ChatbotWidget({ variant = "website" }) {
  const cfg = VARIANT_CONFIG[variant] || VARIANT_CONFIG.website;

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [qaList, setQaList] = useState([]);
  const [flow, setFlow] = useState("chat");
  const [leadName, setLeadName] = useState("");
  const [leadQuery, setLeadQuery] = useState("");
  const [unread, setUnread] = useState(0);
  const [greeted, setGreeted] = useState(false);
  const [chatHydrated, setChatHydrated] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef(null);
  const messagesScrollRef = useRef(null);
  const inputRef = useRef(null);
  const prevMsgLen = useRef(0);
  /** After we pin scroll for the opening greet, do not force scrollTop again until the thread changes. */
  const openingGreetPinnedIdRef = useRef(null);
  /** Message count after last scroll layout pass — detect when a bot reply just finished. */
  const scrollLayoutPrevLenRef = useRef(0);
  /** Top of bot text bubble per message — align that edge to vertical center of the thread. */
  const botAnswerStartRefs = useRef(new Map());
  const lastListingsUrlRef = useRef("");

  useEffect(() => {
    fetch("/api/chatbot/faqs")
      .then((r) => r.json())
      .then((d) => setQaList(d.data ?? []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const { body } = document;
    if (variant === "website") {
      if (isOpen) body.dataset.chatbotOpen = "1";
      else delete body.dataset.chatbotOpen;
    }
    return () => {
      if (variant === "website") delete body.dataset.chatbotOpen;
    };
  }, [isOpen, variant]);

  useEffect(() => {
    const data = loadChatThread(variant);
    if (data?.messages?.length) {
      const revived = reviveMessagesFromStorage(data.messages);
      setMessages(revived);
      setFlow(typeof data.flow === "string" ? data.flow : "chat");
      setLeadName(typeof data.leadName === "string" ? data.leadName : "");
      setLeadQuery(typeof data.leadQuery === "string" ? data.leadQuery : "");
      lastListingsUrlRef.current =
        typeof data.lastListingsUrl === "string" ? data.lastListingsUrl : "";
      setGreeted(true);
      prevMsgLen.current = revived.length;
      scrollLayoutPrevLenRef.current = revived.length;
    }
    setChatHydrated(true);
  }, [variant]);

  useLayoutEffect(() => {
    const scrollEl = messagesScrollRef.current;
    if (!scrollEl) return;

    if (messages.length === 0) {
      openingGreetPinnedIdRef.current = null;
      scrollEl.scrollTop = 0;
      scrollLayoutPrevLenRef.current = 0;
      botAnswerStartRefs.current.clear();
      return;
    }

    const hasUserMessage = messages.some((m) => m.role === "user");
    const first = messages[0];
    const onlyOpeningGreet =
      !hasUserMessage &&
      messages.length === 1 &&
      first?.role === "bot" &&
      !isTyping;

    if (onlyOpeningGreet) {
      if (openingGreetPinnedIdRef.current !== first.id) {
        openingGreetPinnedIdRef.current = first.id;
        scrollEl.scrollTop = 0;
      }
      scrollLayoutPrevLenRef.current = messages.length;
      return;
    }

    openingGreetPinnedIdRef.current = null;

    const last = messages[messages.length - 1];
    const grew = messages.length > scrollLayoutPrevLenRef.current;
    const newBotReplyFinished =
      grew && last?.role === "bot" && !isTyping;

    scrollLayoutPrevLenRef.current = messages.length;

    if (newBotReplyFinished) {
      requestAnimationFrame(() => {
        const bubble = botAnswerStartRefs.current.get(last.id);
        if (!bubble) return;
        const top =
          bubble.getBoundingClientRect().top -
          scrollEl.getBoundingClientRect().top +
          scrollEl.scrollTop;
        const half = scrollEl.clientHeight / 2;
        const maxScroll = Math.max(
          0,
          scrollEl.scrollHeight - scrollEl.clientHeight,
        );
        const nextTop = Math.max(0, Math.min(maxScroll, top - half));
        scrollEl.scrollTo({ top: nextTop, behavior: "smooth" });
      });
      return;
    }

    requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    });
  }, [messages, isTyping]);

  useEffect(() => {
    if (!chatHydrated || typeof window === "undefined") return;
    if (!messages.length) return;
    saveChatThread(variant, {
      messages,
      flow,
      leadName,
      leadQuery,
      lastListingsUrl: lastListingsUrlRef.current,
    });
  }, [chatHydrated, variant, messages, flow, leadName, leadQuery]);

  const addBotMessage = useCallback((text, quickReplies, propertyResults) => {
    setMessages((prev) => [...prev, botMsg(text, quickReplies, propertyResults)]);
  }, []);

  const simulateTypingThenReply = useCallback(
    (text, quickReplies, propertyResults) => {
      setIsTyping(true);
      const nCards = propertyResults?.length || 0;
      const delay = Math.min(
        600 + text.length * 10 + nCards * 140,
        2400,
      );
      setTimeout(() => {
        setIsTyping(false);
        addBotMessage(text, quickReplies, propertyResults);
      }, delay);
    },
    [addBotMessage],
  );

  useEffect(() => {
    if (!chatHydrated) return;
    if (isOpen && !greeted) {
      setGreeted(true);
      setUnread(0);
      const quickReplies = qaList
        .filter((q) => q.isQuickReply)
        .map((q) => q.question)
        .slice(0, 5);
      const defaults = cfg.defaultQuick;
      setTimeout(() => {
        addBotMessage(
          cfg.greet,
          quickReplies.length ? quickReplies : defaults,
        );
      }, 400);
    }
    if (isOpen) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen, greeted, chatHydrated, qaList, addBotMessage, cfg]);

  const handleSend = useCallback(
    async (textArg) => {
      const val = (textArg ?? input).trim();
      if (!val) return;
      setInput("");
      setMessages((prev) => [...prev, userMsg(val)]);

      if (flow === "ask-name") {
        setLeadName(val);
        setFlow("ask-phone");
        simulateTypingThenReply(
          `Nice to meet you, **${val}**! 😊\n\nWhat's your phone number so we can reach you?`,
        );
        return;
      }

      if (flow === "ask-phone") {
        fetch("/api/chatbot/lead", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: leadName,
            phone: val,
            query: leadQuery,
            source: variant === "admin" ? "admin" : "website",
          }),
        });
        setFlow("done");
        simulateTypingThenReply(
          `✅ **Perfect!** We've saved your details.\n\nOur team will reach **${leadName}** at **${val}** soon.\n\nIs there anything else I can help you with?`,
          ["Yes, I have more questions", "No, thanks!"],
        );
        return;
      }

      if (flow === "done" && val.toLowerCase().includes("no")) {
        simulateTypingThenReply(
          "Great! Have a wonderful day! 😊\n\nFeel free to chat anytime.",
        );
        return;
      }

      if (flow === "done") {
        setFlow("chat");
      }

      const lowerVal = val.toLowerCase();
      const callbackKeywords = [
        "callback",
        "call me",
        "contact me",
        "call back",
        "reach me",
        "speak",
      ];
      if (callbackKeywords.some((k) => lowerVal.includes(k))) {
        setLeadQuery(val);
        setFlow("ask-name");
        simulateTypingThenReply(
          "Sure! I'd love to have someone call you back. 📞\n\nCould you please share your **name**?",
        );
        return;
      }

      if (variant === "website") {
        try {
          const res = await fetch(
            `/api/chatbot/property-search?q=${encodeURIComponent(val)}`,
          );
          const json = await res.json();
          if (json.success && json.matched) {
            setLeadQuery(val);
            lastListingsUrlRef.current = json.moreUrl || "/properties";
            const listings = Array.isArray(json.data) ? json.data : [];
            simulateTypingThenReply(
              buildPropertySearchIntro(json),
              [
                "Open all matching listings",
                "Get a callback",
                "Something else",
              ],
              listings.length ? listings : undefined,
            );
            return;
          }
        } catch {
          /* fall through to FAQ */
        }
      }

      const match = matchQA(val, qaList);
      if (match) {
        setLeadQuery(val);
        const followup = [
          "Want to know more?",
          "Ask me anything else",
          "Get a callback",
        ];
        simulateTypingThenReply(match.answer, followup);
        return;
      }

      if (
        lowerVal.includes("apply") ||
        lowerVal.includes("start") ||
        lowerVal.includes("get loan") ||
        lowerVal.includes("list property")
      ) {
        simulateTypingThenReply(
          "🚀 You can take the next step right from here.\n\n**Use the button below:**",
          ["Apply Now →", "Talk to an advisor", "Browse properties"],
        );
        return;
      }

      setLeadQuery(val);
      simulateTypingThenReply(
        "I didn't quite catch that. 🤔\n\nWould you like a **callback**?",
        ["Yes, call me back!", "No thanks", "See options"],
      );
    },
    [flow, input, leadName, leadQuery, qaList, simulateTypingThenReply, cfg, variant],
  );

  const handleQuickReply = (qr) => {
    if (qr === "Apply Now →" || qr === "Apply Now") {
      if (typeof window !== "undefined")
        window.location.href = cfg.applyHref;
      return;
    }
    if (qr === "Open all matching listings" && lastListingsUrlRef.current) {
      if (typeof window !== "undefined")
        window.location.href = lastListingsUrlRef.current;
      return;
    }
    if (qr === "Something else") {
      setMessages((prev) => [...prev, userMsg(qr)]);
      simulateTypingThenReply(
        "Sure — tell me what you are looking for (**city**, **BHK**, **budget**, rent or sale), or pick **Get a callback**.",
        ["Get a callback", "Browse properties"],
      );
      return;
    }
    if (
      qr === "Yes, call me back!" ||
      qr === "Get a callback" ||
      qr === "Talk to an advisor"
    ) {
      setMessages((prev) => [...prev, userMsg(qr)]);
      setLeadQuery(qr);
      setFlow("ask-name");
      simulateTypingThenReply(
        "Sure! Could you please share your **name**? 😊",
      );
      return;
    }
    if (qr === "No, thanks!" || qr === "No thanks") {
      setMessages((prev) => [...prev, userMsg(qr)]);
      simulateTypingThenReply(
        "No problem! Feel free to chat anytime. Have a great day! 🌟",
      );
      return;
    }
    if (variant === "admin") {
      const routes = {
        "Open properties": "/admin-properties",
        "Open inquiries": "/admin-inquiries",
        "Site config": "/admin-site-config",
        "CMS — Help center": "/cms/help-center",
        "Add property": "/admin-properties/add",
      };
      if (routes[qr] && typeof window !== "undefined") {
        window.location.href = routes[qr];
        return;
      }
    }
    handleSend(qr);
  };

  useEffect(() => {
    if (!isOpen && messages.length > prevMsgLen.current) {
      const newBotMsgs = messages
        .slice(prevMsgLen.current)
        .filter((m) => m.role === "bot" && !m.isTyping).length;
      if (newBotMsgs > 0) setUnread((u) => u + newBotMsgs);
    }
    prevMsgLen.current = messages.length;
  }, [messages, isOpen]);

  const renderText = (text) => {
    const linkify = (segment, keyPrefix) => {
      const chunks = String(segment).split(/(\/property-detail\/[^\s]+)/g);
      return chunks.map((chunk, j) => {
        if (chunk.startsWith("/property-detail/")) {
          return (
            <a
              key={`${keyPrefix}-l-${j}`}
              href={chunk}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: "inherit",
                fontWeight: 600,
                textDecoration: "underline",
              }}
            >
              {chunk}
            </a>
          );
        }
        return chunk;
      });
    };

    const parts = String(text).split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) =>
      p.startsWith("**") && p.endsWith("**") ? (
        <strong key={i}>{p.slice(2, -2)}</strong>
      ) : (
        <span key={i}>{linkify(p, `t-${i}`)}</span>
      ),
    );
  };

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open chat"
          style={{
            position: "fixed",
            bottom: 28,
            right: 28,
            zIndex: 9999,
            width: 60,
            height: 60,
            borderRadius: "50%",
            border: "none",
            background: "var(--chatbot-gradient-duo)",
            boxShadow: "var(--chatbot-shadow-lg)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s cubic-bezier(.4,0,.2,1)",
            transform: "scale(1)",
          }}
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fff"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}

      {!isOpen && (
        <span
          style={{
            position: "fixed",
            bottom: 28,
            right: 28,
            zIndex: 9998,
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "var(--chatbot-pulse-ring)",
            animation: "chatPulse 2s ease-out infinite",
            pointerEvents: "none",
          }}
        />
      )}

      <div
        style={{
          position: "fixed",
          bottom: 28,
          right: 28,
          zIndex: 9999,
          width: CHAT_PANEL_DESIGN_WIDTH,
          maxWidth: "calc(100vw - 40px)",
          boxSizing: "border-box",
          borderRadius: 20,
          overflow: "hidden",
          overflowX: "hidden",
          boxShadow: "0 24px 80px rgba(0,0,0,0.20)",
          background: "#fff",
          transform: isOpen
            ? "scale(1) translateY(0)"
            : `scale(${CHAT_PANEL_CLOSED_SCALE}) translateY(0)`,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "all" : "none",
          transition: "all 0.3s cubic-bezier(.4,0,.2,1)",
          transformOrigin: "bottom right",
          display: "flex",
          flexDirection: "column",
          maxHeight: "78vh",
          minWidth: 0,
        }}
      >
        <div
          style={{
            background: "var(--chatbot-gradient-trio)",
            padding: "18px 20px",
            position: "relative",
            overflow: "hidden",
            flexShrink: 0,
          }}
        >
          <svg
            aria-hidden
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
            viewBox="0 0 380 80"
            preserveAspectRatio="xMidYMid slice"
          >
            <circle cx="340" cy="-10" r="70" fill="rgba(255,255,255,0.07)" />
            <circle cx="20" cy="80" r="50" fill="rgba(255,255,255,0.05)" />
          </svg>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              position: "relative",
              zIndex: 1,
            }}
          >
            <div
              style={{
                width: 46,
                height: 46,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                border: "2px solid rgba(255,255,255,0.3)",
                flexShrink: 0,
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" fill="#fff" />
                <path
                  d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0, overflow: "hidden" }}>
              <div
                style={{
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: 16,
                  lineHeight: 1.2,
                  wordBreak: "break-word",
                  overflowWrap: "anywhere",
                }}
              >
                {cfg.assistantTitle}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  marginTop: 2,
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: "#4ade80",
                    display: "inline-block",
                    boxShadow: "0 0 0 2px rgba(74,222,128,0.3)",
                  }}
                />
                <span
                  style={{ color: "rgba(255,255,255,0.80)", fontSize: 12 }}
                >
                  Online · Replies instantly
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "none",
                borderRadius: "50%",
                width: 30,
                height: 30,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2.5"
                strokeLinecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div
            style={{
              display: "flex",
              gap: 16,
              marginTop: 12,
              position: "relative",
              zIndex: 1,
              flexWrap: "wrap",
            }}
          >
            {cfg.subBadges.map((b) => (
              <div
                key={b.text}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  background: "rgba(255,255,255,0.12)",
                  padding: "3px 10px",
                  borderRadius: 20,
                }}
              >
                <span style={{ fontSize: 11 }}>{b.icon}</span>
                <span
                  style={{
                    color: "rgba(255,255,255,0.90)",
                    fontSize: 11,
                    fontWeight: 600,
                  }}
                >
                  {b.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div
          ref={messagesScrollRef}
          style={{
            flex: 1,
            minHeight: 0,
            minWidth: 0,
            overflowY: "auto",
            overflowX: "hidden",
            padding: "16px 14px",
            background: "linear-gradient(180deg, #f8f8ff 0%, #fff 100%)",
            display: "flex",
            flexDirection: "column",
            gap: 6,
            scrollbarWidth: "thin",
            scrollbarColor: "#e0e0f0 transparent",
          }}
        >
          {messages.length === 0 && (
            <div
              style={{ textAlign: "center", padding: "32px 16px", color: "#aaa" }}
            >
              <div style={{ fontSize: 36, marginBottom: 8 }}>💬</div>
              <div style={{ fontSize: 14, color: "#bbb" }}>
                Start the conversation!
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              style={{
                display: "flex",
                flexDirection: msg.role === "user" ? "row-reverse" : "row",
                alignItems: "flex-end",
                gap: 8,
                marginBottom: 2,
                minWidth: 0,
                maxWidth: "100%",
              }}
            >
              {msg.role === "bot" && (
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: "50%",
                    background: "var(--chatbot-gradient-duo)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    marginBottom: 2,
                  }}
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle cx="12" cy="8" r="4" fill="#fff" />
                    <path
                      d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
                      stroke="#fff"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
              )}

              <div
                style={{
                  maxWidth: "min(78%, 100%)",
                  minWidth: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  ref={
                    msg.role === "bot"
                      ? (el) => {
                          if (el) botAnswerStartRefs.current.set(msg.id, el);
                          else botAnswerStartRefs.current.delete(msg.id);
                        }
                      : undefined
                  }
                  style={{
                    padding: "10px 14px",
                    borderRadius:
                      msg.role === "user"
                        ? "18px 18px 4px 18px"
                        : "18px 18px 18px 4px",
                    background:
                      msg.role === "user"
                        ? "var(--chatbot-gradient-duo)"
                        : "#fff",
                    color: msg.role === "user" ? "#fff" : "#333",
                    fontSize: 14,
                    lineHeight: 1.6,
                    border: msg.role === "bot" ? "1.5px solid #f0f0f8" : "none",
                    boxShadow:
                      msg.role === "bot"
                        ? "0 2px 8px rgba(0,0,0,0.05)"
                        : "var(--chatbot-shadow-user)",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    overflowWrap: "anywhere",
                    maxWidth: "100%",
                  }}
                >
                  {renderText(msg.text)}
                </div>

                {msg.role === "bot" &&
                  Array.isArray(msg.propertyResults) &&
                  msg.propertyResults.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                        marginTop: 2,
                        maxWidth: "100%",
                        minWidth: 0,
                      }}
                    >
                      {msg.propertyResults.map((p) => (
                        <div
                          key={p.slug}
                          style={{
                            borderRadius: 14,
                            border: "1px solid #e8e8f2",
                            background:
                              "linear-gradient(145deg, #ffffff 0%, #fafbff 100%)",
                            padding: "12px 14px",
                            boxShadow: "0 4px 14px rgba(15,23,42,0.06)",
                            maxWidth: "100%",
                            minWidth: 0,
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 800,
                              fontSize: 14,
                              lineHeight: 1.35,
                              color: "#1a1a2e",
                              marginBottom: 6,
                              wordBreak: "break-word",
                            }}
                          >
                            {p.title}
                          </div>
                          <div
                            style={{
                              fontSize: 15,
                              fontWeight: 700,
                              color: "var(--chatbot-base)",
                              marginBottom: 8,
                              letterSpacing: "0.01em",
                            }}
                          >
                            {p.priceDisplay || "—"}
                          </div>
                          <div
                            style={{
                              fontSize: 12,
                              lineHeight: 1.45,
                              color: "#5c5c6e",
                              marginBottom: 12,
                              display: "-webkit-box",
                              WebkitLineClamp: 4,
                              WebkitBoxOrient: "vertical",
                              overflow: "hidden",
                              wordBreak: "break-word",
                            }}
                          >
                            {p.specification || "—"}
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              if (typeof window !== "undefined") {
                                window.location.href = `/property-detail/${p.slug}`;
                              }
                            }}
                            style={{
                              width: "100%",
                              padding: "10px 12px",
                              borderRadius: 10,
                              border: "none",
                              cursor: "pointer",
                              fontSize: 13,
                              fontWeight: 700,
                              color: "#fff",
                              background: "var(--chatbot-gradient-duo)",
                              boxShadow: "0 4px 12px rgba(240,115,74,0.35)",
                            }}
                          >
                            View property
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                {msg.quickReplies && msg.quickReplies.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 6,
                      marginTop: 4,
                      maxWidth: "100%",
                      minWidth: 0,
                    }}
                  >
                    {msg.quickReplies.map((qr) => (
                      <button
                        type="button"
                        key={qr}
                        onClick={() => handleQuickReply(qr)}
                        style={{
                          padding: "6px 12px",
                          borderRadius: 20,
                          fontSize: 12,
                          fontWeight: 600,
                          border: "1.5px solid var(--chatbot-base)",
                          background: "transparent",
                          color: "var(--chatbot-base)",
                          cursor: "pointer",
                          transition: "all 0.2s",
                          whiteSpace: "normal",
                          textAlign: "left",
                          maxWidth: "100%",
                          wordBreak: "break-word",
                          overflowWrap: "anywhere",
                          lineHeight: 1.35,
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background =
                            "var(--chatbot-base)";
                          e.currentTarget.style.color = "#fff";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "var(--chatbot-base)";
                        }}
                      >
                        {qr}
                      </button>
                    ))}
                  </div>
                )}

                <span
                  style={{
                    fontSize: 10,
                    color: "#ccc",
                    textAlign: msg.role === "user" ? "right" : "left",
                    paddingRight: 4,
                  }}
                >
                  {fmtTime(msg.time)}
                </span>
              </div>
            </div>
          ))}

          {isTyping && (
            <div style={{ display: "flex", alignItems: "flex-end", gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "var(--chatbot-gradient-duo)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle cx="12" cy="8" r="4" fill="#fff" />
                  <path
                    d="M4 20c0-4 3.6-7 8-7s8 3 8 7"
                    stroke="#fff"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div
                style={{
                  background: "#fff",
                  border: "1.5px solid #f0f0f8",
                  padding: "12px 16px",
                  borderRadius: "18px 18px 18px 4px",
                  display: "flex",
                  gap: 5,
                  alignItems: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: "50%",
                      background: "var(--chatbot-base)",
                      display: "inline-block",
                      animation: `chatBounce 1.2s ${i * 0.2}s ease-in-out infinite`,
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div
          style={{
            borderTop: "1px solid #f0f0f8",
            background: "#fff",
            padding: "10px 14px",
            display: "flex",
            gap: 8,
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={
              flow === "ask-name"
                ? "Enter your name…"
                : flow === "ask-phone"
                  ? "Enter your phone number…"
                  : "Type a message…"
            }
            style={{
              flex: 1,
              border: "1.5px solid #e8e8f5",
              borderRadius: 24,
              padding: "10px 16px",
              fontSize: 14,
              outline: "none",
              background: "#fafafe",
              transition: "border-color 0.2s",
              color: "#333",
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--chatbot-base)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#e8e8f5";
            }}
          />
          <button
            type="button"
            onClick={() => handleSend()}
            disabled={!input.trim()}
            style={{
              width: 40,
              height: 40,
              borderRadius: "50%",
              border: "none",
              background: input.trim()
                ? "var(--chatbot-gradient-duo)"
                : "#e8e8f5",
              cursor: input.trim() ? "pointer" : "not-allowed",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
              flexShrink: 0,
              boxShadow: input.trim()
                ? "var(--chatbot-shadow-send)"
                : "none",
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke={input.trim() ? "#fff" : "#bbb"}
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>

        <div
          style={{
            background: "#fafafe",
            borderTop: "1px solid #f5f5ff",
            padding: "6px 14px",
            textAlign: "center",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 10, color: "#ccc" }}>Powered by </span>
          <span
            style={{
              fontSize: 10,
              color: "var(--chatbot-base)",
              fontWeight: 700,
            }}
          >
            {cfg.poweredBy}
          </span>
          <span style={{ fontSize: 10, color: "#ccc" }}> · Secure chat</span>
        </div>
      </div>

      <style>{`
        @keyframes chatPulse {
          0%   { transform: scale(1);   opacity: 0.6; }
          70%  { transform: scale(1.7); opacity: 0;   }
          100% { transform: scale(1.7); opacity: 0;   }
        }
        @keyframes chatBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30%            { transform: translateY(-6px); }
        }
      `}</style>
    </>
  );
}
