package api

import (
	"fmt"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
)

func (c *APIController) TerminateUserSessions(w http.ResponseWriter, r *http.Request) (int, error) {
	userID, err := strconv.Atoi(chi.URLParam(r, "user_id"))
	if err != nil {
		return http.StatusBadRequest, fmt.Errorf("invalid user id")
	}

	code, err := c.canvasClient.TerminateUserSessions(r.Context(), userID)
	if err != nil {
		return code, err
	}

	return http.StatusOK, nil
}

func (c *APIController) TerminateMobileSessions(w http.ResponseWriter, r *http.Request) (int, error) {
	code, err := c.canvasClient.TerminateMobileSessions(r.Context())
	if err != nil {
		return code, err
	}

	return http.StatusOK, nil
}
