package canvas

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strconv"

	"github.com/guregu/null/v5"
)

type Section struct {
	ID            int         `json:"id"`
	SISSectionID  string      `json:"sis_section_id"`
	Name          string      `json:"name"`
	StartAt       null.String `json:"start_at"`
	EndAt         null.String `json:"end_at"`
	CourseID      int         `json:"course_id"`
	TotalStudents null.Int    `json:"total_students"`
	CreatedAt     string      `json:"created_at"`
}

func (c *CanvasClient) GetSectionsByCourseID(ctx context.Context, courseID int) (results []Section, code int, err error) {
	params := url.Values{}

	params.Add("page", "1")
	params.Add("per_page", strconv.Itoa(c.pageSize))
	params.Add("include[]", "total_students")

	requestUrl := fmt.Sprintf("%s/courses/%d/sections?%s", c.baseUrl, courseID, params.Encode())

	for {
		req, err := http.NewRequestWithContext(ctx, http.MethodGet, requestUrl, nil)
		if err != nil {
			return nil, http.StatusInternalServerError, err
		}

		data, link, code, err := c.httpClient.do(req)
		if err != nil {
			return nil, code, err
		}

		sections := []Section{}
		if err := json.Unmarshal(data, &sections); err != nil {
			return nil, http.StatusInternalServerError, err
		}

		results = append(results, sections...)

		nextUrl := getNextUrl(link)

		if nextUrl == "" {
			break
		}

		requestUrl = nextUrl
	}

	return results, http.StatusOK, nil
}

func (c *CanvasClient) GetSectionByID(ctx context.Context, sectionID int) (section Section, code int, err error) {
	requestUrl := fmt.Sprintf("%s/sections/%d", c.baseUrl, sectionID)

	req, err := http.NewRequest(http.MethodGet, requestUrl, nil)
	if err != nil {
		return section, http.StatusInternalServerError, err
	}

	data, _, code, err := c.httpClient.do(req)
	if err != nil {
		return section, code, err
	}

	if err := json.Unmarshal(data, &section); err != nil {
		return section, http.StatusInternalServerError, err
	}

	return section, http.StatusOK, nil
}
