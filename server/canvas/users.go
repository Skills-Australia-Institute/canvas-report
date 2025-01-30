package canvas

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
)

type User struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	SISUserID string `json:"sis_user_id"`
}

func (c *CanvasClient) GetUserBySisID(ctx context.Context, sisID string) (user User, code int, err error) {
	requestUrl := fmt.Sprintf("%s/users/sis_user_id:%s", c.baseUrl, sisID)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, requestUrl, nil)
	if err != nil {
		return user, http.StatusInternalServerError, err
	}

	data, _, code, err := c.httpClient.do(req)
	if err != nil {
		return user, code, err
	}
	if err := json.Unmarshal(data, &user); err != nil {
		return user, http.StatusInternalServerError, err
	}

	return user, http.StatusOK, nil
}

func (c *CanvasClient) GetUserByID(ctx context.Context, userID int) (user User, code int, err error) {
	requestUrl := fmt.Sprintf("%s/users/%d", c.baseUrl, userID)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, requestUrl, nil)
	if err != nil {
		return user, http.StatusInternalServerError, err
	}

	data, _, code, err := c.httpClient.do(req)
	if err != nil {
		return user, code, err
	}
	if err := json.Unmarshal(data, &user); err != nil {
		return user, http.StatusInternalServerError, err
	}

	return user, http.StatusOK, nil
}
