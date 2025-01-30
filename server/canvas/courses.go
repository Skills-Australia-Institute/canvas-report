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

type CourseEnrollmentType string

const (
	TeacherCourseEnrollment  CourseEnrollmentType = "teacher"
	StudentCourseEnrollment  CourseEnrollmentType = "student"
	TaCourseEnrollment       CourseEnrollmentType = "ta"
	ObserverCourseEnrollment CourseEnrollmentType = "observer"
	DesignerCourseEnrollment CourseEnrollmentType = "designer"
)

type CourseWorkflowState string

const (
	ClaimedCourseWorkflowState   CourseWorkflowState = "claimed"
	AvailableCourseWorkflowState CourseWorkflowState = "available"
	DeletedCourseWorkflowState   CourseWorkflowState = "deleted"
)

type Course struct {
	ID                int         `json:"id"`
	CourseCode        string      `json:"course_code"`
	Name              string      `json:"name"`
	SISCourseID       null.String `json:"sis_course_id"`
	GradingStandardID null.Int    `json:"grading_standard_id"`
	AccountID         int         `json:"account_id"`
	RootAccountID     int         `json:"root_account_id"`
	FriendlyName      null.String `json:"friendly_name"`
	WorkflowState     string      `json:"workflow_state"`
	StartAt           null.String `json:"start_at"`
	EndAt             null.String `json:"end_at"`
	IsPublic          bool        `json:"is_public"`
	EnrollmentTermID  int         `json:"enrollment_term_id"`
	Account           Account     `json:"account"`
	Sections          []Section   `json:"sections"`
}

func (c *CanvasClient) GetCourseByID(ctx context.Context, courseID int) (course Course, code int, err error) {
	params := url.Values{}

	params.Add("include[]", "account")

	requestUrl := fmt.Sprintf("%s/courses/%d?%s", c.baseUrl, courseID, params.Encode())

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, requestUrl, nil)
	if err != nil {
		return course, http.StatusInternalServerError, err
	}

	data, _, code, err := c.httpClient.do(req)
	if err != nil {
		return course, code, err
	}

	if err := json.Unmarshal(data, &course); err != nil {
		return course, http.StatusInternalServerError, err
	}

	return course, http.StatusOK, nil
}

// If "types" is set, only return courses that have at least one user enrolled in in the course with one of the specified enrollment types.
func (c *CanvasClient) GetCoursesByAccountID(ctx context.Context, accountID int, searchTerm string, types []CourseEnrollmentType) (results []Course, code int, err error) {
	if len(searchTerm) == 1 {
		return nil, http.StatusBadRequest, fmt.Errorf("course search term is less than 2 characters")
	}

	params := url.Values{}

	params.Add("per_page", strconv.Itoa(c.pageSize))
	params.Add("include[]", "account")

	if len(searchTerm) >= 2 {
		params.Add("search_term", searchTerm)
	}

	for _, t := range types {
		params.Add("enrollment_type[]", string(t))
	}

	requestUrl := fmt.Sprintf("%s/accounts/%d/courses?%s", c.baseUrl, accountID, params.Encode())

	for {
		req, err := http.NewRequestWithContext(ctx, http.MethodGet, requestUrl, nil)
		if err != nil {
			return nil, http.StatusInternalServerError, err
		}

		data, link, code, err := c.httpClient.do(req)
		if err != nil {
			return nil, code, err
		}

		courses := []Course{}
		if err := json.Unmarshal(data, &courses); err != nil {
			return nil, http.StatusInternalServerError, err
		}

		results = append(results, courses...)

		nextUrl := getNextUrl(link)

		if nextUrl == "" {
			break
		}

		requestUrl = nextUrl
	}

	return results, http.StatusOK, nil
}

func (c *CanvasClient) GetCoursesByUserID(ctx context.Context, userID int) (results []Course, code int, err error) {
	params := url.Values{}

	params.Add("per_page", strconv.Itoa(c.pageSize))
	params.Add("include[]", "account")
	params.Add("include[]", "sections")

	requestUrl := fmt.Sprintf("%s/users/%d/courses?%s", c.baseUrl, userID, params.Encode())

	for {
		req, err := http.NewRequestWithContext(ctx, http.MethodGet, requestUrl, nil)
		if err != nil {
			return nil, http.StatusInternalServerError, err
		}

		data, link, code, err := c.httpClient.do(req)
		if err != nil {
			return nil, code, err
		}

		courses := []Course{}
		if err := json.Unmarshal(data, &courses); err != nil {
			return nil, http.StatusInternalServerError, err
		}

		results = append(results, courses...)

		nextUrl := getNextUrl(link)

		if nextUrl == "" {
			break
		}

		requestUrl = nextUrl
	}

	return results, http.StatusOK, nil
}
