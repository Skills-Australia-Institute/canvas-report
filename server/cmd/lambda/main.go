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
)

var chiLambda *chiadapter.ChiLambda

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

	canvasAdminUrl := os.Getenv("CANVAS_ADMIN_URL")
	if canvasAdminUrl == "" {
		log.Panic("missing env: CANVAS_ADMIN_URL")
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

	controller := api.NewAPIController(canvas, supabase)

	router := api.NewRouter(controller, canvasAdminUrl)

	chiLambda = chiadapter.New(router)
}

func handler(ctx context.Context, req events.APIGatewayProxyRequest) (events.APIGatewayProxyResponse, error) {
	return chiLambda.ProxyWithContext(ctx, req)
}

func main() {
	lambda.Start(handler)
}
