import { useState, useEffect } from 'react'
import {
  PanelLeftClose,
  PanelLeftOpen,
  Network,
  Eye,
  EyeOff,
  Save,
  Menu,
  X,
} from 'lucide-react'
import FileTree from './FileTree'
import Editor from './Editor'
import Preview from './Preview'
import Graph from './Graph'
import useStore from '@/store/useStore'
import { Button } from './ui/Button'
import { cn } from '@/lib/utils'

export default function Layout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const {
    showGraph,
    showPreview,
    sidebarCollapsed,
    toggleGraph,
    togglePreview,
    toggleSidebar,
    currentFile,
    currentContent,
    saveFile,
  } = useStore()

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close mobile menu when file is selected
  useEffect(() => {
    if (currentFile && isMobile) {
      setMobileMenuOpen(false)
    }
  }, [currentFile, isMobile])

  const handleSave = () => {
    if (currentFile && currentContent) {
      saveFile(currentFile, currentContent)
    }
  }

  const handleToggleSidebar = () => {
    if (isMobile) {
      setMobileMenuOpen(!mobileMenuOpen)
    } else {
      toggleSidebar()
    }
  }

  return (
    <div className="h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <div className="h-14 min-h-14 border-b border-border flex items-center justify-between px-3 md:px-4 bg-card">
        <div className="flex items-center gap-2 md:gap-4 min-w-0 flex-1">
          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggleSidebar}
            className="md:hidden"
            title="Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>

          <h1 className="text-lg md:text-xl font-bold text-primary whitespace-nowrap">
            Knowledge Base
          </h1>
          {currentFile && (
            <span className="text-xs md:text-sm text-muted-foreground truncate hidden sm:inline">
              {currentFile}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          {/* Desktop sidebar toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="hidden md:flex"
            title={sidebarCollapsed ? 'Show Sidebar' : 'Hide Sidebar'}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen className="w-4 h-4" />
            ) : (
              <PanelLeftClose className="w-4 h-4" />
            )}
          </Button>

          {/* Preview toggle - hidden on very small screens */}
          <Button
            variant="ghost"
            size="sm"
            onClick={togglePreview}
            className="hidden sm:flex"
            title={showPreview ? 'Hide Preview' : 'Show Preview'}
          >
            {showPreview ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </Button>

          {/* Graph toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleGraph}
            title={showGraph ? 'Hide Graph' : 'Show Graph'}
          >
            <Network className="w-4 h-4" />
          </Button>

          {/* Save button - only when file is open */}
          {currentFile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              title="Save"
              className="hidden sm:flex"
            >
              <Save className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && isMobile && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed left-0 top-14 bottom-0 w-64 bg-card border-r border-border overflow-y-auto z-50 md:hidden">
              <FileTree />
            </div>
          </>
        )}

        {/* Desktop Sidebar */}
        {!sidebarCollapsed && !isMobile && (
          <div className="w-64 border-r border-border bg-card overflow-y-auto">
            <FileTree />
          </div>
        )}

        {/* Editor/Preview Area */}
        {!showGraph && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            <div
              className={cn(
                'flex-1 md:border-r border-border overflow-hidden',
                showPreview && !isMobile ? 'md:w-1/2' : 'w-full'
              )}
            >
              <Editor />
            </div>

            {showPreview && !isMobile && (
              <div className="flex-1 md:w-1/2 overflow-hidden">
                <Preview />
              </div>
            )}
          </div>
        )}

        {/* Graph View */}
        {showGraph && (
          <div className="flex-1 overflow-hidden">
            <Graph />
          </div>
        )}
      </div>

      {/* Mobile bottom bar - show current file */}
      {currentFile && isMobile && (
        <div className="h-10 px-3 border-t border-border bg-card flex items-center md:hidden">
          <span className="text-xs text-muted-foreground truncate">
            {currentFile}
          </span>
        </div>
      )}
    </div>
  )
}
