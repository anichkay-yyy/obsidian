package parser

import (
	"regexp"
	"strings"
)

type Link struct {
	Raw    string // [[folder/note]]
	Target string // folder/note
	Alias  string // display text
	IsDir  bool   // true if ends with /
}

var wikilinkRegex = regexp.MustCompile(`\[\[([^\]]+)\]\]`)

// ExtractWikilinks extracts all wikilinks from markdown content
func ExtractWikilinks(content string) []Link {
	matches := wikilinkRegex.FindAllStringSubmatch(content, -1)
	links := make([]Link, 0, len(matches))

	for _, match := range matches {
		if len(match) < 2 {
			continue
		}

		raw := match[0]
		inner := match[1]

		// Parse [[target|alias]] syntax
		parts := strings.SplitN(inner, "|", 2)
		target := strings.TrimSpace(parts[0])
		alias := target

		if len(parts) == 2 {
			alias = strings.TrimSpace(parts[1])
		}

		// Check if it's a directory link (ends with /)
		isDir := strings.HasSuffix(target, "/")

		// Normalize target path
		target = strings.Trim(target, "/")
		if isDir && target != "" {
			target = target + "/"
		}

		links = append(links, Link{
			Raw:    raw,
			Target: target,
			Alias:  alias,
			IsDir:  isDir,
		})
	}

	return links
}
