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
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-900/80 backdrop-blur-sm p-2 sm:p-6 lg:p-12">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col overflow-hidden rounded-xl bg-white shadow-2xl">
        {/* Header toolbar */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 shrink-0">
          <h3 className="text-sm font-semibold text-slate-900 truncate pr-4">{title}</h3>
          <div className="flex items-center gap-2">
            <a 
              href={url} 
              target="_blank" 
              rel="noreferrer" 
              className="text-xs font-medium text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              Open in New Tab ↗
            </a>
            <button 
              onClick={onClose}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-200/50 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-colors"
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
