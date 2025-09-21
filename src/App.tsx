// src/App.tsx
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, Navigate } from "react-router-dom";

/**
 * Aura Quest — Prototype (patched for TypeScript build)
 *
 * Notes:
 * - Save as src/App.tsx
 * - Tailwind + PostCSS configs assumed (index.css contains Tailwind directives)
 */

/* ---------- Types ---------- */
type Quest = { id: number; title: string; xp: number; completed: boolean };
type Suggestion = { id: number; title: string; xp: number };

/* ---------- App ---------- */
export default function AuraQuestApp() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white p-6 text-slate-800">
        <AppHeader />
        <main className="max-w-6xl mx-auto mt-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/quests" element={<QuestsPage />} />
            <Route path="/leaderboard" element={<Leaderboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/game" element={<MiniGame />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <footer className="max-w-6xl mx-auto mt-8 text-center text-sm text-slate-500">© Aura Quest — Prototype</footer>
      </div>
    </Router>
  );
}

/* ---------- Header / Nav ---------- */
function AppHeader() {
  return (
    <header className="max-w-6xl mx-auto flex items-center justify-between py-4">
      <div className="flex items-center gap-4">
        <div className="bg-indigo-600 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold">AQ</div>
        <div>
          <h1 className="text-xl font-semibold">Aura Quest</h1>
          <p className="text-sm text-slate-500">Gamified mental wellness for youth</p>
        </div>
      </div>
      <nav className="flex items-center gap-2">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/quests">Quests</NavLink>
        <NavLink to="/game">Game</NavLink>
        <NavLink to="/leaderboard">Leaderboard</NavLink>
        <NavLink to="/profile">Profile</NavLink>
      </nav>
    </header>
  );
}

function NavLink({ to, children }: { to: string; children: React.ReactNode }) {
  return (
    <Link to={to} className="px-3 py-2 rounded-lg bg-white shadow text-sm">
      {children}
    </Link>
  );
}

/* ---------- Helpers ---------- */
function simulateAiSuggestion(userMood: string): Suggestion[] {
  const pool: Record<string, string[]> = {
    happy: [
      "Share a small win with a friend (5 min)",
      "Teach someone a simple breathing exercise",
      "Write 3 things that made you smile today",
    ],
    neutral: [
      "Write a 2-minute gratitude note",
      "Take a 10-minute mindful walk",
      "Do a 5-minute body scan meditation",
    ],
    sad: [
      "Write a letter to yourself with kindness",
      "Call someone you trust for a 10-minute chat",
      "Try 5 minutes of grounding exercises",
    ],
    tired: [
      "Take a 15-minute power nap or rest",
      "Do gentle stretches for 10 minutes",
      "Sip a warm drink and practice 3 deep breaths",
    ],
  };
  const list = pool[userMood] || pool.neutral;
  const shuffled = list.slice().sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 2).map((title, idx) => ({ id: Date.now() + idx, title, xp: 20 + Math.floor(Math.random() * 20) }));
}

function avatarForXp(xp: number, style: string) {
  if (xp >= 500) return { face: "✨", label: "Radiant" };
  if (xp >= 200) return { face: ":D", label: "Energetic" };
  return style === "cute" ? { face: "^_^", label: "Cute" } : style === "minimal" ? { face: ":|", label: "Calm" } : { face: ":)", label: "Fresh" };
}

