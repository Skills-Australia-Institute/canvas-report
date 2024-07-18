package api

import (
	"canvas-admin/canvas"
	"encoding/json"
	"net/http"

	"github.com/guregu/null/v5"
)

type EnrollmentResult struct {
	SISID           string      `json:"sis_id"`
	Name            string      `json:"name"`
	Account         string      `json:"account"`
	CourseName      string      `json:"course_name"`
	Section         string      `json:"section"`
	EnrollmentState string      `json:"enrollment_state"`
	CourseState     string      `json:"course_state"`
	CurrentGrade    null.String `json:"current_grade"`
	CurrentScore    null.Float  `json:"current_score"`
	EnrollmentRole  string      `json:"enrollment_role"`
	GradesURL       string      `json:"grades_url"`
}

// StudentEnrollment only
func (c *APIController) GetEnrollmentResultsByCourse(w http.ResponseWriter, r *http.Request, course canvas.Course) (int, error) {
	results := []EnrollmentResult{}

	states := []canvas.EnrollmentState{canvas.ActiveEnrollment, canvas.CompletedEnrollment}

	types := []canvas.EnrollmentType{canvas.StudentEnrollment}

	enrollments, code, err := c.canvas.GetEnrollmentsByCourseID(course.ID, states, types)
	if err != nil {
		return code, err
	}

	for _, enrollment := range enrollments {
		result := EnrollmentResult{
			SISID:           enrollment.User.SISUserID,
			Name:            enrollment.User.Name,
			CurrentGrade:    enrollment.Grades.CurrentGrade,
			CurrentScore:    enrollment.Grades.CurrentScore,
			GradesURL:       enrollment.Grades.HtmlUrl,
			EnrollmentState: enrollment.EnrollmentState,
			EnrollmentRole:  enrollment.Role,
			Section:         enrollment.SISSectionID,
			Account:         course.Account.Name,
			CourseName:      course.Name,
			CourseState:     course.WorkflowState,
		}

		results = append(results, result)
	}

	if err := json.NewEncoder(w).Encode(results); err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil
}

func (c *APIController) GetEnrollmentsResultsByUser(w http.ResponseWriter, r *http.Request, user canvas.User) (int, error) {
	states := []canvas.EnrollmentState{}

	for _, state := range r.URL.Query()["state[]"] {
		states = append(states, canvas.EnrollmentState(state))
	}

	results := []EnrollmentResult{}

	coursesMap := make(map[int]canvas.Course)

	enrollments, code, err := c.canvas.GetEnrollmentsByUserID(user.ID, states)
	if err != nil {
		return code, err
	}

	courses, code, err := c.canvas.GetCoursesByUserID(user.ID)
	if err != nil {
		return code, err
	}

	for _, course := range courses {
		coursesMap[course.ID] = course
	}

	for _, enrollment := range enrollments {
		result := EnrollmentResult{
			SISID:           enrollment.User.SISUserID,
			Name:            enrollment.User.Name,
			CurrentGrade:    enrollment.Grades.CurrentGrade,
			CurrentScore:    enrollment.Grades.CurrentScore,
			GradesURL:       enrollment.Grades.HtmlUrl,
			EnrollmentState: enrollment.EnrollmentState,
			EnrollmentRole:  enrollment.Role,
			Section:         enrollment.SISSectionID,
		}

		if course, ok := coursesMap[enrollment.CourseID]; ok {
			result.CourseName = course.Name
			result.CourseState = course.WorkflowState
			result.Account = course.Account.Name

		} else {
			course, code, err := c.canvas.GetCourseByID(enrollment.CourseID)
			if err != nil {
				return code, err
			}

			coursesMap[enrollment.CourseID] = course

			result.CourseName = course.Name
			result.CourseState = course.WorkflowState
			result.Account = course.Account.Name
		}

		if result.Section == "" {
			section, code, err := c.canvas.GetSectionByID(enrollment.CourseSectionID)
			if err != nil {
				return code, err
			}

			result.Section = section.Name
		}

		results = append(results, result)
	}

	if err := json.NewEncoder(w).Encode(results); err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil
}
