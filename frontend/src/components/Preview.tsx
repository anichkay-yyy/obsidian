import { useEffect, useState } from 'react'
import useStore from '@/store/useStore'
import mermaid from 'mermaid'
import katex from 'katex'
import 'katex/dist/katex.min.css'

// Initialize mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  themeVariables: {
    primaryColor: '#284CAC',
    primaryTextColor: '#e4e4e7',
    primaryBorderColor: '#284CAC',
    lineColor: '#284CAC',
    secondaryColor: '#0C0F16',
    tertiaryColor: '#18181b',
  },
})

export default function Preview() {
  const { currentFile, api, loadFile } = useStore()
  const [html, setHtml] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!currentFile || !api) {
      setHtml('')
      return
    }

    setLoading(true)

    api.readFile(currentFile)
      .then((file) => {
        let content = file.html || ''

        // Render LaTeX
        content = content.replace(/\$\$([^\$]+)\$\$/g, (_, math) => {
          try {
            return katex.renderToString(math, { displayMode: true })
          } catch (e) {
            return `<span class="text-destructive">LaTeX Error: ${e}</span>`
          }
        })

        content = content.replace(/\$([^\$]+)\$/g, (_, math) => {
          try {
            return katex.renderToString(math, { displayMode: false })
          } catch (e) {
            return `<span class="text-destructive">LaTeX Error: ${e}</span>`
          }
        })

        setHtml(content)
        setLoading(false)

        // Render mermaid diagrams after DOM update
        setTimeout(() => {
          const mermaidElements = document.querySelectorAll('.language-mermaid')
          mermaidElements.forEach((element, index) => {
            const code = element.textContent || ''
            const id = `mermaid-${index}-${Date.now()}`
            mermaid.render(id, code).then(({ svg }) => {
              element.innerHTML = svg
            }).catch((error) => {
              element.innerHTML = `<div class="text-destructive">Mermaid Error: ${error}</div>`
            })
          })
        }, 0)
      })
      .catch((error) => {
        console.error('Failed to load preview:', error)
        setHtml(`<div class="text-destructive">Error loading preview</div>`)
        setLoading(false)
      })
  }, [currentFile, api])

  if (!currentFile) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        No file selected
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Loading preview...
      </div>
    )
  }

  // Handle clicks on wikilinks
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement

    // Check if clicked element is a link
    const link = target.closest('a')
    if (!link) return

    const href = link.getAttribute('href')
    if (!href) return

    // Check if it's an external link
    if (href.startsWith('http://') || href.startsWith('https://')) {
      // External link - open in new tab
      e.preventDefault()
      window.open(href, '_blank', 'noopener,noreferrer')
      return
    }

    // Check if it's an internal wikilink (starts with / or is relative)
    if (href.startsWith('/') || (!href.includes('://') && !href.startsWith('#'))) {
      e.preventDefault()

      // Extract file path from href
      let filePath = href.startsWith('/') ? href.substring(1) : href

      // Skip directory links (end with /)
      if (filePath.endsWith('/')) {
        console.log('Directory link clicked:', filePath)
        // TODO: Show directory contents in future
        return
      }

      // If it doesn't end with .md, add it
      if (!filePath.endsWith('.md')) {
        filePath = filePath + '.md'
      }

      // Load the file
      console.log('Loading file from wikilink:', filePath)
      loadFile(filePath)
    }
  }

  return (
    <div className="h-full overflow-y-auto p-6">
      <div
        className="markdown-preview max-w-4xl mx-auto"
        dangerouslySetInnerHTML={{ __html: html }}
        onClick={handleClick}
      />
    </div>
  )
}
