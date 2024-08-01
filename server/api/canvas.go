package api

import (
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
)

func (c *APIController) GetCanvasOAuth2Url(w http.ResponseWriter, r *http.Request) (int, error) {
	params := url.Values{}

	params.Add("client_id", c.canvas.ClientID)
	params.Add("response_type", "code")
	params.Add("state", "state")
	params.Add("redirect_uri", "redirect_uri")

	url := fmt.Sprintf("%s/login/oauth2/auth?%s", c.canvas.HtmlUrl, params.Encode())

	payload := struct {
		Url string `json:"url"`
	}{
		Url: url,
	}

	if err := json.NewEncoder(w).Encode(payload); err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil
}

// func (c *APIController) GetCanvasOAuth2(w http.ResponseWriter, r *http.Request) (int, error) {
// 	code := chi.URLParam(r, "code")
// 	if code == "" {
// 		return http.StatusBadRequest, fmt.Errorf("missing code")
// 	}

// 	state := chi.URLParam(r, "state")
// 	if state == "" {
// 		return http.StatusBadRequest, fmt.Errorf("missing state")
// 	}

// 	types := []canvas.CourseEnrollmentType{canvas.StudentCourseEnrollment}

// 	results, code, err := c.canvas.HtmlUrl
// 	if err != nil {
// 		return code, err
// 	}

// 	if err := json.NewEncoder(w).Encode(results); err != nil {
// 		return http.StatusInternalServerError, err
// 	}

// 	return http.StatusOK, nil
// }
