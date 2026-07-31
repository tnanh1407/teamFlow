import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  ClipboardList,
  FolderKanban,
  LayoutDashboard,
  ListChecks,
  Search,
  Settings,
  UserRound,
  Users,
} from "lucide-react";
import searchService, { type SearchResults } from "@/services/search.service";
import { useAuth } from "@/contexts/AuthContext";

const EMPTY_RESULTS: SearchResults = { users: [], projects: [], tasks: [], departments: [], positions: [] };

interface PaletteItem {
  id: string;
  group: string;
  label: string;
  sublabel?: string;
  icon: React.ReactNode;
  onSelect: () => void;
}

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

const roleScopedRoutes = (role: string) => [
  ...(role === "admin" ? [{ label: "Tổng quan", path: "/dashboard", icon: <LayoutDashboard size={18} /> }] : []),
  { label: "Dự án", path: "/projects", icon: <FolderKanban size={18} /> },
  { label: "Nhân sự", path: "/members", icon: <Users size={18} /> },
  ...(role === "admin"
    ? [
        { label: "Quản lý nhân viên", path: "/employees", icon: <UserRound size={18} /> },
        { label: "Phòng ban", path: "/departments", icon: <Building2 size={18} /> },
        { label: "Chức vụ", path: "/positions", icon: <ClipboardList size={18} /> },
      ]
    : []),
  { label: "Cài đặt", path: "/settings", icon: <Settings size={18} /> },
];

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults>(EMPTY_RESULTS);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults(EMPTY_RESULTS);
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open]);

  useEffect(() => {
    if (!open || !query.trim()) {
      setResults(EMPTY_RESULTS);
      setLoading(false);
      return;
    }
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await searchService.searchAll(query.trim());
        setResults(data);
      } catch {
        setResults(EMPTY_RESULTS);
      } finally {
        setLoading(false);
      }
    }, 250);
    return () => clearTimeout(timer);
  }, [query, open]);

  const close = useCallback(() => {
    setQuery("");
    onClose();
  }, [onClose]);

  const go = useCallback(
    (path: string) => {
      close();
      navigate(path);
    },
    [close, navigate]
  );

  const items: PaletteItem[] = useMemo(() => {
    const list: PaletteItem[] = [];
    if (!query.trim()) {
      for (const route of roleScopedRoutes(user?.role ?? "user")) {
        list.push({
          id: `action-${route.path}`,
          group: "Điều hướng nhanh",
          label: route.label,
          icon: route.icon,
          onSelect: () => go(route.path),
        });
      }
      return list;
    }

    for (const p of results.projects) {
      list.push({
        id: `project-${p.id}`,
        group: "Dự án",
        label: p.title,
        sublabel: p.status,
        icon: <FolderKanban size={18} />,
        onSelect: () => go(`/projects/${p.id}`),
      });
    }
    for (const t of results.tasks) {
      list.push({
        id: `task-${t.id}`,
        group: "Công việc",
        label: t.title,
        sublabel: t.status,
        icon: <ListChecks size={18} />,
        onSelect: () => go(`/projects/${t.projectId}`),
      });
    }
    for (const u of results.users) {
      list.push({
        id: `user-${u.id}`,
        group: "Nhân sự",
        label: u.name,
        sublabel: u.username,
        icon: <UserRound size={18} />,
        onSelect: () => go(`/members/${u.id}`),
      });
    }
    if (user?.role === "admin") {
      for (const d of results.departments) {
        list.push({
          id: `department-${d.id}`,
          group: "Phòng ban",
          label: d.name,
          sublabel: d.code,
          icon: <Building2 size={18} />,
          onSelect: () => go(`/departments/${d.id}`),
        });
      }
      for (const p of results.positions) {
        list.push({
          id: `position-${p.id}`,
          group: "Chức vụ",
          label: p.name,
          sublabel: p.level,
          icon: <ClipboardList size={18} />,
          onSelect: () => go(`/positions/${p.id}`),
        });
      }
    }
    return list;
  }, [query, results, user, go]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, results]);

  useEffect(() => {
    const el = listRef.current?.querySelector(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, items.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = items[activeIndex];
      if (item) item.onSelect();
    }
  };

  const grouped = useMemo(() => {
    const map = new Map<string, PaletteItem[]>();
    items.forEach((item, index) => {
      const arr = map.get(item.group) ?? [];
      arr.push({ ...item, id: `${item.id}::${index}` });
      map.set(item.group, arr);
    });
    return [...map.entries()].map(([group, groupItems]) => ({
      group,
      items: groupItems.map((item, i) => ({ ...item, flatIndex: i })),
    }));
  }, [items]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-start justify-center pt-[12vh] px-4"
          onMouseDown={close}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -8 }}
            transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
            className="w-full max-w-xl rounded-2xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-2xl overflow-hidden"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 px-4 border-b border-zinc-200 dark:border-zinc-800">
              <Search size={18} className="text-zinc-400 shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="Tìm nhân viên, dự án, công việc, phòng ban..."
                className="flex-1 h-14 bg-transparent outline-none text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400"
              />
              <kbd className="rounded-md border border-zinc-300 dark:border-zinc-600 px-1.5 py-0.5 text-[11px] text-zinc-400 shrink-0">
                Esc
              </kbd>
            </div>

            <div ref={listRef} className="max-h-[50vh] overflow-y-auto py-2">
              {loading && (
                <div className="px-4 py-8 flex justify-center">
                  <div className="size-6 animate-spin rounded-full border-2 border-zinc-300 dark:border-zinc-600 border-t-indigo-500" />
                </div>
              )}

              {!loading && items.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-zinc-400">
                  {query.trim()
                    ? "Không tìm thấy kết quả phù hợp"
                    : "Gõ để tìm kiếm hoặc chọn trang nhanh bên dưới"}
                </div>
              )}

              {!loading &&
                grouped.map(({ group, items: groupItems }) => (
                  <div key={group}>
                    <div className="px-4 pt-2 pb-1 text-[11px] font-medium uppercase tracking-wider text-zinc-400">
                      {group}
                    </div>
                    {groupItems.map((item) => (
                      <button
                        key={item.id}
                        data-index={item.flatIndex}
                        onMouseEnter={() => setActiveIndex(item.flatIndex)}
                        onClick={item.onSelect}
                        className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                          activeIndex === item.flatIndex
                            ? "bg-zinc-100 dark:bg-zinc-800"
                            : ""
                        }`}
                      >
                        <span className="text-zinc-400 shrink-0">{item.icon}</span>
                        <span className="flex-1 min-w-0">
                          <span className="block text-sm text-zinc-900 dark:text-zinc-100 truncate">
                            {item.label}
                          </span>
                          {item.sublabel && (
                            <span className="block text-xs text-zinc-400 truncate">{item.sublabel}</span>
                          )}
                        </span>
                        <ArrowRight
                          size={14}
                          className={`shrink-0 text-zinc-300 transition-opacity ${
                            activeIndex === item.flatIndex ? "opacity-100" : "opacity-0"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
