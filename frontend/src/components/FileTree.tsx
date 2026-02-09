import { useEffect, useState } from 'react'
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from 'lucide-react'
import useStore from '@/store/useStore'
import { FileInfo } from '@/lib/api'
import { cn } from '@/lib/utils'

interface TreeNode {
  name: string
  path: string
  isDir: boolean
  children: TreeNode[]
  expanded: boolean
}

function buildTree(files: FileInfo[]): TreeNode[] {
  const root: TreeNode[] = []
  const map = new Map<string, TreeNode>()

  // Sort files by path
  const sortedFiles = [...files].sort((a, b) => a.path.localeCompare(b.path))

  for (const file of sortedFiles) {
    const parts = file.path.split('/')
    let currentPath = ''

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const parentPath = currentPath
      currentPath = currentPath ? `${currentPath}/${part}` : part

      if (!map.has(currentPath)) {
        const node: TreeNode = {
          name: part,
          path: currentPath,
          isDir: i < parts.length - 1 || file.isDir,
          children: [],
          expanded: false,
        }

        if (parentPath) {
          const parent = map.get(parentPath)
          if (parent) {
            parent.children.push(node)
          }
        } else {
          root.push(node)
        }

        map.set(currentPath, node)
      }
    }
  }

  return root
}

interface TreeItemProps {
  node: TreeNode
  level: number
  onSelect: (path: string) => void
  selectedPath: string | null
}

function TreeItem({ node, level, onSelect, selectedPath }: TreeItemProps) {
  const [expanded, setExpanded] = useState(node.expanded)

  const handleClick = () => {
    if (node.isDir) {
      setExpanded(!expanded)
    } else {
      onSelect(node.path)
    }
  }

  const isSelected = selectedPath === node.path

  return (
    <div>
      <div
        className={cn(
          "flex items-center gap-1 px-2 py-2 md:py-1 cursor-pointer hover:bg-secondary rounded-md transition-colors touch-manipulation",
          isSelected && "bg-accent text-accent-foreground"
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
        onClick={handleClick}
      >
        {node.isDir ? (
          <>
            {expanded ? (
              <ChevronDown className="w-4 h-4 md:w-4 md:h-4 flex-shrink-0" />
            ) : (
              <ChevronRight className="w-4 h-4 md:w-4 md:h-4 flex-shrink-0" />
            )}
            {expanded ? (
              <FolderOpen className="w-4 h-4 md:w-4 md:h-4 flex-shrink-0 text-primary" />
            ) : (
              <Folder className="w-4 h-4 md:w-4 md:h-4 flex-shrink-0 text-primary" />
            )}
          </>
        ) : (
          <>
            <div className="w-4" />
            <File className="w-4 h-4 md:w-4 md:h-4 flex-shrink-0 text-muted-foreground" />
          </>
        )}
        <span className="text-sm md:text-sm truncate">{node.name}</span>
      </div>

      {node.isDir && expanded && (
        <div>
          {node.children.map((child) => (
            <TreeItem
              key={child.path}
              node={child}
              level={level + 1}
              onSelect={onSelect}
              selectedPath={selectedPath}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function FileTree() {
  const { files, currentFile, loadFile, loadFiles } = useStore()
  const [tree, setTree] = useState<TreeNode[]>([])

  useEffect(() => {
    loadFiles()
  }, [loadFiles])

  useEffect(() => {
    if (files.length > 0) {
      setTree(buildTree(files))
    }
  }, [files])

  const handleSelect = (path: string) => {
    if (path.endsWith('.md')) {
      loadFile(path)
    }
  }

  return (
    <div className="h-full overflow-y-auto p-2 md:p-2">
      <div className="mb-2 px-2 py-2 md:py-1 font-semibold text-sm text-muted-foreground flex items-center justify-between">
        <span>Files</span>
        <span className="text-xs opacity-50">{files.length}</span>
      </div>
      {tree.length === 0 ? (
        <div className="px-2 py-4 text-sm text-muted-foreground text-center">
          No files found
        </div>
      ) : (
        tree.map((node) => (
          <TreeItem
            key={node.path}
            node={node}
            level={0}
            onSelect={handleSelect}
            selectedPath={currentFile}
          />
        ))
      )}
    </div>
  )
}
