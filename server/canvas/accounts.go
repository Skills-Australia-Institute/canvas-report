package canvas

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"

	"github.com/guregu/null/v5"
)

type Account struct {
	ID              int      `json:"id"`
	Name            string   `json:"name"`
	ParentAccountID null.Int `json:"parent_account_id"`
	RootAccountID   null.Int `json:"root_account_id"`
	WorkflowState   string   `json:"workflow_state"`
}

func (c *CanvasClient) GetAccountByID(ctx context.Context, accountID int) (account Account, code int, err error) {
	requestUrl := fmt.Sprintf("%s/accounts/%d", c.baseUrl, accountID)

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, requestUrl, nil)
	if err != nil {
		return account, http.StatusInternalServerError, err
	}

	data, _, code, err := c.httpClient.do(req)
	if err != nil {
		return account, code, err
	}

	if err := json.Unmarshal(data, &account); err != nil {
		return account, http.StatusInternalServerError, err
	}

	return account, http.StatusOK, nil
}
