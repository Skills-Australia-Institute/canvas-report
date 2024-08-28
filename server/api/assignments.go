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

func (c *APIController) GetAssignmentsResultsByUser(w http.ResponseWriter, r *http.Request, user canvas.User) (int, error) {
	ctx, cancel := context.WithCancel(r.Context())
	defer cancel()

	results, code, err := func(ctx context.Context) (results []AssignmentResult, code int, err error) {
		coursesMap := make(map[int]canvas.Course)

		courses, code, err := c.canvas.GetCoursesByUserID(user.ID)
		if err != nil {
			return nil, code, err
		}

		for _, course := range courses {
			coursesMap[course.ID] = course
		}

		// for "invited", "rejected", and "deleted", GetAssignmentsDataOfUserByCourseID return 404 error
		// so skip those enrollments
		states := []canvas.EnrollmentState{canvas.ActiveEnrollment, canvas.CompletedEnrollment}

		enrollments, code, err := c.canvas.GetEnrollmentsByUserID(user.ID, states)
		if err != nil {
			return nil, code, err
		}

		for _, enrollment := range enrollments {
			select {
			case <-ctx.Done():
				return nil, http.StatusRequestTimeout, ctx.Err()
			default:
				{
					if enrollment.Role != string(canvas.StudentEnrollment) {
						continue
					}

					data, code, err := c.canvas.GetAssignmentsDataOfUserByCourseID(user.ID, enrollment.CourseID)
					if err != nil {
						return nil, code, err
					}

					var pointsPossibleTotal float64
					var scoreTotal float64

					count := 0        // count of assignments that are not "Assessment Coversheet"
					hasValid := false // there is atleast one valid score value

					for _, ad := range data {
						if strings.Contains(ad.Title, "Assessment Coversheet") {
							continue
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
							Section:         enrollment.SISSectionID,
							EnrollmentRole:  enrollment.Role,
							EnrollmentState: enrollment.EnrollmentState,
							Status:          ad.Status,
						}

						// Check for situation where student got more marks than possible
						if ad.Submission.Score.Float64 > ad.PointsPossible.Float64 {
							result.Discrepancy = "ERROR"
						}

						if course, ok := coursesMap[enrollment.CourseID]; ok {
							result.Acccount = course.Account.Name
							result.CourseName = course.Name
							result.CourseState = course.WorkflowState

						} else {
							course, code, err := c.canvas.GetCourseByID(enrollment.CourseID)
							if err != nil {
								return nil, code, err
							}

							coursesMap[enrollment.CourseID] = course

							result.Acccount = course.Account.Name
							result.CourseName = course.Name
							result.CourseState = course.WorkflowState
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

		return results, code, err
	}(ctx)

	if err != nil {
		return code, err
	}

	if err := json.NewEncoder(w).Encode(results); err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil
}

func (c *APIController) GetUngradedAssignmentsByUser(w http.ResponseWriter, r *http.Request, user canvas.User) (int, error) {
	results := []UngradedAssignmentOfUser{}

	coursesMap := make(map[int]canvas.Course)

	courses, code, err := c.canvas.GetCoursesByUserID(user.ID)
	if err != nil {
		return code, err
	}

	for _, course := range courses {
		coursesMap[course.ID] = course
	}

	// for "invited", "rejected", and "deleted", GetAssignmentsDataOfUserByCourseID return 404 error
	// so skip those enrollments
	states := []canvas.EnrollmentState{canvas.ActiveEnrollment, canvas.CompletedEnrollment}

	enrollments, code, err := c.canvas.GetEnrollmentsByUserID(user.ID, states)
	if err != nil {
		return code, err
	}

	for _, enrollment := range enrollments {
		data, code, err := c.canvas.GetAssignmentsDataOfUserByCourseID(user.ID, enrollment.CourseID)
		if err != nil {
			return code, err
		}

		for _, ad := range data {
			if strings.Contains(ad.Title, "Assessment Coversheet") {
				continue
			}

			// submitted and no score
			if ad.Submission.SubmittedAt != "" && !ad.Submission.Score.Valid {
				result := UngradedAssignmentOfUser{
					Title:           ad.Title,
					PointsPossible:  ad.PointsPossible,
					DueAt:           ad.DueAt,
					Score:           ad.Submission.Score,
					SubmittedAt:     ad.Submission.SubmittedAt,
					UserSisID:       user.SISUserID,
					Name:            user.Name,
					Section:         enrollment.SISSectionID,
					EnrollmentRole:  enrollment.Role,
					EnrollmentState: enrollment.EnrollmentState,
					Status:          ad.Status,
				}

				if course, ok := coursesMap[enrollment.CourseID]; ok {
					result.Acccount = course.Account.Name
					result.CourseName = course.Name
					result.CourseState = course.WorkflowState

				} else {
					course, code, err := c.canvas.GetCourseByID(enrollment.CourseID)
					if err != nil {
						return code, err
					}

					coursesMap[enrollment.CourseID] = course

					result.Acccount = course.Account.Name
					result.CourseName = course.Name
					result.CourseState = course.WorkflowState
				}

				results = append(results, result)
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

	results, code, err := func(ctx context.Context) (results []UngradedAssignmentWithAccountCourseInfo, code int, err error) {

		assignments, code, err := c.canvas.GetAssignmentsByCourseID(courseID, "", canvas.UngradedBucket, true)
		if err != nil {
			return nil, code, err
		}

		// holds sections with teachers names
		sectionsWithTeachersMap := make(map[int]sectionWithTeachers)

		for _, assignment := range assignments {
			select {
			case <-ctx.Done():
				return nil, http.StatusRequestTimeout, ctx.Err()
			default:
				{
					for _, section := range assignment.NeedsGradingCountBySection {

						datesMap := make(map[int]canvas.AssignmentDate)

						for _, date := range assignment.AllDates {
							if date.SetID.Valid && date.SetType == "CourseSection" {
								datesMap[int(date.SetID.Int64)] = date // in this case set id is section id
							}
						}

						// no section information at the moment
						if _, ok := sectionsWithTeachersMap[section.SectionID]; !ok {

							enrollments, code, err := c.canvas.GetEnrollmentsBySectionID(section.SectionID, nil, []canvas.EnrollmentType{canvas.TeacherEnrollment})
							if err != nil {
								return nil, code, err
							}

							teachers := []string{}

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
								_section, code, err := c.canvas.GetSectionByID(section.SectionID)
								if err != nil {
									return nil, code, err
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
							GradebookURL:          fmt.Sprintf(`%s/courses/%d/gradebook`, c.canvas.HtmlUrl, courseID),
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

		return results, http.StatusOK, nil
	}(ctx)

	if err != nil {
		return code, err
	}

	if err := json.NewEncoder(w).Encode(results); err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil
}

func (c *APIController) GetUngradedAssignmentsByCourses(w http.ResponseWriter, r *http.Request) (int, error) {
	ctx, cancel := context.WithCancel(r.Context())
	defer cancel()

	results, code, err := func(ctx context.Context) (results []UngradedAssignment, code int, err error) {
		ids := r.URL.Query().Get("ids")
		if ids == "" {
			return nil, http.StatusBadRequest, fmt.Errorf("missing courses ids")
		}

		courseIDs := strings.Split(ids, ",")

		for _, id := range courseIDs {
			select {
			case <-ctx.Done():
				return nil, http.StatusRequestTimeout, ctx.Err()
			default:
				{
					courseID, err := strconv.Atoi(id)
					if err != nil {
						return nil, http.StatusBadRequest, fmt.Errorf("invalid course id: %s", id)
					}

					assignments, code, err := c.canvas.GetAssignmentsByCourseID(courseID, "", canvas.UngradedBucket, true)
					if err != nil {
						return nil, code, err
					}

					// holds sections with teachers names
					sectionsWithTeachersMap := make(map[int]sectionWithTeachers)

					for _, assignment := range assignments {

						for _, section := range assignment.NeedsGradingCountBySection {

							datesMap := make(map[int]canvas.AssignmentDate)

							for _, date := range assignment.AllDates {
								if date.SetID.Valid && date.SetType == "CourseSection" {
									datesMap[int(date.SetID.Int64)] = date // in this case set id is section id
								}
							}

							// no section information at the moment
							if _, ok := sectionsWithTeachersMap[section.SectionID]; !ok {

								enrollments, code, err := c.canvas.GetEnrollmentsBySectionID(section.SectionID, nil, []canvas.EnrollmentType{canvas.TeacherEnrollment})
								if err != nil {
									return nil, code, err
								}

								teachers := []string{}

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
									_section, code, err := c.canvas.GetSectionByID(section.SectionID)
									if err != nil {
										return nil, code, err
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
								GradebookURL:          fmt.Sprintf(`%s/courses/%d/gradebook`, c.canvas.HtmlUrl, courseID),
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

		fmt.Println(len(results))
		return results, http.StatusOK, nil
	}(ctx)

	if err != nil {
		return code, err
	}

	if err := json.NewEncoder(w).Encode(results); err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil
}

func (c *APIController) GetUngradedAssignmentsByAccountID(w http.ResponseWriter, r *http.Request) (int, error) {
	ctx, cancel := context.WithCancel(r.Context())
	defer cancel()

	results, code, err := func(ctx context.Context) (results []UngradedAssignmentWithAccountCourseInfo, code int, err error) {
		accountID, err := strconv.Atoi(chi.URLParam(r, "account_id"))
		if err != nil {
			return nil, http.StatusBadRequest, fmt.Errorf("invalid account id")
		}

		types := []canvas.CourseEnrollmentType{canvas.StudentCourseEnrollment}

		courses, code, err := c.canvas.GetCoursesByAccountID(accountID, "", types)
		if err != nil {
			return nil, code, err
		}

		for _, course := range courses {
			select {
			case <-ctx.Done():
				return nil, http.StatusRequestTimeout, ctx.Err()
			default:
				{
					assignments, code, err := c.canvas.GetAssignmentsByCourseID(course.ID, "", canvas.UngradedBucket, true)
					if err != nil {
						return nil, code, err
					}

					// holds sections with teachers names
					sectionsWithTeachersMap := make(map[int]sectionWithTeachers)

					for _, assignment := range assignments {

						for _, section := range assignment.NeedsGradingCountBySection {

							datesMap := make(map[int]canvas.AssignmentDate)

							for _, date := range assignment.AllDates {
								if date.SetID.Valid && date.SetType == "CourseSection" {
									datesMap[int(date.SetID.Int64)] = date // in this case set id is section id
								}
							}

							// no section information at the moment
							if _, ok := sectionsWithTeachersMap[section.SectionID]; !ok {

								enrollments, code, err := c.canvas.GetEnrollmentsBySectionID(section.SectionID, nil, []canvas.EnrollmentType{canvas.TeacherEnrollment})
								if err != nil {
									return nil, code, err
								}

								teachers := []string{}

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
									_section, code, err := c.canvas.GetSectionByID(section.SectionID)
									if err != nil {
										return nil, code, err
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
								GradebookURL:          fmt.Sprintf(`%s/courses/%d/gradebook`, c.canvas.HtmlUrl, course.ID),
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

		return results, http.StatusOK, nil
	}(ctx)

	if err != nil {
		return code, err
	}

	if err := json.NewEncoder(w).Encode(results); err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil
}

func (c *APIController) GetAdditionalAttemptAssignmentsByCourse(w http.ResponseWriter, r *http.Request, course canvas.Course) (int, error) {
	results := []AdditionalAttemptAssignment{}

	assignments, code, err := c.canvas.GetAssignmentsByCourseID(course.ID, "Attempt", canvas.AllBucket, false)
	if err != nil {
		return code, err
	}

	for _, assignment := range assignments {
		result := AdditionalAttemptAssignment{
			Qualification:     course.Account.Name,
			CourseName:        course.Name,
			Name:              assignment.Name,
			LockAt:            assignment.LockAt,
			NeedsGradingCount: assignment.NeedsGradingCount,
			HtmlUrl:           assignment.HtmlUrl,
		}

		results = append(results, result)
	}

	if err := json.NewEncoder(w).Encode(results); err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil
}

func (c *APIController) GetGradingStandardAssignmentsByCourse(w http.ResponseWriter, r *http.Request, course canvas.Course) (int, error) {
	results := []GradingStandardAssignment{}

	gradingStandardsMap := make(map[int]canvas.GradingStandard)

	gradingStandards, code, err := c.canvas.GetGradingStandardsByContext(canvas.GradingStandardAccountContext, 1) // 1 is root account ID
	if err != nil {
		return code, err
	}

	for _, gradingStandard := range gradingStandards {
		gradingStandardsMap[gradingStandard.ID] = gradingStandard
	}

	assignments, code, err := c.canvas.GetAssignmentsByCourseID(course.ID, "", canvas.AllBucket, false)
	if err != nil {
		return code, err
	}

	for _, assignment := range assignments {
		result := GradingStandardAssignment{
			Name:               assignment.Name,
			GradingStandardID:  assignment.GradingStandardID,
			GradingType:        assignment.GradingType,
			OmitFromFinalGrade: assignment.OmitFromFinalGrade,
			DueAt:              assignment.DueAt,
			WorkflowState:      assignment.WorkflowState,
			UnlockAt:           assignment.UnlockAt,
			LockAt:             assignment.LockAt,
			Account:            course.Account.Name,
			CourseName:         course.Name,
			CourseState:        course.WorkflowState,
		}

		if _, ok := gradingStandardsMap[int(assignment.GradingStandardID.Int64)]; !ok {
			gradingStandards, code, err := c.canvas.GetGradingStandardsByContext(canvas.GradingStandardCourseContext, course.ID)
			if err != nil {
				return code, err
			}

			for _, gradingStandard := range gradingStandards {
				gradingStandardsMap[gradingStandard.ID] = gradingStandard
			}
		}

		if gradingStandard, ok := gradingStandardsMap[int(assignment.GradingStandardID.Int64)]; ok {
			result.GradingStandard = gradingStandard.Title
		}

		results = append(results, result)
	}

	if err := json.NewEncoder(w).Encode(results); err != nil {
		return http.StatusInternalServerError, err
	}

	return http.StatusOK, nil
}
