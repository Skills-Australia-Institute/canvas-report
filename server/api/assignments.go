package api

import (
	"canvas-admin/canvas"
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strconv"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/guregu/null/v5"
)

type UngradedAssignment struct {
	Name                  string `json:"name"`
	Section               string `json:"section"`
	CourseID              int    `json:"course_id"`
	NeedingGradingSection int    `json:"needs_grading_section"`
	Teachers              string `json:"teachers"`
	DueAt                 string `json:"due_at"`
	UnlockAt              string `json:"unlock_at"`
	LockAt                string `json:"lock_at"`
	Published             bool   `json:"published"`
	GradebookURL          string `json:"gradebook_url"`
}

type UngradedAssignmentWithAccountCourseInfo struct {
	Account               string `json:"account"`
	CourseName            string `json:"course_name"`
	Name                  string `json:"name"`
	Section               string `json:"section"`
	CourseID              int    `json:"course_id"`
	NeedingGradingSection int    `json:"needs_grading_section"`
	Teachers              string `json:"teachers"`
	DueAt                 string `json:"due_at"`
	UnlockAt              string `json:"unlock_at"`
	LockAt                string `json:"lock_at"`
	Published             bool   `json:"published"`
	GradebookURL          string `json:"gradebook_url"`
}

type UngradedAssignmentOfUser struct {
	UserSisID       string     `json:"user_sis_id"`
	Name            string     `json:"name"`
	Acccount        string     `json:"account"`
	CourseName      string     `json:"course_name"`
	Section         string     `json:"section"`
	Title           string     `json:"title"`
	PointsPossible  null.Float `json:"points_possible"`
	Score           null.Float `json:"score"`
	SubmittedAt     string     `json:"submitted_at"`
	Status          string     `json:"status"`
	DueAt           string     `json:"due_at"`
	CourseState     string     `json:"course_state"`
	EnrollmentRole  string     `json:"enrollment_role"`
	EnrollmentState string     `json:"enrollment_state"`
}

type AssignmentResult struct {
	UserSisID       string     `json:"user_sis_id"`
	Name            string     `json:"name"`
	Acccount        string     `json:"account"`
	CourseName      string     `json:"course_name"`
	Section         string     `json:"section"`
	Title           string     `json:"title"`
	PointsPossible  null.Float `json:"points_possible"`
	Score           null.Float `json:"score"`
	Discrepancy     string     `json:"discrepancy"`
	SubmittedAt     string     `json:"submitted_at"`
	Status          string     `json:"status"`
	DueAt           string     `json:"due_at"`
	CourseState     string     `json:"course_state"`
	EnrollmentRole  string     `json:"enrollment_role"`
	EnrollmentState string     `json:"enrollment_state"`
}

type GradingStandardAssignment struct {
	Account            string      `json:"Account"`
	CourseName         string      `json:"course_name"`
	Name               string      `json:"name"`
	CourseState        string      `json:"course_state"`
	GradingStandardID  null.Int    `json:"grading_standard_id"`
	GradingStandard    string      `json:"grading_standard"`
	GradingType        string      `json:"grading_type"`
	OmitFromFinalGrade bool        `json:"omit_from_final_grade"`
	WorkflowState      string      `json:"workflow_state"`
	DueAt              null.String `json:"due_at"`
	UnlockAt           null.String `json:"unlock_at"`
	LockAt             null.String `json:"lock_at"`
}

type AdditionalAttemptAssignment struct {
	Qualification     string      `json:"Account"`
	CourseName        string      `json:"course_name"`
	Name              string      `json:"name"`
	LockAt            null.String `json:"lock_at"`
	NeedsGradingCount int         `json:"needs_grading_count"`
	HtmlUrl           string      `json:"html_url"`
}

type AssignmentWithGradingType struct {
	Account       string `json:"account"`
	Course        string `json:"course"`
	Assignment    string `json:"assignment"`
	GradingType   string `json:"grading_type"`
	WorkflowState string `json:"workflow_state"`
	HTMLUrl       string `json:"html_url"`
}

