package canvas

type CanvasOAuth2Token struct {
	AccessToken string `json:"access_token"`
	TokenType   string `json:"token_type"`
	User        struct {
		ID   int    `json:"id"`
		Name string `json:"name"`
	} `json:"user"`
	RefreshToken string `json:"refresh_token"`
	ExpiresInt   int    `json:"expires_in"`
	CanvasRegion string `json:'canvas_region"`
}

// func (c *Canvas) GetOAuth2Token(state, code string) (oauth2Token CanvasOAuth2Token, statusCode int, err error) {
// 	params := url.Values{}

// 	params.Add("grant_type", "authorization_code")
// 	params.Add("client_id", "")
// 	params.Add("client_secret", "")
// 	params.Add("redirect_uri", "redirect_uri")
// 	params.Add("code", code)

// 	requestUrl := fmt.Sprintf("%s/login/oauth2/token", c.HtmlUrl)

// 	req, err := http.NewRequest(http.MethodGet, requestUrl, nil)
// 	if err != nil {
// 		return account, http.StatusInternalServerError, err
// 	}
// 	bearer := "Bearer " + c.accessToken
// 	req.Header.Add("Authorization", bearer)

// 	res, err := c.client.Do(req)
// 	if err != nil {
// 		return account, http.StatusInternalServerError, err
// 	}
// 	defer res.Body.Close()

// 	if res.StatusCode != http.StatusOK {
// 		return account, res.StatusCode, fmt.Errorf("error fetching account: %d", accountID)
// 	}

// 	body, err := io.ReadAll(res.Body)
// 	if err != nil {
// 		return account, http.StatusInternalServerError, err
// 	}

// 	if err := json.Unmarshal(body, &account); err != nil {
// 		return account, http.StatusInternalServerError, err
// 	}

// 	return account, http.StatusOK, nil
// }
