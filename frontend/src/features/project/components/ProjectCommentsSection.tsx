import { useRef, useEffect } from "react"
import { MessageCircle, X, Paperclip, Send, File, FileImage } from "lucide-react"
import type { ProjectComment } from "@/services/project-comment.service"
import type { FileAttachment } from "@/services/project.service"
import type { User } from "@/services/user.service"

export type CommentWithUser = ProjectComment & { employee?: User }

interface ProjectCommentsProps {
  comments: CommentWithUser[]
  user: User | null
  commentText: string
  setCommentText: (v: string) => void
  commentFiles: FileAttachment[]
  commentUploading: boolean
  handleCommentFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void
  removeCommentFile: (index: number) => void
  handleAddComment: () => void
  handleDeleteComment: (id: string) => void
}

function getFileIcon(mimetype: string) {
  if (mimetype.startsWith("image/")) return FileImage
  return File
}

function downloadFile(url: string, filename: string) {
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.target = "_blank"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function timeAgo(dateStr: string) {
  const now = Date.now()
  const diff = now - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return "Vừa xong"
  if (mins < 60) return `${mins} phút trước`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} giờ trước`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days} ngày trước`
  return new Date(dateStr).toLocaleDateString("vi-VN")
}

export default function ProjectCommentsSection({
  comments,
  user,
  commentText,
  setCommentText,
  commentFiles,
  commentUploading,
  handleCommentFileUpload,
  removeCommentFile,
  handleAddComment,
  handleDeleteComment,
}: ProjectCommentsProps) {
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const listEndRef = useRef<HTMLDivElement>(null)

  const canSend = commentText.trim().length > 0 || commentFiles.length > 0

  useEffect(() => {
    listEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [comments.length])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto"
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`
    }
  }, [commentText])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (canSend && !commentUploading) handleAddComment()
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200/70 dark:border-zinc-700/50 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
      <div className="px-5 py-3 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
        <MessageCircle size={16} className="text-blue-500" />
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Bình luận</h2>
        <span className="ml-auto text-xs text-zinc-400">{comments.length} bình luận</span>
      </div>

      <div className="max-h-80 overflow-y-auto px-5 py-3 space-y-3">
        {comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-zinc-400">
            <MessageCircle size={32} className="mb-2 opacity-40" />
            <p className="text-sm">Chưa có bình luận nào</p>
            <p className="text-xs mt-0.5">Hãy là người đầu tiên bình luận</p>
          </div>
        ) : (
          [...comments].reverse().map((c) => {
            const initialsC = c.employee?.name?.slice(0, 2).toUpperCase() || "??"
            let fileList: FileAttachment[] = []
            try {
              fileList = JSON.parse(c.attachments || "[]")
            } catch {}
            const isOwner = user?.id === c.employeeId
            return (
              <div key={c.id} className={`flex ${isOwner ? "justify-end" : "justify-start"}`}>
                <div className={`flex items-end gap-2 max-w-[85%] ${isOwner ? "flex-row-reverse" : "flex-row"}`}>
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-sm">
                    {c.employee?.avatarURL ? (
                      <img src={c.employee.avatarURL} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span>{initialsC}</span>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className={`flex items-center gap-2 mb-0.5 px-1 ${isOwner ? "justify-end" : "justify-start"}`}>
                      <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">
                        {c.employee?.name || "—"}
                      </span>
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500">{timeAgo(c.createdAt)}</span>
                      {isOwner && (
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          className="p-0.5 rounded text-zinc-300 hover:text-red-500 transition cursor-pointer border-none bg-transparent"
                          title="Xoá"
                        >
                          <X size={10} />
                        </button>
                      )}
                    </div>
                    <div
                      className={`rounded-2xl px-3.5 py-2 ${
                        isOwner
                          ? "bg-blue-600 text-white rounded-tr-sm"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tl-sm"
                      }`}
                    >
                      {c.content && <p className="text-sm whitespace-pre-wrap leading-relaxed">{c.content}</p>}
                      {fileList.length > 0 && (
                        <div className={`mt-1.5 space-y-1 ${c.content ? "border-t border-white/10 pt-1.5" : ""}`}>
                          {fileList.map((f, i) => {
                            const Icon = getFileIcon(f.mimetype)
                            return (
                              <button
                                key={i}
                                onClick={() => downloadFile(f.url, f.originalName)}
                                className={`flex items-center gap-1.5 text-xs hover:underline cursor-pointer border-none bg-transparent p-0 ${
                                  isOwner ? "text-blue-100" : "text-blue-600 dark:text-blue-400"
                                }`}
                              >
                                <Icon size={12} />
                                <span className="truncate max-w-[180px]">{f.originalName}</span>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })
        )}
        <div ref={listEndRef} />
      </div>

      {user && (
        <div className="border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/30 px-4 py-3">
          {commentFiles.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {commentFiles.map((f, i) => {
                const Icon = getFileIcon(f.mimetype)
                return (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 px-2.5 py-1 text-xs text-zinc-600 dark:text-zinc-300 shadow-sm"
                  >
                    <Icon size={12} className="text-blue-500" />
                    <span className="truncate max-w-[100px]">{f.originalName}</span>
                    <button
                      type="button"
                      onClick={() => removeCommentFile(i)}
                      className="p-0.5 text-zinc-400 hover:text-red-500 transition cursor-pointer border-none bg-transparent ml-0.5"
                    >
                      <X size={10} />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
          <div className="flex items-end gap-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-700 px-3 py-1.5 focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition">
            <textarea
              ref={inputRef}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập bình luận... (Enter để gửi)"
              rows={1}
              className="flex-1 border-none bg-transparent px-0 py-1 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none resize-none max-h-[120px]"
            />
            <div className="flex items-center gap-0.5 shrink-0 pb-0.5">
              <label className="w-7 h-7 rounded-lg flex items-center justify-center text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition cursor-pointer border-none">
                <Paperclip size={14} />
                <input
                  type="file"
                  multiple
                  onChange={handleCommentFileUpload}
                  className="hidden"
                  disabled={commentUploading}
                />
              </label>
              <button
                type="button"
                onClick={handleAddComment}
                disabled={!canSend || commentUploading}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer border-none"
              >
                {commentUploading ? (
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                ) : (
                  <Send size={14} />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