type GetUngradedAssignmentsByUserResponse struct {
	UserSisID       string     `json:"user_sis_id"`
	Name            string     `json:"name"`
	Acccount        string     `json:"account"`
	CourseName      string     `json:"course_name"`
	Section         string     `json:"section"`
	Title           string     `json:"title"`
	PointsPossible  null.Float `json:"points_possible"`
	Score           null.Float `json:"score"`
	SubmittedAt     string     `json:"submitted_at"`
	Status          string     `json:"status"`
	CourseState     string     `json:"course_state"`
	EnrollmentRole  string     `json:"enrollment_role"`
	EnrollmentState string     `json:"enrollment_state"`
	SpeedGraderUrl  string     `json:"speedgrader_url"`
}

const (
	AssessmentCoversheet string = "Assessment Coversheet"
	StatusOnTime         string = "on_time"
	StatusLate           string = "late"
)

func (c *APIController) GetUngradedAssignmentsByUser(w http.ResponseWriter, r *http.Request, user canvas.User) (int, error) {
	ctx, cancel := context.WithCancel(r.Context())
	defer cancel()

	results := make([]GetUngradedAssignmentsByUserResponse, 0)

	// skip "invited", "rejected", and "deleted" enrollments
	states := []canvas.EnrollmentState{canvas.ActiveEnrollment, canvas.CompletedEnrollment}

	enrollments, code, err := c.canvasClient.GetEnrollmentsByUserID(ctx, user.ID, states)
	if err != nil {
		return code, err
	}

	coursesMap := make(map[int]canvas.Course, len(enrollments))

	courses, code, err := c.canvasClient.GetCoursesByUserID(ctx, user.ID)
	if err != nil {
		return code, err
	}

	for _, course := range courses {
		coursesMap[course.ID] = course
	}

outer:
	for _, enrollment := range enrollments {
		select {
		case <-ctx.Done():
			return http.StatusRequestTimeout, ctx.Err()
		default:
			{
				if enrollment.Role != string(canvas.StudentEnrollment) {
					continue outer
				}

				if _, ok := coursesMap[enrollment.CourseID]; !ok {
					course, code, err := c.canvasClient.GetCourseByID(ctx, enrollment.CourseID)
					if err != nil {
						return code, err
					}

					coursesMap[enrollment.CourseID] = course
				}

				if coursesMap[enrollment.CourseID].WorkflowState != string(canvas.AvailableCourseWorkflowState) {
					continue outer
				}

				data, code, err := c.canvasClient.GetSubmissionsByCourseID(ctx, enrollment.CourseID, user.ID, canvas.SubmittedSubmissionWorkflowState)
				if err != nil {
					return code, err
				}

				sectionName := enrollment.SISSectionID

				if sectionName == "" {
					section, code, err := c.canvasClient.GetSectionByID(ctx, enrollment.CourseSectionID)
					if err != nil {
						return code, err
					}

					sectionName = section.Name
				}

			inner:
				for _, submission := range data {
					if strings.Contains(submission.Assignment.Name, AssessmentCoversheet) {
						continue inner
					}

					result := GetUngradedAssignmentsByUserResponse{
						Title:           submission.Assignment.Name,
						PointsPossible:  submission.Assignment.PointsPossible,
						Score:           submission.Score,
						SubmittedAt:     submission.SubmittedAt.String,
						UserSisID:       user.SISUserID,
						Name:            user.Name,
						Section:         sectionName,
						EnrollmentRole:  enrollment.Role,
						EnrollmentState: enrollment.EnrollmentState,
						Status:          StatusOnTime,
						SpeedGraderUrl: fmt.Sprintf("%s/courses/%d/gradebook/speed_grader?assignment_id=%d&student_id=%d",
							c.canvasClient.HtmlUrl, enrollment.CourseID, submission.AssignmentID, submission.UserID),
						Acccount:    coursesMap[enrollment.CourseID].Account.Name,
						CourseName:  coursesMap[enrollment.CourseID].Name,
						CourseState: coursesMap[enrollment.CourseID].WorkflowState,
					}

					if submission.Late {
						result.Status = StatusLate
					}

					results = append(results, result)
				}
			}
		}
	}

	if err := json.NewEncoder(w).Encode(results); err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil
}

