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

type Submission struct {
	ID           int         `json:"id"`
	User         User        `json:"user"`
	UserID       int         `json:"user_id"`
	AssignmentID int         `json:"assignment_id"`
	CourseID     int         `json:"course_id"`
	Grade        null.String `json:"grade"`
	SubmittedAt  null.String `json:"submitted_at"`
	GradedAt     null.String `json:"graded_at"`
	Attempt      null.Int    `json:"attempt"`
	GraderID     null.Int    `json:"grader_id"`
	Late         bool        `json:"late"`
	Excused      null.Bool   `json:"excused"`
	PreviewURL   string      `json:"preview_url"`
}

func (c *Canvas) GetSubmissionsByCourseIDAndAssignmentID(courseID int, assignmentID int) (results []Submission, code int, err error) {
	params := url.Values{}

	params.Add("page", "1")
	params.Add("per_page", strconv.Itoa(c.pageSize))
	params.Add("inlcude[]", "user")
	params.Add("include[]", "course")
	params.Add("include[]", "assignment")

	requestUrl := fmt.Sprintf("%s/courses/%d/assignments/%d/submissions?%s", c.baseUrl, courseID, assignmentID, params.Encode())

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

		body, err := io.ReadAll(res.Body)
		res.Body.Close()
		if err != nil {
			return nil, http.StatusInternalServerError, err
		}

		if res.StatusCode != http.StatusOK {
			return nil, res.StatusCode, fmt.Errorf("error fetching submissions of course: %d and assignment: %d", courseID, assignmentID)
		}

		submissions := []Submission{}

		if err := json.Unmarshal(body, &submissions); err != nil {
			return nil, http.StatusInternalServerError, err
		}

		results = append(results, submissions...)

		nextUrl := getNextUrl(res.Header.Get("Link"))
		if nextUrl == "" {
			break
		}

		requestUrl = nextUrl
	}

	return results, http.StatusOK, nil
}
