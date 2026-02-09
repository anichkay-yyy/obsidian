import { useEffect } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { vscodeDark } from '@uiw/codemirror-theme-vscode'
import { EditorView } from '@codemirror/view'
import useStore from '@/store/useStore'

// Custom theme overrides to match app colors
const customTheme = EditorView.theme({
  '&': {
    backgroundColor: '#1e1e1e', // VSCode dark background
    height: '100%',
  },
  '.cm-gutters': {
    backgroundColor: '#1e1e1e',
    border: 'none',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: '#284CAC',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: '#284CAC40',
  },
})

export default function Editor() {
  const { currentContent, currentFile, setCurrentContent, saveFile } = useStore()

  useEffect(() => {
    // Auto-save on content change (debounced)
    if (!currentFile) return

    const timer = setTimeout(() => {
      if (currentContent && currentFile) {
        saveFile(currentFile, currentContent)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [currentContent, currentFile, saveFile])

  if (!currentFile) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Select a file to edit
      </div>
    )
  }

  return (
    <div className="h-full overflow-hidden">
      <CodeMirror
        value={currentContent}
        height="100%"
        theme={vscodeDark}
        extensions={[markdown(), customTheme]}
        onChange={(value) => setCurrentContent(value)}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
          foldGutter: true,
          syntaxHighlighting: true,
        }}
      />
    </div>
  )
}