func (c *APIController) GetAssignmentsResultsByUser(w http.ResponseWriter, r *http.Request, user canvas.User) (int, error) {
	ctx, cancel := context.WithCancel(r.Context())
	defer cancel()

	results := make([]AssignmentResult, 0)

	// for "invited", "rejected", and "deleted", GetAssignmentsDataOfUserByCourseID return 404 error
	// so skip those enrollments
	states := []canvas.EnrollmentState{canvas.ActiveEnrollment, canvas.CompletedEnrollment}

	enrollments, code, err := c.canvasClient.GetEnrollmentsByUserID(ctx, user.ID, states)
	if err != nil {
		return code, err
	}

	coursesMap := make(map[int]canvas.Course, len(enrollments))

	courses, code, err := c.canvasClient.GetCoursesByUserID(ctx, user.ID)
	if err != nil {
		return code, err
	}

	for _, course := range courses {
		coursesMap[course.ID] = course
	}

outer:
	for _, enrollment := range enrollments {
		select {
		case <-ctx.Done():
			return http.StatusRequestTimeout, ctx.Err()
		default:
			{
				if enrollment.Role != string(canvas.StudentEnrollment) {
					continue outer
				}

				if _, ok := coursesMap[enrollment.CourseID]; !ok {
					course, code, err := c.canvasClient.GetCourseByID(ctx, enrollment.CourseID)
					if err != nil {
						return code, err
					}

					coursesMap[enrollment.CourseID] = course
				}

				if coursesMap[enrollment.CourseID].WorkflowState != string(canvas.AvailableCourseWorkflowState) {
					continue outer
				}

				data, code, err := c.canvasClient.GetAssignmentsDataOfUserByCourseID(ctx, user.ID, enrollment.CourseID)
				if err != nil {
					return code, err
				}

				sectionName := enrollment.SISSectionID

				if sectionName == "" {
					section, code, err := c.canvasClient.GetSectionByID(ctx, enrollment.CourseSectionID)
					if err != nil {
						return code, err
					}

					sectionName = section.Name
				}

				var pointsPossibleTotal float64
				var scoreTotal float64

				count := 0        // count of assignments that are not "Assessment Coversheet"
				hasValid := false // there is atleast one valid score value

			inner:
				for _, ad := range data {
					if strings.Contains(ad.Title, AssessmentCoversheet) {
						continue inner
					}

					count++

					result := AssignmentResult{
						Title:           ad.Title,
						PointsPossible:  ad.PointsPossible,
						DueAt:           ad.DueAt,
						Score:           ad.Submission.Score,
						SubmittedAt:     ad.Submission.SubmittedAt,
						UserSisID:       user.SISUserID,
						Name:            user.Name,
						Section:         sectionName,
						EnrollmentRole:  enrollment.Role,
						EnrollmentState: enrollment.EnrollmentState,
						Status:          ad.Status,
						Acccount:        coursesMap[enrollment.CourseID].Account.Name,
						CourseName:      coursesMap[enrollment.CourseID].Name,
						CourseState:     coursesMap[enrollment.CourseID].WorkflowState,
					}

					// Check for situation where student got more marks than possible
					if ad.Submission.Score.Float64 > ad.PointsPossible.Float64 {
						result.Discrepancy = "ERROR"
					}

					results = append(results, result)

					pointsPossibleTotal += result.PointsPossible.Float64

					if result.Score.Valid {
						scoreTotal += result.Score.Float64
						hasValid = true
					}
				}

				totalRow := AssignmentResult{
					PointsPossible: null.FloatFrom(pointsPossibleTotal),
					CourseName:     "Total",
				}

				if hasValid {
					totalRow.Score = null.FloatFrom(scoreTotal)
				} else {
					totalRow.Score = null.FloatFromPtr(nil)
				}

				if count > 0 {
					results = append(results, totalRow)
				}

			}
		}
	}

	if err := json.NewEncoder(w).Encode(results); err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil
}

type sectionWithTeachers struct {
	id           int
	sisSectionID string
	teachers     []string
}

