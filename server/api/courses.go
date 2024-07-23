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

type GradingStandardCourse struct {
	Account           string      `json:"account"`
	Name              string      `json:"name"`
	SISCourseID       null.String `json:"sis_course_id"`
	GradingStandardID null.Int    `json:"grading_standard_id"`
	GradingStandard   string      `json:"grading_standard"`
	WorkflowState     string      `json:"workflow_state"`
	StartAt           null.String `json:"start_at"`
	EndAt             null.String `json:"end_at"`
}

func (c *APIController) GetGradingStandardCoursesByAccountID(w http.ResponseWriter, r *http.Request) (int, error) {
	accountID, err := strconv.Atoi(chi.URLParam(r, "account_id"))
	if err != nil {
		return http.StatusBadRequest, fmt.Errorf("invalid account id")
	}

	searchTerm := r.URL.Query().Get("search_term")

	results := []GradingStandardCourse{}

	courses, code, err := c.canvas.GetCoursesByAccountID(accountID, searchTerm, nil)
	if err != nil {
		return code, err
	}

	gradingStandards, code, err := c.canvas.GetGradingStandardsByContext(canvas.GradingStandardAccountContext, 1) // 1 is root account
	if err != nil {
		return code, err
	}

	gradingStandardsMap := make(map[int]canvas.GradingStandard)

	for _, gradingStandard := range gradingStandards {
		gradingStandardsMap[gradingStandard.ID] = gradingStandard
	}

	for _, course := range courses {
		result := GradingStandardCourse{
			Account:           course.Account.Name,
			Name:              course.Name,
			SISCourseID:       course.SISCourseID,
			GradingStandardID: course.GradingStandardID,
			WorkflowState:     course.WorkflowState,
			StartAt:           course.StartAt,
			EndAt:             course.EndAt,
		}

		if _, ok := gradingStandardsMap[int(course.GradingStandardID.Int64)]; !ok {
			gradingStandards, code, err := c.canvas.GetGradingStandardsByContext(canvas.GradingStandardCourseContext, course.ID)
			if err != nil {
				return code, err
			}

			for _, gradingStandard := range gradingStandards {
				gradingStandardsMap[gradingStandard.ID] = gradingStandard
			}
		}

		if gradingStandard, ok := gradingStandardsMap[int(course.GradingStandardID.Int64)]; ok {
			result.GradingStandard = gradingStandard.Title
		}

		results = append(results, result)
	}

	if err := json.NewEncoder(w).Encode(results); err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil
}

func (c *APIController) GetCoursesByAccountID(w http.ResponseWriter, r *http.Request) (int, error) {
	accountID, err := strconv.Atoi(chi.URLParam(r, "account_id"))
	if err != nil {
		return http.StatusBadRequest, fmt.Errorf("invalid account id")
	}

	types := []canvas.CourseEnrollmentType{canvas.StudentCourseEnrollment}

	results, code, err := c.canvas.GetCoursesByAccountID(accountID, "", types)
	if err != nil {
		return code, err
	}

	if err := json.NewEncoder(w).Encode(results); err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil
}
