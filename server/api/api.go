package api

import (
	"canvas-admin/canvas"
	"canvas-admin/supabase"
	"fmt"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
)

type APIController struct {
	canvasClient   *canvas.CanvasClient
	supabaseClient *supabase.SupabaseClient
	auther         *auther
}

func NewAPIController(canvasClient *canvas.CanvasClient, supabaseClient *supabase.SupabaseClient, secret []byte) *APIController {
	return &APIController{
		canvasClient:   canvasClient,
		supabaseClient: supabaseClient,
		auther:         newAuther(secret),
	}
}

func NewRouter(c *APIController, webUrl string) *chi.Mux {
	r := chi.NewRouter()

	r.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{webUrl},
		AllowedMethods:   []string{"GET", "POST", "PUT", "OPTIONS"},
		AllowedHeaders:   []string{"Origin", "X-Requested-With", "Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(60 * time.Second))

	r.Route("/", func(r chi.Router) {
		r.Get("/courses/{course_id}/ungraded-assignments", withError(withAuth(c, c.GetUngradedAssignmentsByCourse)))
		r.Get("/courses/{course_id}/enrollments-results", withError(withAuth(c, c.GetEnrollmentResultsByCourse)))
		r.Get("/courses/ungraded-assignments", withError(withAuth(c, c.GetUngradedAssignmentsByCourses)))

		r.Get("/users/{user_id}/assignments-results", withError(withAuth(c, withUser(c, c.GetAssignmentsResultsByUser))))
		r.Get("/users/{user_id}/enrollments-results", withError(withAuth(c, withUser(c, c.GetEnrollmentsResultsByUser))))
		r.Get("/users/{user_id}/ungraded-assignments", withError(withAuth(c, withUser(c, c.GetUngradedAssignmentsByUser))))
		r.Get("/users/{grader_id}/grade-change-logs", withError(withAuth(c, c.GetGradeChangeLogsByGraderID)))

		r.Get("/accounts/{account_id}/courses", withError(withAuth(c, c.GetCoursesByAccountID)))
		r.Get("/accounts/{account_id}/ungraded-assignments", withError(withAuth(c, c.GetUngradedAssignmentsByAccountID)))

		r.Get("/hello", hello)
	})

	return r
}

func hello(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	w.Write([]byte(fmt.Sprintf(`{"message":"Hello World","time":"%s"}`, time.Now())))
}
