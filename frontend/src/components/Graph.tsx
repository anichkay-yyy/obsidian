import { useEffect, useRef, useState } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import useStore from '@/store/useStore'
import { Node, Edge } from '@/lib/api'

export default function Graph() {
  const { graph, loadGraph, setSelectedNode, loadFile, toggleGraph } = useStore()
  const graphRef = useRef<any>()
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

  // Update graph dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      const container = graphRef.current?.parentElement
      if (container) {
        setDimensions({
          width: container.clientWidth,
          height: container.clientHeight,
        })
      }
    }

    updateDimensions()
    window.addEventListener('resize', updateDimensions)
    return () => window.removeEventListener('resize', updateDimensions)
  }, [])

  useEffect(() => {
    loadGraph()
  }, [loadGraph])

  // Настройка физики графа
  useEffect(() => {
    if (graphRef.current && graph) {
      // Настраиваем силы d3
      graphRef.current.d3Force('charge').strength(-300)
      graphRef.current.d3Force('link').distance(150)
      graphRef.current.d3Force('center').strength(0.1)

      // Перезапускаем симуляцию
      graphRef.current.d3ReheatSimulation()
    }
  }, [graph])

  if (!graph) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        Loading graph...
      </div>
    )
  }

  const graphData = {
    nodes: graph.nodes.map((node: Node) => ({
      id: node.id,
      name: node.title,
      type: node.type,
      path: node.path,
    })),
    links: graph.edges.map((edge: Edge) => ({
      source: edge.source,
      target: edge.target,
    })),
  }

  const handleNodeClick = (node: any) => {
    const graphNode = graph.nodes.find((n: Node) => n.id === node.id)
    if (graphNode) {
      setSelectedNode(graphNode)
      if (graphNode.type === 'file') {
        loadFile(graphNode.path)
        // Закрыть граф и показать редактор
        toggleGraph()
      }
    }
  }

  return (
    <div className="h-full w-full bg-background relative">
      <ForceGraph2D
        ref={graphRef}
        width={dimensions.width}
        height={dimensions.height}
        graphData={graphData}
        nodeLabel="name"
        nodeColor={(node: any) => {
          return node.type === 'directory' ? '#284CAC' : '#71717a'
        }}
        nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const label = node.name
          const fontSize = Math.max(12, 14 / globalScale)
          ctx.font = `${fontSize}px Sans-Serif`
          const textWidth = ctx.measureText(label).width
          const bckgDimensions = [textWidth, fontSize].map((n) => n + fontSize * 0.4)

          // Draw node shape - увеличены размеры
          const size = node.type === 'directory' ? 10 : 8

          if (node.type === 'directory') {
            // Square for directories
            ctx.fillStyle = '#284CAC'
            ctx.fillRect(
              node.x - size / 2,
              node.y - size / 2,
              size,
              size
            )
          } else {
            // Circle for files
            ctx.fillStyle = '#71717a'
            ctx.beginPath()
            ctx.arc(node.x, node.y, size, 0, 2 * Math.PI, false)
            ctx.fill()
          }

          // Draw label
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillStyle = '#0C0F16'
          ctx.fillRect(
            node.x - bckgDimensions[0] / 2,
            node.y + size + 4,
            bckgDimensions[0],
            bckgDimensions[1]
          )

          ctx.fillStyle = '#e4e4e7'
          ctx.fillText(label, node.x, node.y + size + 4 + fontSize / 2)
        }}
        linkColor={() => '#284CAC'}
        linkWidth={2}
        linkDirectionalArrowLength={4}
        linkDirectionalArrowRelPos={1}
        onNodeClick={handleNodeClick}
        backgroundColor="#000000"
        cooldownTicks={100}
        enableNodeDrag={true}
        enableZoomInteraction={true}
        enablePanInteraction={true}
        d3AlphaDecay={0.02}
        d3VelocityDecay={0.3}
        onEngineStop={() => {
          if (graphRef.current) {
            graphRef.current.zoomToFit(400, 80)
          }
        }}
      />

      {/* Mobile hint */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-card border border-border rounded-lg px-3 py-2 text-xs text-muted-foreground md:hidden">
        Pinch to zoom • Drag to pan
      </div>
    </div>
  )
}
