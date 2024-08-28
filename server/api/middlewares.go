package api

import (
	"canvas-admin/canvas"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/golang-jwt/jwt/v5"
)

type errorResponse struct {
	Error string `json:"error"`
}

func withError(next func(w http.ResponseWriter, r *http.Request) (int, error)) http.HandlerFunc {
	fn := func(w http.ResponseWriter, r *http.Request) {
		code, err := next(w, r)
		if err != nil {
			errResponse := errorResponse{
				Error: err.Error(),
			}

			if code == http.StatusInternalServerError {
				log.Printf("%v", err)
				errResponse.Error = http.StatusText(http.StatusInternalServerError)
			}

			jsonErr, err := json.Marshal(errResponse)
			if err != nil {
				http.Error(w, fmt.Sprintf(`{"error":%s}`, http.StatusText(http.StatusInternalServerError)), http.StatusInternalServerError)
				return
			}

			http.Error(w, string(jsonErr), code)
			return
		}
	}

	return fn
}

type claims struct {
	Email       string `json:"email"`
	AppMetaData struct {
		AppRole string `json:"app_role"`
	} `json:"app_metadata"`
	jwt.RegisteredClaims
}

func withAuth(c *APIController, next func(w http.ResponseWriter, r *http.Request) (int, error)) func(w http.ResponseWriter, r *http.Request) (int, error) {
	fn := func(w http.ResponseWriter, r *http.Request) (int, error) {
		authHeader := r.Header.Get("Authorization")

		if authHeader == "" {
			return http.StatusUnauthorized, fmt.Errorf("%s", http.StatusText(http.StatusUnauthorized))
		}

		const prefix = "Bearer "

		if !strings.HasPrefix(authHeader, prefix) {
			return http.StatusUnauthorized, fmt.Errorf("%s", http.StatusText(http.StatusUnauthorized))
		}

		token := strings.TrimPrefix(authHeader, prefix)
		if token == "" {
			return http.StatusUnauthorized, fmt.Errorf("%s", http.StatusText(http.StatusUnauthorized))
		}

		_, err := parseJwtToken(token, []byte(c.supabase.Secret))
		if err != nil {
			return http.StatusUnauthorized, fmt.Errorf("%s", http.StatusText(http.StatusUnauthorized))
		}

		return next(w, r)
	}

	return fn
}

func parseJwtToken(token string, secret []byte) (email string, err error) {
	t, err := jwt.ParseWithClaims(token, &claims{}, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
		}

		return secret, nil
	})

	if err != nil {
		return "", fmt.Errorf("error validating token: %v", err)
	}

	if claims, ok := t.Claims.(*claims); ok {
		return claims.Email, nil
	}

	return "", fmt.Errorf("error parsing token: %v", err)
}

func withCourse(c *APIController, next func(w http.ResponseWriter, r *http.Request, course canvas.Course) (int, error)) func(w http.ResponseWriter, r *http.Request) (int, error) {
	fn := func(w http.ResponseWriter, r *http.Request) (int, error) {
		courseID, err := strconv.Atoi(chi.URLParam(r, "course_id"))
		if err != nil {
			return http.StatusBadRequest, fmt.Errorf("invalid course id")
		}

		course, code, err := c.canvas.GetCourseByID(courseID)
		if err != nil {
			return code, err
		}

		return next(w, r, course)
	}

	return fn
}

func withUser(c *APIController, next func(w http.ResponseWriter, r *http.Request, user canvas.User) (int, error)) func(w http.ResponseWriter, r *http.Request) (int, error) {
	fn := func(w http.ResponseWriter, r *http.Request) (int, error) {
		userID, err := strconv.Atoi(chi.URLParam(r, "user_id"))
		if err != nil {
			return http.StatusBadRequest, fmt.Errorf("invalid user id")
		}

		user, code, err := c.canvas.GetUserByID(userID)
		if err != nil {
			return code, err
		}

		return next(w, r, user)
	}

	return fn
}
