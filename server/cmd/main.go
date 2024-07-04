package main

import (
	"canvas-admin/api"
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	_ "github.com/joho/godotenv/autoload"
)

func main() {
	canvasOAuth2ClientID := os.Getenv("CANVAS_OAUTH2_CLIENT_ID")
	if canvasOAuth2ClientID == "" {
		log.Panic("missing env: CANVAS_OAUTH2_CLIENT_ID")
	}

	canavsOAuth2ClientSecret := os.Getenv("CANVAS_OAUTH2_CLIENT_SECRET")
	if canavsOAuth2ClientSecret == "" {
		log.Panic("missing env: CANVAS_OAUTH2_CLIENT_SECRET")
	}

	canvasBaseUrl := os.Getenv("CANVAS_BASE_URL")
	if canvasBaseUrl == "" {
		log.Panic("missing env: CANVAS_BASE_URL")
	}

	apiAddr := os.Getenv("API")
	if apiAddr == "" {
		apiAddr = ":8080"
	}

	adminUrl := os.Getenv("CANVAS_ADMIN_URL")
	if adminUrl == "" {
		adminUrl = "http://localhost:5173"
	}

	client := &http.Client{
		Timeout: time.Second * 5,
	}

	apiController := api.NewAPIController(canvasOAuth2ClientID, canavsOAuth2ClientSecret, canvasBaseUrl, apiAddr, client)

	router := api.NewRouter(apiController, adminUrl)

	server := &http.Server{
		Addr:    apiAddr,
		Handler: router,
	}

	go func() {
		log.Println("staring server...")

		err := server.ListenAndServe()
		if err != nil && err != http.ErrServerClosed {
			log.Printf("error listen and serve: %s\n", err)
		}
	}()

	signalChan := make(chan os.Signal, 1)

	signal.Notify(signalChan, os.Interrupt)
	signal.Notify(signalChan, syscall.SIGTERM)

	signal := <-signalChan

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*5)
	defer cancel()

	log.Printf("received signal %s, shutting down sever...\n", signal)

	if err := server.Shutdown(ctx); err != nil {
		log.Printf("error shutting down sever: %s\n", err)
	}
}
