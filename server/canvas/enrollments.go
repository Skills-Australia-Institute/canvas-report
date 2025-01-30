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

type Enrollment struct {
	ID              int    `json:"id"`
	UserID          int    `json:"user_id"`
	CourseID        int    `json:"course_id"`
	CourseSectionID int    `json:"course_section_id"`
	SISSectionID    string `json:"sis_section_id"`
	Grades          Grades `json:"grades"`
	User            User   `json:"user"`
	EnrollmentState string `json:"enrollment_state"`
	Role            string `json:"role"`
	Type            string `json:"type"`
	CreatedAt       string `json:"created_at"`
	UpdatedAt       string `json:"updated_at"`
}

type Grades struct {
	HtmlUrl      string      `json:"html_url"`
	CurrentScore null.Float  `json:"current_score"`
	CurrentGrade null.String `json:"current_grade"`
	FinalScore   null.Float  `json:"final_score"`
	FinalGrade   null.String `json:"final_grade"`
}

type EnrollmentType string

const (
	TeacherEnrollment  EnrollmentType = "TeacherEnrollment"
	StudentEnrollment  EnrollmentType = "StudentEnrollment"
	TaEnrollment       EnrollmentType = "TaEnrollment"
	DesignerEnrollment EnrollmentType = "DesignerEnrollment"
	ObserverEnrollment EnrollmentType = "ObserverEnrollment"
)

type EnrollmentState string

const (
	ActiveEnrollment    EnrollmentState = "active"
	InactiveEnrollment  EnrollmentState = "inactive"
	CompletedEnrollment EnrollmentState = "completed"
	InvitedEnrollment   EnrollmentState = "invited"
	RejectedEnrollment  EnrollmentState = "rejected"
	DeletedEnrollment   EnrollmentState = "deleted"
)

func (c *CanvasClient) GetEnrollmentsByUserID(ctx context.Context, userID int, states []EnrollmentState) (results []Enrollment, code int, err error) {
	params := url.Values{}

	params.Add("per_page", strconv.Itoa(c.pageSize))

	for _, state := range states {
		params.Add("state[]", string(state))
	}

	requestUrl := fmt.Sprintf("%s/users/%d/enrollments?%s", c.baseUrl, userID, params.Encode())

	for {
		req, err := http.NewRequestWithContext(ctx, http.MethodGet, requestUrl, nil)
		if err != nil {
			return nil, http.StatusInternalServerError, err
		}

		data, link, code, err := c.httpClient.do(req)
		if err != nil {
			return nil, code, err
		}

		enrollments := []Enrollment{}
		if err := json.Unmarshal(data, &enrollments); err != nil {
			return nil, http.StatusInternalServerError, err
		}

		results = append(results, enrollments...)

		nextUrl := getNextUrl(link)

		if nextUrl == "" {
			break
		}

		requestUrl = nextUrl
	}

	return results, http.StatusOK, nil
}

func (c *CanvasClient) GetEnrollmentsByCourseID(ctx context.Context, courseID int, states []EnrollmentState, types []EnrollmentType) (results []Enrollment, code int, err error) {
	params := url.Values{}

	params.Add("per_page", strconv.Itoa(c.pageSize))

	for _, state := range states {
		params.Add("state[]", string(state))
	}

	for _, t := range types {
		params.Add("type[]", string(t))
	}

	requestUrl := fmt.Sprintf("%s/courses/%d/enrollments?%s", c.baseUrl, courseID, params.Encode())

	for {
		req, err := http.NewRequestWithContext(ctx, http.MethodGet, requestUrl, nil)
		if err != nil {
			return nil, http.StatusInternalServerError, err
		}

		data, link, code, err := c.httpClient.do(req)
		if err != nil {
			return nil, code, err
		}

		enrollments := []Enrollment{}
		if err := json.Unmarshal(data, &enrollments); err != nil {
			return nil, http.StatusInternalServerError, err
		}

		results = append(results, enrollments...)

		nextUrl := getNextUrl(link)

		if nextUrl == "" {
			break
		}

		requestUrl = nextUrl
	}

	return results, http.StatusOK, nil
}

func (c *CanvasClient) GetEnrollmentsBySectionID(ctx context.Context, sectionID int, states []EnrollmentState, types []EnrollmentType) (results []Enrollment, code int, err error) {
	params := url.Values{}

	params.Add("per_page", strconv.Itoa(c.pageSize))

	for _, state := range states {
		params.Add("state[]", string(state))
	}

	for _, t := range types {
		params.Add("type[]", string(t))
	}

	requestUrl := fmt.Sprintf("%s/sections/%d/enrollments?%s", c.baseUrl, sectionID, params.Encode())

	for {
		req, err := http.NewRequestWithContext(ctx, http.MethodGet, requestUrl, nil)
		if err != nil {
			return nil, http.StatusInternalServerError, err
		}

		data, link, code, err := c.httpClient.do(req)
		if err != nil {
			return nil, code, err
		}

		enrollments := []Enrollment{}
		if err := json.Unmarshal(data, &enrollments); err != nil {
			return nil, http.StatusInternalServerError, err
		}

		results = append(results, enrollments...)

		nextUrl := getNextUrl(link)

		if nextUrl == "" {
			break
		}

		requestUrl = nextUrl
	}

	return results, http.StatusOK, nil
}
