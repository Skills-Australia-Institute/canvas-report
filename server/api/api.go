package api

import (
	"canvas-admin/canvas"
	"canvas-admin/supabase"
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
	canvas                   *canvas.Canvas
	supabase                 *supabase.Supabase
	client                   *http.Client
}

func NewAPIController(canvasOAuth2ClientID, canavsOAuth2ClientSecret, canvasBaseUrl, addr string, client *http.Client, canvas *canvas.Canvas, supabase *supabase.Supabase) *APIController {
	return &APIController{
		canvasOAuth2ClientID:     canvasOAuth2ClientID,
		canavsOAuth2ClientSecret: canavsOAuth2ClientSecret,
		canvasBaseUrl:            canvasBaseUrl,
		addr:                     addr,
		client:                   client,
		canvas:                   canvas,
		supabase:                 supabase,
	}
}

func NewRouter(c *APIController, adminUrl string) *chi.Mux {
	r := chi.NewRouter()

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{adminUrl, "http://localhost:5173"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	}))

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second))

	r.Route("/", func(r chi.Router) {
		r.Get("/oauth2response", withError(c.oauth2ResponseHandler))

		r.Get("/courses/{course_id}/ungraded-assignments", withError(withCourse(c, c.GetUngradedAssignmentsByCourse)))
		r.Get("/courses/{course_id}/enrollments-results", withError(withAuth(c, withCourse(c, c.GetEnrollmentResultsByCourse))))

		r.Get("/users/{user_id}/assignments-results", withError(withUser(c, c.GetAssignmentsResultsByUser)))
		r.Get("/users/{user_id}/enrollments-results", withError(withUser(c, c.GetEnrollmentsResultsByUser)))
		r.Get("/hello", func(w http.ResponseWriter, r *http.Request) {
			w.Write([]byte("Hello World"))
		})

		r.Get("/accounts/{account_id}/courses", withError(c.GetCoursesByAccountID))
	})

	return r
}
