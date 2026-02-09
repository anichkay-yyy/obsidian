package api

import (
	"io/fs"
	"kb/parser"
	"os"
	"path/filepath"
	"strings"
	"sync"
)

type NodeType string

const (
	NodeFile NodeType = "file"
	NodeDir  NodeType = "directory"
)

type Node struct {
	ID    string   `json:"id"`
	Type  NodeType `json:"type"`
	Title string   `json:"title"`
	Path  string   `json:"path"`
}

type Edge struct {
	Source string `json:"source"`
	Target string `json:"target"`
}

type Graph struct {
	Nodes []Node `json:"nodes"`
	Edges []Edge `json:"edges"`
	mu    sync.RWMutex
}

type GraphBuilder struct {
	vaultPath string
	graph     *Graph
}

func NewGraphBuilder(vaultPath string) *GraphBuilder {
	return &GraphBuilder{
		vaultPath: vaultPath,
		graph: &Graph{
			Nodes: make([]Node, 0),
			Edges: make([]Edge, 0),
		},
	}
}

// Build constructs the graph from the vault
func (gb *GraphBuilder) Build() (*Graph, error) {
	gb.graph.mu.Lock()
	defer gb.graph.mu.Unlock()

	nodeMap := make(map[string]Node)
	edges := make([]Edge, 0)
	dirNodes := make(map[string]bool)

	// Walk through all markdown files
	err := filepath.WalkDir(gb.vaultPath, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}

		// Skip hidden files and directories
		if strings.HasPrefix(d.Name(), ".") {
			if d.IsDir() {
				return filepath.SkipDir
			}
			return nil
		}

		// Process only markdown files
		if !d.IsDir() && strings.HasSuffix(d.Name(), ".md") {
			relPath, err := filepath.Rel(gb.vaultPath, path)
			if err != nil {
				return err
			}

			// Create file node
			nodeID := relPath
			title := strings.TrimSuffix(filepath.Base(relPath), ".md")

			nodeMap[nodeID] = Node{
				ID:    nodeID,
				Type:  NodeFile,
				Title: title,
				Path:  relPath,
			}

			// Read file and extract wikilinks
			content, err := os.ReadFile(path)
			if err != nil {
				return nil // Skip files we can't read
			}

			links := parser.ExtractWikilinks(string(content))
			for _, link := range links {
				target := link.Target

				// Handle directory links
				if link.IsDir {
					target = strings.TrimSuffix(target, "/")
					if target != "" {
						dirNodes[target+"/"] = true
					}
					edges = append(edges, Edge{
						Source: nodeID,
						Target: target + "/",
					})
				} else {
					// Handle file links
					if !strings.HasSuffix(target, ".md") {
						target = target + ".md"
					}
					edges = append(edges, Edge{
						Source: nodeID,
						Target: target,
					})
				}
			}
		}

		return nil
	})

	if err != nil {
		return nil, err
	}

	// Add directory nodes
	for dirPath := range dirNodes {
		if _, exists := nodeMap[dirPath]; !exists {
			title := filepath.Base(strings.TrimSuffix(dirPath, "/"))
			nodeMap[dirPath] = Node{
				ID:    dirPath,
				Type:  NodeDir,
				Title: title,
				Path:  dirPath,
			}
		}
	}

	// Convert map to slice
	nodes := make([]Node, 0, len(nodeMap))
	for _, node := range nodeMap {
		nodes = append(nodes, node)
	}

	gb.graph.Nodes = nodes
	gb.graph.Edges = edges

	return gb.graph, nil
}

// GetGraph returns the current graph
func (gb *GraphBuilder) GetGraph() *Graph {
	gb.graph.mu.RLock()
	defer gb.graph.mu.RUnlock()
	return gb.graph
}

// GetBacklinks returns all nodes that link to the given path
func (gb *GraphBuilder) GetBacklinks(targetPath string) []string {
	gb.graph.mu.RLock()
	defer gb.graph.mu.RUnlock()

	backlinks := make([]string, 0)
	for _, edge := range gb.graph.Edges {
		if edge.Target == targetPath {
			backlinks = append(backlinks, edge.Source)
		}
	}
	return backlinks
}
