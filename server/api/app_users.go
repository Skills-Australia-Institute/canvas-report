package api

type AppRole string

const (
	SuperAdminAppRole      AppRole = "Superadmin"
	AdminAppRole           AppRole = "Admin"
	ComplianceAppRole      AppRole = "Compliance"
	StudentServicesAppRole AppRole = "Student Services"
)

type CreatAppUserRequest struct {
	FirstName string  `json:"first_name" validate:"required"`
	LastName  string  `json:"last_name" validate:"required"`
	Email     string  `json:"email" validate:"required, email"`
	AppRole   AppRole `json:"app_role" validate:"required"`
	Password  string  `json:"password" validate:"gte=5"`
}

// func (c *APIController) CreateAppUser(w http.ResponseWriter, r *http.Request) (int, error) {
// 	var req CreatAppUserRequest
// 	err := json.NewDecoder(r.Body).Decode(req)
// 	if err != nil {
// 		return http.StatusBadRequest, err
// 	}

// 	err = c.validate.Struct(req)
// 	if err != nil {
// 		return http.StatusBadRequest, err
// 	}

// }
