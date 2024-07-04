package api

import (
	"encoding/json"
	"fmt"
	"net/http"
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
