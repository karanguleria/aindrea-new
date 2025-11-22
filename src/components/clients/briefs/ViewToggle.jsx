import React from 'react'

export default function ViewToggle({ viewMode, setViewMode }) {
  return (
    <div className="flex items-center gap-1 bg-transparent border border-muted-foreground rounded-lg p-1">
      <button
        onClick={() => setViewMode('list')}
        className={`p-2 rounded-md transition-colors ${
          viewMode === 'list' 
            ? 'bg-transparent text-foreground' 
            : 'text-foreground'
        }`}
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      </button>
      
      <button
        onClick={() => setViewMode('grid')}
        className={`p-2 rounded-md transition-colors ${
          viewMode === 'grid' 
            ? 'bg-transparent text-foreground' 
            : 'text-foreground'
        }`}
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      </button>
    </div>
  )
}
