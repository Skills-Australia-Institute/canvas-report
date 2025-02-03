package api

import (
	"canvas-admin/canvas"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
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
func (c *APIController) GetEnrollmentResultsByCourse(w http.ResponseWriter, r *http.Request) (int, error) {
	courseName := r.URL.Query().Get("course_name")
	if courseName == "" {
		return http.StatusBadRequest, fmt.Errorf("missing course_name query paramater")
	}

	accountName := r.URL.Query().Get("account_name")
	if accountName == "" {
		return http.StatusBadRequest, fmt.Errorf("missing account_name query parameter")
	}

	courseWorkflowState := r.URL.Query().Get("course_workflow_state")
	if courseWorkflowState == "" {
		return http.StatusBadRequest, fmt.Errorf("missing course_workflow_state query parameter")
	}

	courseID, err := strconv.Atoi(chi.URLParam(r, "course_id"))
	if err != nil {
		return http.StatusBadRequest, err
	}

	results := make([]EnrollmentResult, 0)

	states := []canvas.EnrollmentState{canvas.ActiveEnrollment, canvas.CompletedEnrollment}

	types := []canvas.EnrollmentType{canvas.StudentEnrollment}

	enrollments, code, err := c.canvasClient.GetEnrollmentsByCourseID(r.Context(), courseID, states, types)
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
			Account:         accountName,
			CourseName:      courseName,
			CourseState:     courseWorkflowState,
		}

		results = append(results, result)
	}

	if err := json.NewEncoder(w).Encode(results); err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil
}

func (c *APIController) GetEnrollmentsResultsByUser(w http.ResponseWriter, r *http.Request, user canvas.User) (int, error) {
	states := []canvas.EnrollmentState{canvas.ActiveEnrollment, canvas.CompletedEnrollment}

	results := make([]EnrollmentResult, 0)

	enrollments, code, err := c.canvasClient.GetEnrollmentsByUserID(r.Context(), user.ID, states)
	if err != nil {
		return code, err
	}

	coursesMap := make(map[int]canvas.Course, len(enrollments))

	courses, code, err := c.canvasClient.GetCoursesByUserID(r.Context(), user.ID)
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
			course, code, err := c.canvasClient.GetCourseByID(r.Context(), enrollment.CourseID)
			if err != nil {
				return code, err
			}

			coursesMap[enrollment.CourseID] = course

			result.CourseName = course.Name
			result.CourseState = course.WorkflowState
			result.Account = course.Account.Name
		}

		if result.Section == "" {
			section, code, err := c.canvasClient.GetSectionByID(r.Context(), enrollment.CourseSectionID)
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
