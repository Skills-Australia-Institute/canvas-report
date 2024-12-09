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

type GradeChangeLog struct {
	Events []struct {
		ID          string      `json:"id"`
		EventType   string      `json:"event_type"`
		GradeBefore null.String `json:"grade_before"`
		GradeAfter  null.String `json:"grade_after"`
		CreatedAt   string      `json:"created_at"`
		Links       struct {
			Course     int    `json:"course"`
			Student    string `json:"student"`
			Grader     string `json:"grader"`
			Assignment int    `json:"assignment"`
		}
	} `json:"events"`
	Linked struct {
		Assignments []GradeChangeLogAssignment `json:"assignments"`
		Courses     []GradeChangeLogCourse     `json:"courses"`
		Users       []GradeChangeLogUser       `json:"users"`
	} `json:"linked"`
}

type GradeChangeLogAssignment struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	CourseID int    `json:"course_id"`
}

type GradeChangeLogCourse struct {
	ID        int    `json:"id"`
	Name      string `json:"name"`
	AccountID int    `json:"account_id"`
}

type GradeChangeLogUser struct {
	ID   int    `json:"id"`
	Name string `json:"name"`
}

func (c *Canvas) GetGradeChangeLogsByGraderID(graderID int, startTime, endTime string) (results []GradeChangeLog, code int, err error) {
	params := url.Values{}

	params.Add("per_page", strconv.Itoa(c.pageSize))
	params.Add("start_time", startTime)
	params.Add("end_time", endTime)

	requestUrl := fmt.Sprintf("%s/audit/grade_change/graders/%d?%s", c.baseUrl, graderID, params.Encode())

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
			return nil, res.StatusCode, fmt.Errorf("error fetching grade change logs of grader: %d", graderID)
		}

		body, err := io.ReadAll(res.Body)
		res.Body.Close()
		if err != nil {
			return nil, http.StatusInternalServerError, err
		}

		var log GradeChangeLog

		if err := json.Unmarshal(body, &log); err != nil {
			return nil, http.StatusInternalServerError, err
		}

		results = append(results, log)

		nextUrl := getNextUrl(res.Header.Get("Link"))

		if nextUrl == "" {
			break
		}

		requestUrl = nextUrl
	}

	return results, http.StatusOK, nil
}
