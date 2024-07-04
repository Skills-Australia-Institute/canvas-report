package api

import (
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

type APIController struct {
	canvasOAuth2ClientID     string
	canavsOAuth2ClientSecret string
	canvasBaseUrl            string
	addr                     string
	client                   *http.Client
}

func NewAPIController(canvasOAuth2ClientID, canavsOAuth2ClientSecret, canvasBaseUrl, addr string, client *http.Client) *APIController {
	return &APIController{
		canvasOAuth2ClientID:     canvasOAuth2ClientID,
		canavsOAuth2ClientSecret: canavsOAuth2ClientSecret,
		canvasBaseUrl:            canvasBaseUrl,
		addr:                     addr,
		client:                   client,
	}
}

func NewRouter(c *APIController, adminUrl string) *chi.Mux {
	r := chi.NewRouter()

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{adminUrl},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second))

	r.Route("/api", func(r chi.Router) {
		r.Get("/oauth2response", withError(c.oauth2ResponseHandler))
	})

	return r
}
