import { MessageCircle, X, Paperclip, Send, File, FileImage } from "lucide-react"
import type { ProjectComment } from "@/services/project-comment.service"
import type { FileAttachment } from "@/services/project.service"
import type { Employee } from "@/services/employee.service"
import type { User } from "@/services/user.service"

export type CommentWithEmployee = ProjectComment & { employee?: Employee }

interface ProjectCommentsProps {
  comments: CommentWithEmployee[]
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
  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm">
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
        <MessageCircle size={16} className="text-zinc-500" />
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Bình luận</h2>
        <span className="ml-auto text-xs text-zinc-400">{comments.length} bình luận</span>
      </div>
      <div className="max-h-72 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="px-5 py-8 text-sm text-zinc-400 text-center">Chưa có bình luận nào</p>
        ) : (
          [...comments].reverse().map((c) => {
            const initialsC = c.employee?.name?.slice(0, 2).toUpperCase() || "??"
            let fileList: FileAttachment[] = []
            try {
              fileList = JSON.parse(c.attachments || "[]")
            } catch {}
            const isOwner = user?.employeeId === c.employeeId
            return (
              <div key={c.id} className={`px-5 py-2.5 flex ${isOwner ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] min-w-0 flex items-end gap-2 ${isOwner ? "flex-row-reverse" : "flex-row"}`}>
                  <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                    {c.employee?.avatarURL ? (
                      <img src={c.employee.avatarURL} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <span>{initialsC}</span>
                    )}
                  </div>
                  <div
                    className={`rounded-xl px-3.5 py-2 ${
                      isOwner
                        ? "bg-blue-600 text-white rounded-br-sm"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-bl-sm"
                    }`}
                  >
                    <div className={`flex items-center gap-2 mb-0.5 ${isOwner ? "justify-end" : "justify-start"}`}>
                      <span className={`text-xs font-medium ${isOwner ? "text-blue-100" : "text-zinc-700 dark:text-zinc-300"}`}>
                        {c.employee?.name || "—"}
                      </span>
                      <span className={`text-[10px] ${isOwner ? "text-blue-200" : "text-zinc-400"}`}>
                        {new Date(c.createdAt).toLocaleString("vi-VN")}
                      </span>
                      {isOwner && (
                        <button
                          onClick={() => handleDeleteComment(c.id)}
                          className="p-0.5 rounded text-blue-200 hover:text-white transition cursor-pointer border-none bg-transparent"
                          title="Xoá"
                        >
                          <X size={11} />
                        </button>
                      )}
                    </div>
                    {c.content && <p className={`text-sm whitespace-pre-wrap ${isOwner ? "text-white" : "text-zinc-800 dark:text-zinc-200"}`}>{c.content}</p>}
                    {fileList.length > 0 && (
                      <div className="mt-1 space-y-0.5">
                        {fileList.map((f, i) => {
                          const Icon = getFileIcon(f.mimetype)
                          return (
                            <button
                              key={i}
                              onClick={() => downloadFile(f.url, f.originalName)}
                              className={`flex items-center gap-1 text-xs hover:underline cursor-pointer border-none bg-transparent p-0 ${
                                isOwner ? "text-blue-100" : "text-blue-600 dark:text-blue-400"
                              }`}
                            >
                              <Icon size={12} /> {f.originalName}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {user && (
        <div className="px-5 py-3 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1.5">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Nhập bình luận..."
                rows={2}
                className="w-full rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-1.5 text-sm text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none"
              />
              {commentFiles.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {commentFiles.map((f, i) => {
                    const Icon = getFileIcon(f.mimetype)
                    return (
                      <div
                        key={i}
                        className="flex items-center gap-1 rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-1 text-xs text-zinc-600 dark:text-zinc-300"
                      >
                        <Icon size={11} />
                        <span className="truncate max-w-[120px]">{f.originalName}</span>
                        <button
                          type="button"
                          onClick={() => removeCommentFile(i)}
                          className="p-0.5 text-zinc-400 hover:text-red-500 transition cursor-pointer border-none bg-transparent"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <label className="w-8 h-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950 transition cursor-pointer border-none">
                <Paperclip size={15} />
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
                disabled={!commentText.trim() && commentFiles.length === 0}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white bg-blue-600 hover:opacity-90 transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer border-none"
              >
                {commentUploading ? <span className="text-[10px]">...</span> : <Send size={15} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
