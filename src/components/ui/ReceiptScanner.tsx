import { useState, useRef } from 'react'

interface ScannedData {
  date: string
  vendor: string
  amount: number
  currency: string
  category: string
  confidence: Record<string, 'high' | 'medium' | 'low'>
}

interface ReceiptScannerProps {
  onScanned: (data: ScannedData) => void
  onReset: () => void
}

const MOCK_RESULTS: ScannedData[] = [
  { date: '2025-05-28', vendor: 'Petrogal Maputo', amount: 2450, currency: 'MZN', category: 'Transport', confidence: { date: 'high', vendor: 'high', amount: 'high', currency: 'high', category: 'medium' } },
  { date: '2025-05-27', vendor: 'Shoprite Matola', amount: 1850, currency: 'MZN', category: 'Consumables', confidence: { date: 'high', vendor: 'high', amount: 'high', currency: 'high', category: 'high' } },
  { date: '2025-05-26', vendor: 'Mocambique Gas', amount: 3200, currency: 'MZN', category: 'Transport', confidence: { date: 'high', vendor: 'medium', amount: 'high', currency: 'high', category: 'low' } },
]

export function ReceiptScanner({ onScanned, onReset }: ReceiptScannerProps) {
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')
  const [fileName, setFileName] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
      alert('Please upload an image or PDF file')
      return
    }
    setFileName(file.name)
    setState('loading')
    setTimeout(() => {
      const result = MOCK_RESULTS[Math.floor(Math.random() * MOCK_RESULTS.length)]
      setState('done')
      onScanned(result)
    }, 1800)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleClick = () => {
    if (state === 'idle') fileRef.current?.click()
    else if (state === 'done') { setState('idle'); setFileName(''); onReset() }
  }

  return (
    <div>
      <input ref={fileRef} type="file" accept="image/*,.pdf" className="hidden" onChange={e => { if (e.target.files?.[0]) handleFile(e.target.files[0]) }} />

      {state === 'idle' && (
        <div
          className="scan-zone"
          onClick={handleClick}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
        >
          <div className="text-3xl mb-2 opacity-30">📷</div>
          <div className="font-medium text-sm text-neutral-600">Tap to take photo or upload receipt</div>
          <div className="text-xs text-neutral-400 mt-1">JPG, PNG, PDF · max 10MB</div>
          <div className="text-xs text-blue-500 mt-2 flex items-center justify-center gap-1">✨ AI will read and auto-fill the form</div>
        </div>
      )}

      {state === 'loading' && (
        <div className="scan-zone scanned">
          <div className="text-2xl mb-2">📄</div>
          <div className="font-medium text-sm text-neutral-700">{fileName}</div>
          <div className="flex items-center justify-center gap-2 mt-2 text-blue-600 text-xs">
            <svg className="spin w-4 h-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
            Reading receipt with AI...
          </div>
        </div>
      )}

      {state === 'done' && (
        <div
          className="scan-zone scanned cursor-pointer"
          onClick={handleClick}
        >
          <div className="text-2xl mb-1">✅</div>
          <div className="font-medium text-sm text-emerald-700">{fileName}</div>
          <div className="text-xs text-emerald-600 mt-1">Receipt read — form auto-filled</div>
          <div className="text-xs text-neutral-400 mt-1">Tap to replace</div>
        </div>
      )}
    </div>
  )
}

export function ConfidenceBadge({ level }: { level: 'high' | 'medium' | 'low' }) {
  if (level === 'high') return <span className="text-xs text-emerald-600 ml-1">✓ detected</span>
  if (level === 'medium') return <span className="text-xs text-amber-600 ml-1">⚠ review suggested</span>
  return <span className="text-xs text-red-500 ml-1">✕ uncertain</span>
}
