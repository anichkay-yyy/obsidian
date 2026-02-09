package main

import (
	"kb/api"
	"kb/config"
	"log"
)

func main() {
	cfg := config.Load()

	log.Println("Knowledge Base Server")
	log.Println("===================")

	server := api.NewServer(cfg.VaultPath)

	if err := api.Start(server, cfg.Port, cfg.AuthUser, cfg.AuthPass, cfg.StaticDir); err != nil {
		log.Fatal(err)
	}
}
