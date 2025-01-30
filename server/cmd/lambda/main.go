package main

import (
	"canvas-admin/api"
	"canvas-admin/canvas"
	"canvas-admin/supabase"
	"context"
	"log"
	"os"
	"strconv"
	"strings"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	chiadapter "github.com/awslabs/aws-lambda-go-api-proxy/chi"
	"github.com/go-playground/validator/v10"
	_ "github.com/joho/godotenv/autoload"
)

var chiLambda *chiadapter.ChiLambda

var validate *validator.Validate

func init() {
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

	canvasHtmlUrl := strings.TrimSuffix(canvasBaseUrl, "/api/v1")

	canvasClient := canvas.NewCanvasClient(canvasBaseUrl, canvasAccessToken, canvasPageSize, canvasHtmlUrl)

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

	supabaseClient, err := supabase.NewSupabaseClient(supabaseBaseUrl, supabasePublicAnonKey, supabaseJwtSecret)
	if err != nil {
		log.Panic(err)
	}

	controller := api.NewAPIController(canvasClient, supabaseClient, []byte(supabaseJwtSecret))

	router := api.NewRouter(controller, webUrl)

	chiLambda = chiadapter.New(router)
}

func handler(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	return chiLambda.ProxyWithContext(ctx, req)
}

func main() {
	lambda.Start(handler)
}
