package api

import (
	"canvas-admin/canvas"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
)

type canvasOAuth2Token struct {
	AccessToken  string      `json:"access_token"`
	TokenType    string      `json:"token_type"`
	User         canvas.User `json:"user"`
	RefreshToken string      `json:"refresh_token"`
	ExpiresIn    int         `json:"expires_in"`
	CanvasRegion string      `json:"canvas_region"`
}

func (c *APIController) oauth2ResponseHandler(w http.ResponseWriter, r *http.Request) (int, error) {
	errMsg := r.URL.Query().Get("error")
	errDescription := r.URL.Query().Get("error_description")

	if errMsg != "" || errDescription != "" {
		return http.StatusBadRequest, fmt.Errorf("canvas authentication error")
	}

	params := url.Values{}

	params.Add("code", r.URL.Query().Get("code"))
	params.Add("state", r.URL.Query().Get("state"))
	params.Add("grant_type", "authorization_code")
	params.Add("client_id", c.canvasOAuth2ClientID)
	params.Add("client_secret", c.canavsOAuth2ClientSecret)
	params.Add("redirect_uri", r.URL.Path)

	requestUrl := fmt.Sprintf("%s/login/oauth2/auth/?%s", c.canvasBaseUrl, params.Encode())

	req, err := http.NewRequest(http.MethodPost, requestUrl, nil)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	res, err := c.client.Do(req)
	if err != nil {
		return http.StatusInternalServerError, err
	}
	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return http.StatusInternalServerError, err
	}

	var data canvasOAuth2Token

	if err := json.Unmarshal(body, &data); err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil

}
