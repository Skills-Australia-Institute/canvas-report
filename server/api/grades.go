package api

import (
	"canvas-admin/canvas"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"sync"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/guregu/null/v5"
)

type GradeChangeLog struct {
	ID              string      `json:"id"`
	CreatedAt       string      `json:"created_at"`
	EventType       string      `json:"event_type"`
	GradeBefore     null.String `json:"grade_before"`
	GradeAfter      null.String `json:"grade_after"`
	UserName        string      `json:"user_name"`
	UserID          int         `json:"user_id"`
	CourseName      string      `json:"course_name"`
	CourseID        int         `json:"course_id"`
	AccountID       int         `json:"account_id"`
	AssignmentID    int         `json:"assignment_id"`
	AssignmentTitle string      `json:"assignment_title"`
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

type GradeChangeLogAssignment struct {
	ID       int    `json:"id"`
	Name     string `json:"name"`
	CourseID int    `json:"course_id"`
}

func (c *APIController) GetGradeChangeLogsByGraderID(w http.ResponseWriter, r *http.Request) (int, error) {
	graderID, err := strconv.Atoi(chi.URLParam(r, "grader_id"))
	if err != nil {
		return http.StatusBadRequest, fmt.Errorf("invalid grader id")
	}

	startTime := r.URL.Query().Get("start_time")
	if !isDateValue(startTime) {
		return http.StatusBadRequest, fmt.Errorf("invalid start time")
	}

	endTime := r.URL.Query().Get("end_time")
	if !isDateValue(endTime) {
		return http.StatusBadRequest, fmt.Errorf("invalid end time")
	}

	results, code, err := c.canvasClient.GetGradeChangeLogsByGraderID(r.Context(), graderID, startTime, endTime)
	if err != nil {
		return code, err
	}

	coursesCache := make(map[int]*GradeChangeLogCourse)

	usersCache := make(map[int]*GradeChangeLogUser)

	assignmentsCache := make(map[int]*GradeChangeLogAssignment)

	logs := []GradeChangeLog{}

	for _, result := range results {
		var wg sync.WaitGroup
		wg.Add(3)

		go processCourses(&wg, coursesCache, result.Linked.Courses)
		go processAssignments(&wg, assignmentsCache, result.Linked.Assignments)
		go processUsers(&wg, usersCache, result.Linked.Users)

		wg.Wait()

		for _, e := range result.Events {
			log := GradeChangeLog{
				ID:          e.ID,
				EventType:   e.EventType,
				GradeBefore: e.GradeBefore,
				GradeAfter:  e.GradeAfter,
				CreatedAt:   e.CreatedAt,
			}

			if c := coursesCache[e.Links.Course]; c != nil {
				log.CourseID = c.ID
				log.CourseName = c.Name
				log.AccountID = c.AccountID
			}

			if a := assignmentsCache[e.Links.Assignment]; a != nil {
				log.AssignmentID = a.ID
				log.AssignmentTitle = a.Name
			}

			studentID, err := strconv.Atoi(e.Links.Student)
			if err != nil {
				return http.StatusInternalServerError, fmt.Errorf("invalid studuent id: %s on event:%s", e.Links.Student, e.ID)
			}

			if u := usersCache[studentID]; u != nil {
				log.UserID = u.ID
				log.UserName = u.Name
			}

			logs = append(logs, log)
		}
	}

	if err := json.NewEncoder(w).Encode(logs); err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil
}

func isDateValue(date string) bool {
	_, err := time.Parse("Mon Jan 2 2006", date)
	return err == nil
}

func processCourses(wg *sync.WaitGroup, coursesCache map[int]*GradeChangeLogCourse, courses []canvas.GradeChangeLogCourse) {
	defer wg.Done()

	for _, c := range courses {
		if coursesCache[c.ID] == nil {
			coursesCache[c.ID] = &GradeChangeLogCourse{
				ID:        c.ID,
				Name:      c.Name,
				AccountID: c.AccountID,
			}
		}
	}
}

func processAssignments(wg *sync.WaitGroup, assignmentsCache map[int]*GradeChangeLogAssignment, assignments []canvas.GradeChangeLogAssignment) {
	defer wg.Done()

	for _, a := range assignments {
		if assignmentsCache[a.ID] == nil {
			assignmentsCache[a.ID] = &GradeChangeLogAssignment{
				ID:       a.ID,
				Name:     a.Name,
				CourseID: a.CourseID,
			}
		}
	}
}

func processUsers(wg *sync.WaitGroup, usersCache map[int]*GradeChangeLogUser, users []canvas.GradeChangeLogUser) {
	defer wg.Done()

	for _, u := range users {
		if usersCache[u.ID] == nil {
			usersCache[u.ID] = &GradeChangeLogUser{
				ID:   u.ID,
				Name: u.Name,
			}
		}
	}
}
