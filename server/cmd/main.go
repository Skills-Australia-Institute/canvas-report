package main

import (
	"canvas-admin/api"
	"canvas-admin/canvas"
	"canvas-admin/supabase"
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"syscall"
	"time"

	_ "github.com/joho/godotenv/autoload"
)

func main() {

	// Canvas envs
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

	canvasPageSizeStr := os.Getenv("CANVAS_PAGE_SIZE")
	if canvasPageSizeStr == "" {
		log.Panic("missing env: CANVAS_PAGE_SIZE")
	}

	canvasPageSize, err := strconv.Atoi(canvasPageSizeStr)
	if err != nil {
		log.Panic("invalid env: CANVAS_PAGE_SIZE")
	}

	adminUrl := os.Getenv("CANVAS_ADMIN_URL")
	if adminUrl == "" {
		adminUrl = "http://localhost:5173"
	}

	apiAddr := os.Getenv("API")
	if apiAddr == "" {
		apiAddr = ":8080"
	}

	canavasAccessToken := os.Getenv("CANVAS_ACCESS_TOKEN")

	supabaseJwtSecret := os.Getenv("SUPABASE_JWT_SECRET")
	if supabaseJwtSecret == "" {
		log.Panic("missing env: SUPABASE_JWT_SECRET")
	}

	client := &http.Client{
		Timeout: time.Second * 5,
	}

	canvasHtmlUrl := strings.TrimSuffix(canvasBaseUrl, "/api/v1")

	canvas := canvas.New(canvasBaseUrl, canavasAccessToken, canvasPageSize, canvasHtmlUrl)

	supabase, err := supabase.New("", "", "")
	if err != nil {
		log.Panic(err)
	}

	apiController := api.NewAPIController(canvasOAuth2ClientID, canavsOAuth2ClientSecret, canvasBaseUrl, apiAddr, client, canvas, supabase)

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
