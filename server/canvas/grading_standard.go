package canvas

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strconv"
)

type GradingStandard struct {
	ID            int             `json:"id"`
	Title         string          `json:"title"`
	ContextType   string          `json:"context_type"`
	ContextID     int             `json:"context_id"`
	GradingScheme []GradingScheme `json:"grading_scheme"`
}

type GradingScheme struct {
	Name  string  `json:"name"`
	Value float32 `json:"value"`
}

type GradingStandardContext string

const (
	GradingStandardAccountContext GradingStandardContext = "accounts"
	GradingStandardCourseContext  GradingStandardContext = "courses"
)

func (c *Canvas) GetGradingStandardsByContext(context GradingStandardContext, contextID int) (results []GradingStandard, code int, err error) {
	params := url.Values{}

	params.Add("per_page", strconv.Itoa(c.pageSize))

	requestUrl := fmt.Sprintf("%s/%s/%d/grading_standards?%s", c.baseUrl, context, contextID, params.Encode())

	for {
		req, err := http.NewRequest(http.MethodGet, requestUrl, nil)
		if err != nil {
			return nil, http.StatusInternalServerError, err
		}

		bearer := "Bearer " + c.accessToken
		req.Header.Add("Authorization", bearer)

		res, err := c.client.Do(req)
		if err != nil {
			return nil, http.StatusInternalServerError, err
		}

		if res.StatusCode != http.StatusOK {
			return nil, res.StatusCode, fmt.Errorf("error fetching grading standards by %s context with id: %d", context, contextID)
		}

		body, err := io.ReadAll(res.Body)
		res.Body.Close()
		if err != nil {
			return nil, http.StatusInternalServerError, err
		}

		gradingStandards := []GradingStandard{}

		if err := json.Unmarshal(body, &gradingStandards); err != nil {
			return nil, http.StatusInternalServerError, err
		}

		results = append(results, gradingStandards...)

		nextUrl := getNextUrl(res.Header.Get("Link"))

		if nextUrl == "" {
			break
		}

		requestUrl = nextUrl
	}

	return results, http.StatusOK, nil
}