func (c *APIController) GetUngradedAssignmentsByCourse(w http.ResponseWriter, r *http.Request) (int, error) {
	ctx, cancel := context.WithCancel(r.Context())
	defer cancel()

	courseName := r.URL.Query().Get("course_name")
	if courseName == "" {
		return http.StatusBadRequest, fmt.Errorf("missing course_name query paramater")
	}

	accountName := r.URL.Query().Get("account_name")
	if accountName == "" {
		return http.StatusBadRequest, fmt.Errorf("missing account_name query parameter")
	}

	courseID, err := strconv.Atoi(chi.URLParam(r, "course_id"))
	if err != nil {
		return http.StatusBadRequest, err
	}

	results := make([]UngradedAssignmentWithAccountCourseInfo, 0)

	assignments, code, err := c.canvasClient.GetAssignmentsByCourseID(ctx, courseID, "", canvas.UngradedBucket, true)
	if err != nil {
		return code, err
	}

	// holds sections with teachers names
	sectionsWithTeachersMap := make(map[int]sectionWithTeachers)

	for _, assignment := range assignments {
		select {
		case <-ctx.Done():
			return http.StatusRequestTimeout, ctx.Err()
		default:
			{
				for _, section := range assignment.NeedsGradingCountBySection {

					datesMap := make(map[int]canvas.AssignmentDate)

					// When there are many assignment overrides, all dates are not returned to avoid heavy payload.
					// So to get all dates, separate API call is needed.
					if len(assignment.AllDates) == 0 {
						assignment, code, err := c.canvasClient.GetAssignmentByID(ctx, assignment.ID, assignment.CourseID, true)
						if err != nil {
							return code, err
						}

						for _, o := range assignment.Overrides {
							if o.CourseSectionID.Valid {
								datesMap[int(o.CourseSectionID.Int64)] = canvas.AssignmentDate{
									DueAt:    o.DueAt.String,
									LockAt:   o.LockAt.String,
									UnlockAt: o.DueAt.String,
									SetType:  "CourseSection",
									SetID:    o.CourseSectionID,
								}
							}
						}
					} else {
						for _, date := range assignment.AllDates {
							if date.SetID.Valid && date.SetType == "CourseSection" {
								datesMap[int(date.SetID.Int64)] = date // in this case set id is section id
							}
						}
					}

					// no section information at the moment
					if _, ok := sectionsWithTeachersMap[section.SectionID]; !ok {

						enrollments, code, err := c.canvasClient.GetEnrollmentsBySectionID(ctx, section.SectionID, nil, []canvas.EnrollmentType{canvas.TeacherEnrollment})
						if err != nil {
							return code, err
						}

						teachers := make([]string, 0, len(enrollments))

						for _, enrollment := range enrollments {
							teachers = append(teachers, enrollment.User.Name)
						}

						st := sectionWithTeachers{
							id:       section.SectionID,
							teachers: teachers,
						}

						// there are teachers in the section
						if len(enrollments) != 0 {
							st.sisSectionID = enrollments[0].SISSectionID
						}

						// get section when there is no sis section id
						if st.sisSectionID == "" {
							_section, code, err := c.canvasClient.GetSectionByID(ctx, section.SectionID)
							if err != nil {
								return code, err
							}

							st.sisSectionID = _section.Name
						}

						sectionsWithTeachersMap[section.SectionID] = st
					}

					result := UngradedAssignmentWithAccountCourseInfo{
						Name:                  assignment.Name,
						CourseID:              assignment.CourseID,
						NeedingGradingSection: section.NeedsGradingCount,
						Published:             assignment.Published,
						Account:               accountName,
						CourseName:            courseName,
						GradebookURL:          fmt.Sprintf(`%s/courses/%d/gradebook`, c.canvasClient.HtmlUrl, courseID),
					}

					// now we have section information
					if st, ok := sectionsWithTeachersMap[section.SectionID]; ok {
						result.Section = st.sisSectionID
						result.Teachers = strings.Join(st.teachers, ";")
					}

					// section has date
					if date, ok := datesMap[section.SectionID]; ok {
						result.DueAt = date.DueAt
						result.LockAt = date.LockAt
						result.UnlockAt = date.UnlockAt
					}

					results = append(results, result)
				}
			}
		}
	}

	if err := json.NewEncoder(w).Encode(results); err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil
}

