package canvas

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

type User struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	SISUserID string `json:"sis_user_id"`
}

func (c *Canvas) GetUserBySisID(sisID string) (user User, code int, err error) {
	requestUrl := fmt.Sprintf("%s/users/sis_user_id:%s", c.baseUrl, sisID)

	req, err := http.NewRequest(http.MethodGet, requestUrl, nil)
	if err != nil {
		return user, http.StatusInternalServerError, err
	}

	bearer := "Bearer " + c.accessToken
	req.Header.Add("Authorization", bearer)

	res, err := c.client.Do(req)
	if err != nil {
		return user, http.StatusInternalServerError, err
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return user, res.StatusCode, fmt.Errorf("error fetching user of sis id: %s", sisID)
	}

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return user, http.StatusInternalServerError, err
	}

	if err := json.Unmarshal(body, &user); err != nil {
		return user, http.StatusInternalServerError, err
	}

	return user, http.StatusOK, nil
}

func (c *Canvas) GetUserByID(userID int) (user User, code int, err error) {
	requestUrl := fmt.Sprintf("%s/users/%d", c.baseUrl, userID)

	req, err := http.NewRequest(http.MethodGet, requestUrl, nil)
	if err != nil {
		return user, http.StatusInternalServerError, err
	}

	bearer := "Bearer " + c.accessToken
	req.Header.Add("Authorization", bearer)

	res, err := c.client.Do(req)
	if err != nil {
		return user, http.StatusInternalServerError, err
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return user, res.StatusCode, fmt.Errorf("error fetching user: %d", userID)
	}

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return user, http.StatusInternalServerError, err
	}

	if err := json.Unmarshal(body, &user); err != nil {
		return user, http.StatusInternalServerError, err
	}

	return user, http.StatusOK, nil
}
