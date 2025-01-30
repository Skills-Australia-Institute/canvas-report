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

func (c *APIController) GetCoursesByAccountID(w http.ResponseWriter, r *http.Request) (int, error) {
	accountID, err := strconv.Atoi(chi.URLParam(r, "account_id"))
	if err != nil {
		return http.StatusBadRequest, fmt.Errorf("invalid account id")
	}

	types := []canvas.CourseEnrollmentType{canvas.StudentCourseEnrollment}

	results, code, err := c.canvasClient.GetCoursesByAccountID(r.Context(), accountID, "", types)
	if err != nil {
		return code, err
	}

	if err := json.NewEncoder(w).Encode(results); err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil
}