/* ---------- Dashboard ---------- */
function Dashboard() {
  const navigate = useNavigate();

  const defaultQuests: Quest[] = [
    { id: 1, title: "Morning Mindful Breathing", xp: 20, completed: false },
    { id: 2, title: "Gratitude Journal (3 items)", xp: 15, completed: false },
    { id: 3, title: "Stretch + Walk (10 min)", xp: 25, completed: false },
  ];

  const [quests, setQuests] = useState<Quest[]>(() => {
    try {
      const raw = localStorage.getItem("aq_quests");
      return raw ? (JSON.parse(raw) as Quest[]) : defaultQuests;
    } catch {
      return defaultQuests;
    }
  });

  const [xp, setXp] = useState<number>(() => Number(localStorage.getItem("aq_xp") || 120));
  const [level, setLevel] = useState<number>(() => Number(localStorage.getItem("aq_level") || 3));
  const [streak, setStreak] = useState<number>(() => Number(localStorage.getItem("aq_streak") || 5));
  const [journalOpen, setJournalOpen] = useState<boolean>(false);
  const [journalText, setJournalText] = useState<string>("");
  const [mood, setMood] = useState<string>(() => localStorage.getItem("aq_mood") || "neutral");
  const [aiSuggestions, setAiSuggestions] = useState<Suggestion[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("aq_ai_suggestions") || "[]") as Suggestion[];
    } catch {
      return [];
    }
  });

  // Keep only the value if setter isn't used here
  const [avatarStyle] = useState<string>(() => localStorage.getItem("aq_avatar") || "default");

  // Persist
  useEffect(() => {
    localStorage.setItem("aq_quests", JSON.stringify(quests));
  }, [quests]);
  useEffect(() => {
    localStorage.setItem("aq_xp", String(xp));
  }, [xp]);
  useEffect(() => {
    localStorage.setItem("aq_level", String(level));
  }, [level]);
  useEffect(() => {
    localStorage.setItem("aq_streak", String(streak));
  }, [streak]);
  useEffect(() => {
    localStorage.setItem("aq_mood", mood);
  }, [mood]);
  useEffect(() => {
    localStorage.setItem("aq_ai_suggestions", JSON.stringify(aiSuggestions));
  }, [aiSuggestions]);
  useEffect(() => {
    localStorage.setItem("aq_avatar", avatarStyle);
  }, [avatarStyle]);

  // Sync: listen to custom events and storage to keep components in sync
  useEffect(() => {
    function onXpEvent(e: Event) {
      const detail = (e as CustomEvent).detail;
      const newXp = typeof detail !== "undefined" ? Number(detail) : Number(localStorage.getItem("aq_xp") || 0);
      setXp(newXp);
    }
    function onQuestsEvent(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        try {
          setQuests(JSON.parse(detail));
        } catch {
          /* ignore */
        }
      }
    }
    function onStorage(e: StorageEvent) {
      if (e.key === "aq_xp") setXp(Number(e.newValue || 0));
      if (e.key === "aq_quests") {
        try {
          setQuests(JSON.parse(e.newValue || "[]"));
        } catch {
          /* ignore */
        }
      }
    }
    window.addEventListener("app:xp", onXpEvent as EventListener);
    window.addEventListener("app:quests", onQuestsEvent as EventListener);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener("app:xp", onXpEvent as EventListener);
      window.removeEventListener("app:quests", onQuestsEvent as EventListener);
      window.removeEventListener("storage", onStorage);
    };
  }, []);

  function toggleQuest(id: number) {
    setQuests((prev: Quest[]) =>
      prev.map((q: Quest) => {
        if (q.id === id) {
          const completed = !q.completed;
          if (completed) {
            setXp((prevXp: number) => {
              const nx = prevXp + q.xp;
              if (nx >= (level + 1) * 200) setLevel((l) => l + 1);
              // notify same-tab listeners
              setTimeout(() => window.dispatchEvent(new CustomEvent("app:xp", { detail: nx })), 0);
              return nx;
            });
            setStreak((s) => s + 1);
          } else {
            setXp((prevXp: number) => Math.max(0, prevXp - q.xp));
            setStreak((s) => Math.max(0, s - 1));
          }
          return { ...q, completed };
        }
        return q;
      })
    );
  }

  function submitJournal() {
    const txt = journalText.toLowerCase();
    if (!txt.trim()) return;
    if (txt.match(/happy|good|great|grateful|blessed/)) setMood("happy");
    else if (txt.match(/sad|down|unhappy|lonely/)) setMood("sad");
    else if (txt.match(/tired|exhausted|sleepy/)) setMood("tired");
    else setMood("neutral");
    setJournalText("");
    setJournalOpen(false);
  }

  function generateAiSuggestions() {
    const suggestions = simulateAiSuggestion(mood);
    setAiSuggestions(suggestions);
  }

  function acceptAiSuggestion(suggestion: Suggestion) {
    setQuests((prev: Quest[]) => {
      const updated = [{ id: suggestion.id, title: suggestion.title, xp: suggestion.xp, completed: false }, ...prev].slice(0, 12);
      setTimeout(() => window.dispatchEvent(new CustomEvent("app:quests", { detail: JSON.stringify(updated) })), 0);
      return updated;
    });
    setAiSuggestions((prev) => prev.filter((s) => s.id !== suggestion.id));
  }

  const progressToNextLevel = Math.min(100, Math.floor(((xp % (level * 200)) / (level * 200)) * 100));
  const avatar = avatarForXp(xp, avatarStyle);

  return (
    <div className="grid grid-cols-12 gap-6">
      <section className="col-span-8 bg-white rounded-2xl p-6 shadow">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Welcome back, Adventurer</h2>
            <p className="text-sm text-slate-500">Complete daily quests to gain XP, level up, and play mini-games.</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-slate-500">Level</div>
            <div className="text-2xl font-extrabold">{level}</div>
          </div>
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>XP: {xp}</span>
            <span>Next level: {(level * 200)} XP</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-3 mt-2 overflow-hidden">
            <div className="h-3 rounded-full bg-indigo-600" style={{ width: `${progressToNextLevel}%` }} />
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-semibold">Today's Quests</h3>
          <div className="mt-4 grid grid-cols-1 gap-3">
            {quests.map((q: Quest) => (
              <div key={q.id} className="flex items-center justify-between p-4 rounded-xl border">
                <div>
                  <div className="font-medium">{q.title}</div>
                  <div className="text-xs text-slate-500">Reward: {q.xp} XP</div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => toggleQuest(q.id)}
                    className={`px-4 py-2 rounded-lg ${q.completed ? "bg-green-100 text-green-800" : "bg-indigo-600 text-white"}`}
                  >
                    {q.completed ? "Completed" : "Complete"}
                  </button>
                  <button onClick={() => alert("More info: This quest helps build a gratitude habit")} className="px-3 py-2 rounded-lg bg-slate-100 text-sm text-slate-600">
                    Info
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center gap-4">
          <button onClick={() => setJournalOpen(true)} className="px-4 py-2 rounded-lg bg-amber-100 text-amber-800">Write Journal</button>
          <button onClick={() => navigate("/profile")} className="px-4 py-2 rounded-lg bg-slate-100">Customize Avatar</button>
          <button onClick={() => navigate("/game")} className="px-4 py-2 rounded-lg bg-emerald-100 text-emerald-800">Play Mini-Game</button>
          <button onClick={() => generateAiSuggestions()} className="px-4 py-2 rounded-lg bg-indigo-600 text-white">Suggest Quest (AI)</button>
        </div>

        {journalOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-11/12 max-w-xl">
              <h3 className="text-lg font-semibold">Write your journal</h3>
              <p className="text-sm text-slate-500">Smart journaling will analyze sentiment and reflect on your avatar.</p>
              <textarea
                className="w-full h-32 mt-4 p-3 border rounded-md text-sm"
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
                placeholder="How are you feeling today?"
              />
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setJournalOpen(false)} className="px-4 py-2 rounded-lg bg-slate-100">Cancel</button>
                <button onClick={submitJournal} className="px-4 py-2 rounded-lg bg-indigo-600 text-white">Save</button>
              </div>
            </div>
          </div>
        )}
      </section>

      <aside className="col-span-4">
        <div className="bg-white rounded-2xl p-6 shadow flex flex-col items-center gap-4">
          <div className="w-40 h-40 rounded-full flex items-center justify-center bg-indigo-50 text-3xl font-bold">
            {avatar.face}
          </div>
          <div className="text-center">
            <div className="text-sm text-slate-500">{avatar.label}</div>
            <div className="mt-2 font-bold text-xl">{streak} days</div>
          </div>

          <div className="w-full bg-white rounded-xl p-3 border">
            <div className="text-xs text-slate-500">Quick Stats</div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="p-2 bg-slate-50 rounded-lg text-center">
                <div className="text-xs text-slate-500">Quests</div>
                <div className="font-semibold">{quests.length}</div>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg text-center">
                <div className="text-xs text-slate-500">Completed</div>
                <div className="font-semibold">{quests.filter((q) => q.completed).length}</div>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg text-center">
                <div className="text-xs text-slate-500">XP</div>
                <div className="font-semibold">{xp}</div>
              </div>
              <div className="p-2 bg-slate-50 rounded-lg text-center">
                <div className="text-xs text-slate-500">Level</div>
                <div className="font-semibold">{level}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 bg-white rounded-2xl p-4 shadow">
          <h4 className="font-semibold">AI Suggestions</h4>
          <p className="text-xs text-slate-400">Personalized ideas generated for you</p>
          <div className="mt-3 space-y-2">
            {aiSuggestions.length === 0 && <div className="text-sm text-slate-500">No suggestions yet — click "Suggest Quest (AI)"</div>}
            {aiSuggestions.map((s: Suggestion) => (
              <div key={s.id} className="flex items-center justify-between p-2 border rounded">
                <div className="text-sm">{s.title}</div>
                <div className="flex items-center gap-2">
                  <div className="text-xs text-slate-500">{s.xp} XP</div>
                  <button onClick={() => acceptAiSuggestion(s)} className="px-2 py-1 rounded bg-indigo-600 text-white text-xs">Accept</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}



/* ---------- Mini Game ---------- */
function MiniGame() {
  const [calm, setCalm] = useState<number>(() => Number(localStorage.getItem("aq_calm") || 0));
  const [combo, setCombo] = useState<number>(0);
  const [xp, setXp] = useState<number>(() => Number(localStorage.getItem("aq_xp") || 120));
  const [collected, setCollected] = useState<number>(() => Number(localStorage.getItem("aq_collected") || 0));

  useEffect(() => {
    localStorage.setItem("aq_calm", String(calm));
  }, [calm]);
  useEffect(() => {
    localStorage.setItem("aq_xp", String(xp));
  }, [xp]);
  useEffect(() => {
    localStorage.setItem("aq_collected", String(collected));
  }, [collected]);

  function clickCalm() {
    setCalm((c: number) => c + 1 + Math.floor(combo / 5));
    setCombo((s: number) => Math.min(50, s + 1));
  }

  function relax() {
    const gain = Math.floor(calm / 5);
    if (gain > 0) {
      setXp((prev: number) => {
        const nx = prev + gain;
        setTimeout(() => window.dispatchEvent(new CustomEvent("app:xp", { detail: nx })), 0);
        return nx;
      });
      setCollected((c: number) => c + gain);
      setCalm(0);
      setCombo(0);
      alert(`Nice! You converted calm into ${gain} XP.`);
    } else {
      alert("Collect more calm points before converting.");
    }
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow">
      <h2 className="text-xl font-bold">Mini-Game — Calm Collector</h2>
      <p className="text-sm text-slate-500">Click to gather calm points, then relax to convert them into XP.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 items-center">
        <div className="bg-indigo-50 rounded-2xl p-6 text-center">
          <div className="text-xs text-slate-500">Calm Points</div>
          <div className="text-4xl font-bold mt-2">{calm}</div>
          <div className="text-xs text-slate-400 mt-1">Combo: {combo}</div>
        </div>

        <div className="flex flex-col gap-3">
          <button onClick={clickCalm} className="px-4 py-3 rounded-lg bg-emerald-500 text-white">Gather Calm</button>
          <button onClick={relax} className="px-4 py-3 rounded-lg bg-indigo-600 text-white">Relax & Convert</button>
          <button onClick={() => { setCalm(0); setCombo(0); }} className="px-4 py-2 rounded-lg bg-slate-100">Reset</button>
        </div>
      </div>

      <div className="mt-6 text-sm text-slate-600">Total XP gained from game: {collected}</div>
      <div className="mt-2 text-xs text-slate-400">Tip: hold a steady click rhythm to increase combo and get more calm per click.</div>
    </div>
  );
}

/* ---------- Quests Page ---------- */
function QuestsPage() {
  const [quests] = useState<Quest[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("aq_quests") || "[]") as Quest[];
    } catch {
      return [];
    }
  });

  // listen for same-tab quest updates
  useEffect(() => {
    function onQuests(e: Event) {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        try {
          // replace local list with updated one
          const parsed = JSON.parse(detail) as Quest[];
          // we can't call setQuests here because we didn't keep setter; instead we store to localStorage so re-mount or navigate will show latest
          localStorage.setItem("aq_quests", JSON.stringify(parsed));
        } catch {
          /* ignore */
        }
      }
    }
    window.addEventListener("app:quests", onQuests as EventListener);
    return () => window.removeEventListener("app:quests", onQuests as EventListener);
  }, []);

  return (
    <div className="bg-white rounded-2xl p-6 shadow">
      <h2 className="text-xl font-bold">Quests</h2>
      <div className="mt-4 grid gap-3">
        {quests.map((q: Quest) => (
          <div key={q.id} className="flex items-center justify-between p-4 rounded-xl border">
            <div>
              <div className="font-medium">{q.title}</div>
              <div className="text-xs text-slate-500">Reward: {q.xp} XP</div>
            </div>
            <button className="px-3 py-2 rounded-lg bg-indigo-600 text-white">Complete</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- Leaderboard ---------- */
function Leaderboard() {
  const rows = [
    { name: "You", xp: Number(localStorage.getItem("aq_xp") || 120) },
    { name: "Ava", xp: 420 },
    { name: "Liam", xp: 380 },
    { name: "Priya", xp: 350 },
  ];
  return (
    <div className="bg-white rounded-2xl p-6 shadow">
      <h2 className="text-xl font-bold">Leaderboard</h2>
      <ol className="mt-4 space-y-2">
        {rows.map((r, i) => (
          <li key={i} className={`p-3 rounded-lg ${r.name === "You" ? "bg-amber-50" : "bg-slate-50"}`}>
            <div className="flex justify-between">
              <span>{i + 1}. {r.name}</span>
              <span>{r.xp} XP</span>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/* ---------- Profile ---------- */
function Profile() {
  const navigate = useNavigate();
  const [avatarStyle, setAvatarStyle] = useState<string>(() => localStorage.getItem("aq_avatar") || "default");
  const [displayName, setDisplayName] = useState<string>(() => localStorage.getItem("aq_name") || "Adventurer");

  function save() {
    localStorage.setItem("aq_avatar", avatarStyle);
    localStorage.setItem("aq_name", displayName);
    alert("Profile saved");
    navigate("/");
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow">
      <h2 className="text-xl font-bold">Profile</h2>
      <label className="block mt-4">Display Name</label>
      <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="p-2 border rounded-md w-full" />

      <label className="block mt-4">Avatar Style</label>
      <div className="flex gap-2 mt-2">
        {["default", "cute", "minimal"].map((style) => (
          <button key={style} onClick={() => setAvatarStyle(style)} className={`px-3 py-2 rounded ${avatarStyle === style ? "bg-indigo-600 text-white" : "bg-slate-100"}`}>
            {style}
          </button>
        ))}
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button onClick={() => navigate("/")} className="px-4 py-2 rounded-lg bg-slate-100">Cancel</button>
        <button onClick={save} className="px-4 py-2 rounded-lg bg-indigo-600 text-white">Save</button>
      </div>
    </div>
  );
}
