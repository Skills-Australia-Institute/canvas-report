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

type AssignmentBucket string

const (
	PastBucket        AssignmentBucket = "past"
	OverdueBucket     AssignmentBucket = "overdue"
	UndatedBucket     AssignmentBucket = "undated"
	UngradedBucket    AssignmentBucket = "ungraded"
	UnsubmittedBucket AssignmentBucket = "unsubmitted"
	UpcomingBucket    AssignmentBucket = "upcoming"
	FutureBucket      AssignmentBucket = "future"
	AllBucket         AssignmentBucket = "all" // "all" enum is not in database
)

type Assignment struct {
	ID                         int                   `json:"id"`
	CourseID                   int                   `json:"course_id"`
	Name                       string                `json:"name"`
	DueAt                      null.String           `json:"due_at"`
	UnlockAt                   null.String           `json:"unlock_at"`
	LockAt                     null.String           `json:"lock_at"`
	NeedsGradingCount          int                   `json:"needs_grading_count"`
	Published                  bool                  `json:"published"`
	HtmlUrl                    string                `json:"html_url"`
	NeedsGradingCountBySection []SectionNeedsGrading `json:"needs_grading_count_by_section"`
	AllDates                   []AssignmentDate      `json:"all_dates"`
	GradingStandardID          null.Int              `json:"grading_standard_id"`
	GradingType                string                `json:"grading_type"`
	OmitFromFinalGrade         bool                  `json:"omit_from_final_grade"`
	WorkflowState              string                `json:"workflow_state"`
}

type SectionNeedsGrading struct {
	SectionID         int `json:"section_id"`
	NeedsGradingCount int `json:"needs_grading_count"`
}

type AssignmentData struct {
	AssignmentID   int                      `json:"assignment_id"`
	Title          string                   `json:"title"`
	MaxScore       null.Float               `json:"max_score"`
	MinScore       null.Float               `json:"min_score"`
	PointsPossible null.Float               `json:"points_possible"`
	DueAt          string                   `json:"due_at"`
	UnlockAt       string                   `json:"unlock_at"`
	Submission     AssignmentDataSubmission `json:"submission"`
	Status         string                   `json:"status"`
}

type AssignmentDataSubmission struct {
	Score       null.Float  `json:"score"`
	SubmittedAt string      `json:"submitted_at"`
	PostedAt    null.String `json:"posted_at"`
}

type AssignmentDate struct {
	ID       null.Int `json:"id"`
	DueAt    string   `json:"due_at"`
	UnlockAt string   `json:"unlock_at"`
	LockAt   string   `json:"lock_at"`
	Title    string   `json:"title"`
	SetType  string   `json:"set_type"` // "Group", "CourseSection", "ADHOC", "Noop"
	SetID    null.Int `json:"set_id"`   // set_id is null when set_type is "ADHOC"
	Base     bool     `json:"base"`
}

func (c *Canvas) GetAssignmentsDataOfUserByCourseID(userID, courseID int) (results []AssignmentData, code int, err error) {
	params := url.Values{}

	params.Add("per_page", strconv.Itoa(c.pageSize))

	requestUrl := fmt.Sprintf("%s/courses/%d/analytics/users/%d/assignments?%s", c.baseUrl, courseID, userID, params.Encode())

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
			return nil, res.StatusCode, fmt.Errorf("error fetching assignment results of user: %d and course: %d", userID, courseID)
		}

		body, err := io.ReadAll(res.Body)
		res.Body.Close()
		if err != nil {
			return nil, http.StatusInternalServerError, err
		}

		ad := []AssignmentData{}
		if err := json.Unmarshal(body, &ad); err != nil {
			return nil, http.StatusInternalServerError, err
		}

		results = append(results, ad...)

		nextUrl := getNextUrl(res.Header.Get("Link"))

		if nextUrl == "" {
			break
		}

		requestUrl = nextUrl
	}

	return results, http.StatusOK, nil
}

func (c *Canvas) GetAssignmentsByCourseID(courseID int, searchTerm string, bucket AssignmentBucket, needsGradingCountBySection bool) (results []Assignment, code int, err error) {
	if len(searchTerm) == 1 {
		return nil, http.StatusBadRequest, fmt.Errorf("assignment search term is less than 2 characters")
	}

	params := url.Values{}

	params.Add("page_size", strconv.Itoa(c.pageSize))

	if len(searchTerm) >= 2 {
		params.Add("search_term", searchTerm)
	}

	if bucket != AllBucket {
		params.Add("bucket", string(bucket))
	}

	if needsGradingCountBySection {
		params.Add("needs_grading_count_by_section", "true")
		params.Add("include[]", "all_dates")
	}

	requestUrl := fmt.Sprintf("%s/courses/%d/assignments?%s", c.baseUrl, courseID, params.Encode())

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
			return nil, res.StatusCode, fmt.Errorf("error fetching assignments of course: %d", courseID)
		}

		body, err := io.ReadAll(res.Body)
		res.Body.Close()
		if err != nil {
			return nil, http.StatusInternalServerError, err
		}

		assignments := []Assignment{}

		if err := json.Unmarshal(body, &assignments); err != nil {
			return nil, http.StatusInternalServerError, err
		}

		results = append(results, assignments...)

		nextUrl := getNextUrl(res.Header.Get("Link"))

		if nextUrl == "" {
			break
		}

		requestUrl = nextUrl
	}

	return results, http.StatusOK, nil
}
