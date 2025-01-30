package canvas

import (
	"context"
	"encoding/json"
	"fmt"
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

func (c *CanvasClient) GetGradingStandardsByContext(ctx context.Context, context GradingStandardContext, contextID int) (results []GradingStandard, code int, err error) {
	params := url.Values{}

	params.Add("per_page", strconv.Itoa(c.pageSize))

	requestUrl := fmt.Sprintf("%s/%s/%d/grading_standards?%s", c.baseUrl, context, contextID, params.Encode())

	for {
		req, err := http.NewRequestWithContext(ctx, http.MethodGet, requestUrl, nil)
		if err != nil {
			return nil, http.StatusInternalServerError, err
		}

		data, link, code, err := c.httpClient.do(req)
		if err != nil {
			return nil, code, err
		}

		gradingStandards := []GradingStandard{}
		if err := json.Unmarshal(data, &gradingStandards); err != nil {
			return nil, http.StatusInternalServerError, err
		}

		results = append(results, gradingStandards...)

		nextUrl := getNextUrl(link)

		if nextUrl == "" {
			break
		}

		requestUrl = nextUrl
	}

	return results, http.StatusOK, nil
}
