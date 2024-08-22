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

	"github.com/go-playground/validator/v10"
	_ "github.com/joho/godotenv/autoload"
)

var validate *validator.Validate

func main() {
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

	canvasAccessToken := os.Getenv("CANVAS_ACCESS_TOKEN")
	if canvasAccessToken == "" {
		log.Panic("missing env: CANVAS_ACCESS_TOKEN")
	}

	webUrl := os.Getenv("WEB_URL")
	if webUrl == "" {
		log.Panic("missing env: WEB_URL")
	}

	address := os.Getenv("API_ADDRESS")
	if address == "" {
		log.Panic("missing env: API_ADDRESS")
	}

	canvasHtmlUrl := strings.TrimSuffix(canvasBaseUrl, "/api/v1")

	canvas := canvas.New(canvasBaseUrl, canvasAccessToken, canvasPageSize, canvasHtmlUrl)

	supabaseBaseUrl := os.Getenv("SUPABASE_BASE_URL")
	if supabaseBaseUrl == "" {
		log.Panic("missing env: SUPABASE_BASE_URL")
	}

	supabasePublicAnonKey := os.Getenv("SUPABASE_PUBLIC_ANON_KEY")
	if supabasePublicAnonKey == "" {
		log.Panic("missing env: SUPABASE_PUBLIC_ANON_KEY")
	}

	supabaseJwtSecret := os.Getenv("SUPABASE_JWT_SECRET")
	if supabaseJwtSecret == "" {
		log.Panic("missing env: SUPABASE_JWT_SECRET")
	}

	supabase, err := supabase.New(supabaseBaseUrl, supabasePublicAnonKey, supabaseJwtSecret)
	if err != nil {
		log.Panic(err)
	}

	controller := api.NewAPIController(canvas, supabase, validate)

	router := api.NewRouter(controller, webUrl)

	server := &http.Server{
		Addr:    address,
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
