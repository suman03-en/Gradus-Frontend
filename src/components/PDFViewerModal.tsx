import { useEffect } from 'react'

interface PDFViewerModalProps {
  url: string
  title?: string
  onClose: () => void
}

export function PDFViewerModal({ url, title = 'Document Viewer', onClose }: PDFViewerModalProps) {
  // Prevent body scrolling while modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/70 backdrop-blur-sm p-2 sm:p-6 lg:p-10">
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        {/* Header toolbar */}
        <div className="flex shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-900 truncate pr-4">{title}</h3>
          <div className="flex items-center gap-2">
            <a 
              href={url} 
              target="_blank" 
              rel="noreferrer" 
              className="rounded-lg border border-brand-200 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 transition-colors hover:bg-brand-100"
            >
              Open in New Tab ↗
            </a>
            <button 
              onClick={onClose}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
              aria-label="Close viewer"
            >
              ✕
            </button>
          </div>
        </div>
        
        {/* PDF iframe body */}
        <div className="flex-1 bg-slate-200">
          <iframe
            src={`${url}#view=FitH`}
            className="h-full w-full border-0"
            title={title}
          />
        </div>
      </div>
    </div>
  )
}