func (c *APIController) GetUngradedAssignmentsByCourses(w http.ResponseWriter, r *http.Request) (int, error) {
	ctx, cancel := context.WithCancel(r.Context())
	defer cancel()

	results := make([]UngradedAssignment, 0)

	ids := r.URL.Query().Get("ids")
	if ids == "" {
		return http.StatusBadRequest, fmt.Errorf("missing courses ids")
	}

	courseIDs := strings.Split(ids, ",")

	for _, id := range courseIDs {
		select {
		case <-ctx.Done():
			return http.StatusRequestTimeout, ctx.Err()
		default:
			{
				courseID, err := strconv.Atoi(id)
				if err != nil {
					return http.StatusBadRequest, fmt.Errorf("invalid course id: %s", id)
				}

				assignments, code, err := c.canvasClient.GetAssignmentsByCourseID(ctx, courseID, "", canvas.UngradedBucket, true)
				if err != nil {
					return code, err
				}

				// holds sections with teachers names
				sectionsWithTeachersMap := make(map[int]sectionWithTeachers)

				for _, assignment := range assignments {

					for _, section := range assignment.NeedsGradingCountBySection {

						datesMap := make(map[int]canvas.AssignmentDate)

						// When there are many assignment overrides, all dates are not returned to avoid heavy payload.
						// So to get all dates, separate API call is needed.
						if len(assignment.AllDates) == 0 {
							assignment, code, err := c.canvasClient.GetAssignmentByID(ctx, assignment.ID, assignment.CourseID, true)
							if err != nil {
								return code, err
							}

							for _, o := range assignment.Overrides {
								if o.CourseSectionID.Valid {
									datesMap[int(o.CourseSectionID.Int64)] = canvas.AssignmentDate{
										DueAt:    o.DueAt.String,
										LockAt:   o.LockAt.String,
										UnlockAt: o.DueAt.String,
										SetType:  "CourseSection",
										SetID:    o.CourseSectionID,
									}
								}
							}
						} else {
							for _, date := range assignment.AllDates {
								if date.SetID.Valid && date.SetType == "CourseSection" {
									datesMap[int(date.SetID.Int64)] = date // in this case set id is section id
								}
							}
						}

						// no section information at the moment
						if _, ok := sectionsWithTeachersMap[section.SectionID]; !ok {

							enrollments, code, err := c.canvasClient.GetEnrollmentsBySectionID(ctx, section.SectionID, nil, []canvas.EnrollmentType{canvas.TeacherEnrollment})
							if err != nil {
								return code, err
							}

							teachers := make([]string, 0, len(enrollments))

							for _, enrollment := range enrollments {
								teachers = append(teachers, enrollment.User.Name)
							}

							st := sectionWithTeachers{
								id:       section.SectionID,
								teachers: teachers,
							}

							// there are teachers in the section
							if len(enrollments) != 0 {
								st.sisSectionID = enrollments[0].SISSectionID
							}

							// get section when there is no sis section id
							if st.sisSectionID == "" {
								_section, code, err := c.canvasClient.GetSectionByID(ctx, section.SectionID)
								if err != nil {
									return code, err
								}

								st.sisSectionID = _section.Name
							}

							sectionsWithTeachersMap[section.SectionID] = st
						}

						result := UngradedAssignment{
							Name:                  assignment.Name,
							CourseID:              assignment.CourseID,
							NeedingGradingSection: section.NeedsGradingCount,
							Published:             assignment.Published,
							GradebookURL:          fmt.Sprintf(`%s/courses/%d/gradebook`, c.canvasClient.HtmlUrl, courseID),
						}

						// now we have section information
						if st, ok := sectionsWithTeachersMap[section.SectionID]; ok {
							result.Section = st.sisSectionID
							result.Teachers = strings.Join(st.teachers, ";")
						}

						// section has date
						if date, ok := datesMap[section.SectionID]; ok {
							result.DueAt = date.DueAt
							result.LockAt = date.LockAt
							result.UnlockAt = date.UnlockAt
						}

						results = append(results, result)
					}
				}
			}
		}
	}

	if err := json.NewEncoder(w).Encode(results); err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil
}

