import { Files, FileText, Image, Video, Music, Archive, Plus, Search, Grid3X3, List, Upload, ExternalLink, Download, MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import { motion } from 'framer-motion'
import { format, parseISO } from 'date-fns'
import { cn, formatNumber } from '@/lib/utils'

type FileType = 'pdf' | 'image' | 'video' | 'audio' | 'doc' | 'archive' | 'other'

interface DocFile {
  id: string
  name: string
  type: FileType
  size: number // bytes
  folder: string
  createdAt: string
  url?: string
}

const TYPE_CONFIG: Record<FileType, { icon: typeof FileText; color: string; bg: string; ext: string }> = {
  pdf: { icon: FileText, color: 'text-error-400', bg: 'bg-error-500/15', ext: 'PDF' },
  image: { icon: Image, color: 'text-primary-400', bg: 'bg-primary-500/15', ext: 'IMG' },
  video: { icon: Video, color: 'text-secondary-400', bg: 'bg-secondary-500/15', ext: 'VID' },
  audio: { icon: Music, color: 'text-accent-400', bg: 'bg-accent-500/15', ext: 'AUD' },
  doc: { icon: FileText, color: 'text-success-400', bg: 'bg-success-500/15', ext: 'DOC' },
  archive: { icon: Archive, color: 'text-warning-400', bg: 'bg-warning-500/15', ext: 'ZIP' },
  other: { icon: Files, color: 'text-[color:var(--text-tertiary)]', bg: 'bg-white/10', ext: 'FILE' },
}

const MOCK_FILES: DocFile[] = [
  { id: '1', name: 'ARISE Architecture Spec.pdf', type: 'pdf', size: 2400000, folder: 'Work', createdAt: new Date().toISOString() },
  { id: '2', name: 'UI Design Mockups.png', type: 'image', size: 1800000, folder: 'Design', createdAt: new Date().toISOString() },
  { id: '3', name: 'Demo Recording.mp4', type: 'video', size: 52000000, folder: 'Work', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: '4', name: 'Project Notes.doc', type: 'doc', size: 450000, folder: 'Work', createdAt: new Date(Date.now() - 86400000).toISOString() },
  { id: '5', name: 'Resume_2025.pdf', type: 'pdf', size: 890000, folder: 'Personal', createdAt: new Date(Date.now() - 172800000).toISOString() },
  { id: '6', name: 'Codebase Backup.zip', type: 'archive', size: 145000000, folder: 'Dev', createdAt: new Date(Date.now() - 259200000).toISOString() },
  { id: '7', name: 'Meeting Notes.doc', type: 'doc', size: 120000, folder: 'Work', createdAt: new Date(Date.now() - 345600000).toISOString() },
  { id: '8', name: 'Focus Music.mp3', type: 'audio', size: 8500000, folder: 'Personal', createdAt: new Date(Date.now() - 432000000).toISOString() },
]

const FOLDERS = ['All', ...Array.from(new Set(MOCK_FILES.map(f => f.folder)))]

function formatSize(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`
  if (bytes >= 1e3) return `${(bytes / 1e3).toFixed(0)} KB`
  return `${bytes} B`
}

export default function DocumentsPage() {
  const [files] = useState(MOCK_FILES)
  const [search, setSearch] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [activeFolder, setActiveFolder] = useState('All')

  const filtered = files.filter(f => {
    const matchSearch = f.name.toLowerCase().includes(search.toLowerCase())
    const matchFolder = activeFolder === 'All' || f.folder === activeFolder
    return matchSearch && matchFolder
  })

  const totalSize = files.reduce((s, f) => s + f.size, 0)

  return (
    <div className="p-6 space-y-5 max-w-screen-xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[color:var(--text-primary)]">Documents</h1>
          <p className="text-sm text-[color:var(--text-tertiary)] mt-0.5">{files.length} files · {formatSize(totalSize)} total</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-xl overflow-hidden border border-[color:var(--border-subtle)]">
            {(['grid', 'list'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className={cn('px-3 py-1.5 text-xs transition-colors flex items-center gap-1.5', view === v ? 'bg-primary-600/20 text-primary-300' : 'text-[color:var(--text-tertiary)] hover:text-[color:var(--text-secondary)]')}>
                {v === 'grid' ? <Grid3X3 className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
          <button className="btn-ghost flex items-center gap-2 text-sm">
            <Upload className="w-4 h-4" /> Upload
          </button>
          <button className="btn-primary flex items-center gap-2 text-sm px-4 py-2">
            <Plus className="w-4 h-4" /> New
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[color:var(--border-subtle)] bg-[color:var(--bg-card)] flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[color:var(--text-tertiary)]" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search files..." className="flex-1 bg-transparent text-sm text-[color:var(--text-primary)] placeholder-[color:var(--text-muted)] outline-none" />
        </div>
        <div className="flex gap-1.5">
          {FOLDERS.map(f => (
            <button key={f} onClick={() => setActiveFolder(f)} className={cn('px-3 py-1.5 rounded-full text-xs font-medium transition-all', activeFolder === f ? 'bg-primary-600/20 text-primary-300 border border-primary-500/30' : 'border border-[color:var(--border-subtle)] text-[color:var(--text-tertiary)] hover:text-[color:var(--text-secondary)]')}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {view === 'grid' ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map(file => {
            const tc = TYPE_CONFIG[file.type]
            const FileIcon = tc.icon
            return (
              <motion.div key={file.id} layout className="card card-hover group cursor-pointer">
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center mb-3 mx-auto text-xl', tc.bg)}>
                  <FileIcon className={cn('w-6 h-6', tc.color)} />
                </div>
                <p className="text-xs font-medium text-[color:var(--text-primary)] text-center truncate">{file.name}</p>
                <p className="text-[10px] text-[color:var(--text-tertiary)] text-center mt-1">{formatSize(file.size)}</p>
                <div className="flex justify-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="p-1.5 rounded-lg hover:bg-white/10 text-[color:var(--text-tertiary)] hover:text-[color:var(--text-primary)] transition-colors"><Download className="w-3 h-3" /></button>
                  <button className="p-1.5 rounded-lg hover:bg-white/10 text-[color:var(--text-tertiary)] hover:text-[color:var(--text-primary)] transition-colors"><MoreHorizontal className="w-3 h-3" /></button>
                </div>
              </motion.div>
            )
          })}
          <motion.label layout className="card border-dashed border-[color:var(--border-default)] hover:border-primary-500/40 hover:bg-primary-500/5 flex flex-col items-center justify-center gap-2 min-h-[120px] cursor-pointer transition-all group">
            <Upload className="w-6 h-6 text-[color:var(--text-tertiary)] group-hover:text-primary-400 transition-colors" />
            <p className="text-xs text-[color:var(--text-tertiary)] group-hover:text-[color:var(--text-secondary)]">Upload file</p>
          </motion.label>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[color:var(--border-subtle)] text-[10px] font-semibold uppercase tracking-widest text-[color:var(--text-muted)]">
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Type</th>
                <th className="text-left py-3 px-4">Folder</th>
                <th className="text-left py-3 px-4">Size</th>
                <th className="text-left py-3 px-4">Date</th>
                <th className="py-3 px-4" />
              </tr>
            </thead>
            <tbody>
              {filtered.map(file => {
                const tc = TYPE_CONFIG[file.type]
                const FileIcon = tc.icon
                return (
                  <tr key={file.id} className="border-b border-[color:var(--border-subtle)] last:border-0 hover:bg-white/[0.02] transition-colors group cursor-pointer">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className={cn('w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0', tc.bg)}>
                          <FileIcon className={cn('w-3.5 h-3.5', tc.color)} />
                        </div>
                        <span className="text-xs text-[color:var(--text-primary)] truncate max-w-xs">{file.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4"><span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium', tc.bg, tc.color)}>{tc.ext}</span></td>
                    <td className="py-3 px-4 text-xs text-[color:var(--text-tertiary)]">{file.folder}</td>
                    <td className="py-3 px-4 text-xs text-[color:var(--text-tertiary)]">{formatSize(file.size)}</td>
                    <td className="py-3 px-4 text-xs text-[color:var(--text-tertiary)]">{format(parseISO(file.createdAt), 'MMM d, yyyy')}</td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity justify-end">
                        <button className="p-1 rounded hover:bg-white/10 text-[color:var(--text-tertiary)] hover:text-[color:var(--text-primary)] transition-colors"><Download className="w-3 h-3" /></button>
                        <button className="p-1 rounded hover:bg-white/10 text-[color:var(--text-tertiary)] hover:text-[color:var(--text-primary)] transition-colors"><MoreHorizontal className="w-3 h-3" /></button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
