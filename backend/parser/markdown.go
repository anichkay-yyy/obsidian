package parser

import (
	"bytes"

	"github.com/yuin/goldmark"
	"github.com/yuin/goldmark/extension"
	"github.com/yuin/goldmark/renderer/html"
	wikilink "go.abhg.dev/goldmark/wikilink"
)

var md goldmark.Markdown

func init() {
	md = goldmark.New(
		goldmark.WithExtensions(
			extension.GFM,
			extension.Typographer,
			&wikilink.Extender{},
		),
		goldmark.WithRendererOptions(
			html.WithUnsafe(), // Allow HTML in markdown
		),
	)
}

// RenderMarkdown converts markdown to HTML
func RenderMarkdown(source []byte) ([]byte, error) {
	var buf bytes.Buffer
	if err := md.Convert(source, &buf); err != nil {
		return nil, err
	}
	return buf.Bytes(), nil
}