func (c *APIController) GetUngradedAssignmentsByAccountID(w http.ResponseWriter, r *http.Request) (int, error) {
	ctx, cancel := context.WithCancel(r.Context())
	defer cancel()

	results := make([]UngradedAssignmentWithAccountCourseInfo, 0)

	accountID, err := strconv.Atoi(chi.URLParam(r, "account_id"))
	if err != nil {
		return http.StatusBadRequest, fmt.Errorf("invalid account id")
	}

	types := []canvas.CourseEnrollmentType{canvas.StudentCourseEnrollment}

	courses, code, err := c.canvasClient.GetCoursesByAccountID(ctx, accountID, "", types)
	if err != nil {
		return code, err
	}

	for _, course := range courses {
		select {
		case <-ctx.Done():
			return http.StatusRequestTimeout, ctx.Err()
		default:
			{
				assignments, code, err := c.canvasClient.GetAssignmentsByCourseID(ctx, course.ID, "", canvas.UngradedBucket, true)
				if err != nil {
					return code, err
				}

				// holds sections with teachers names
				sectionsWithTeachersMap := make(map[int]sectionWithTeachers)

				for _, assignment := range assignments {

					for _, section := range assignment.NeedsGradingCountBySection {

						datesMap := make(map[int]canvas.AssignmentDate)

						// When there are many assignment overrides, all dates are not returned to avoid heavy payload.
						// So to get all dates, separate API call is needed.
						if len(assignment.AllDates) == 0 {
							assignment, code, err := c.canvasClient.GetAssignmentByID(ctx, assignment.ID, assignment.CourseID, true)
							if err != nil {
								return code, err
							}

							for _, o := range assignment.Overrides {
								if o.CourseSectionID.Valid {
									datesMap[int(o.CourseSectionID.Int64)] = canvas.AssignmentDate{
										DueAt:    o.DueAt.String,
										LockAt:   o.LockAt.String,
										UnlockAt: o.DueAt.String,
										SetType:  "CourseSection",
										SetID:    o.CourseSectionID,
									}
								}
							}
						} else {
							for _, date := range assignment.AllDates {
								if date.SetID.Valid && date.SetType == "CourseSection" {
									datesMap[int(date.SetID.Int64)] = date // in this case set id is section id
								}
							}
						}

						// no section information at the moment
						if _, ok := sectionsWithTeachersMap[section.SectionID]; !ok {

							enrollments, code, err := c.canvasClient.GetEnrollmentsBySectionID(ctx, section.SectionID, nil, []canvas.EnrollmentType{canvas.TeacherEnrollment})
							if err != nil {
								return code, err
							}

							teachers := make([]string, 0, len(enrollments))

							for _, enrollment := range enrollments {
								teachers = append(teachers, enrollment.User.Name)
							}

							st := sectionWithTeachers{
								id:       section.SectionID,
								teachers: teachers,
							}

							// there are teachers in the section
							if len(enrollments) != 0 {
								st.sisSectionID = enrollments[0].SISSectionID
							}

							// get section when there is no sis section id
							if st.sisSectionID == "" {
								_section, code, err := c.canvasClient.GetSectionByID(ctx, section.SectionID)
								if err != nil {
									return code, err
								}

								st.sisSectionID = _section.Name
							}

							sectionsWithTeachersMap[section.SectionID] = st
						}

						result := UngradedAssignmentWithAccountCourseInfo{
							Name:                  assignment.Name,
							CourseID:              assignment.CourseID,
							NeedingGradingSection: section.NeedsGradingCount,
							Published:             assignment.Published,
							Account:               course.Account.Name,
							CourseName:            course.Name,
							GradebookURL:          fmt.Sprintf(`%s/courses/%d/gradebook`, c.canvasClient.HtmlUrl, course.ID),
						}

						// now we have section information
						if st, ok := sectionsWithTeachersMap[section.SectionID]; ok {
							result.Section = st.sisSectionID
							result.Teachers = strings.Join(st.teachers, ";")
						}

						// section has date
						if date, ok := datesMap[section.SectionID]; ok {
							result.DueAt = date.DueAt
							result.LockAt = date.LockAt
							result.UnlockAt = date.UnlockAt
						}

						results = append(results, result)
					}
				}
			}
		}
	}

	if err := json.NewEncoder(w).Encode(results); err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil
}
