package canvas

import (
	"encoding/json"
	"fmt"
	"io"
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

func (c *Canvas) GetSectionsByCourseID(courseID int) (results []Section, code int, err error) {
	params := url.Values{}

	params.Add("page", "1")
	params.Add("per_page", strconv.Itoa(c.pageSize))
	params.Add("include[]", "total_students")

	requestUrl := fmt.Sprintf("%s/courses/%d/sections?%s", c.baseUrl, courseID, params.Encode())

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
			return nil, res.StatusCode, fmt.Errorf("error fetching sections of course: %d", courseID)
		}

		body, err := io.ReadAll(res.Body)
		res.Body.Close()
		if err != nil {
			return nil, http.StatusInternalServerError, err
		}

		sections := []Section{}
		if err := json.Unmarshal(body, &sections); err != nil {
			return nil, http.StatusInternalServerError, err
		}

		results = append(results, sections...)

		nextUrl := getNextUrl(res.Header.Get("Link"))

		if nextUrl == "" {
			break
		}

		requestUrl = nextUrl
	}

	return results, http.StatusOK, nil
}

func (c *Canvas) GetSectionByID(sectionID int) (section Section, code int, err error) {
	requestUrl := fmt.Sprintf("%s/sections/%d", c.baseUrl, sectionID)

	req, err := http.NewRequest(http.MethodGet, requestUrl, nil)
	if err != nil {
		return section, http.StatusInternalServerError, err
	}

	bearer := "Bearer " + c.accessToken
	req.Header.Add("Authorization", bearer)

	res, err := c.client.Do(req)
	if err != nil {
		return section, http.StatusInternalServerError, err
	}
	defer res.Body.Close()

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return section, http.StatusInternalServerError, err
	}

	if res.StatusCode != http.StatusOK {
		return section, res.StatusCode, fmt.Errorf("error fetching section: %d", sectionID)
	}

	if err := json.Unmarshal(body, &section); err != nil {
		return section, http.StatusInternalServerError, err
	}

	return section, http.StatusInternalServerError, nil
}
