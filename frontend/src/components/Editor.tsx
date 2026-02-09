import { useEffect } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { markdown } from '@codemirror/lang-markdown'
import { EditorView } from '@codemirror/view'
import useStore from '@/store/useStore'

const theme = EditorView.theme({
  '&': {
    backgroundColor: '#000000',
    color: '#e4e4e7',
    height: '100%',
  },
  '.cm-content': {
    caretColor: '#284CAC',
    fontFamily: 'monospace',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftColor: '#284CAC',
  },
  '&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection': {
    backgroundColor: '#284CAC40',
  },
  '.cm-activeLine': {
    backgroundColor: '#0C0F16',
  },
  '.cm-gutters': {
    backgroundColor: '#000000',
    color: '#71717a',
    border: 'none',
  },
  '.cm-activeLineGutter': {
    backgroundColor: '#0C0F16',
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
        extensions={[markdown(), theme]}
        onChange={(value) => setCurrentContent(value)}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightActiveLine: true,
          foldGutter: true,
        }}
      />
    </div>
  )
}
