package supabase

type AuthUser struct {
	ID         string `json:"id"`
	FirstName  string `json:"first_name"`
	LastName   string `json:"last_name"`
	Email      string `json:"email"`
	AppRole    string `json:"app_role"`
	AvatarUrl  string `json:"avatar_url"`
	CreatedAt  string `json:"created_at"`
	LastSignIn string `json:"last_sign_in"`
}

// func (s *Supabase) CreateAuthUser(data api.CreatAppUserRequest) (user AuthUser, code int, err error) {
// 	metadata := map[string]string{
// 		"first_name": data.FirstName,
// 		"last_name":  data.LastName,
// 		"email":      data.Email,
// 		"app_role":   data.AppRole,
// 		"avatar_url": data.AvatarUrl,
// 	}

// 	payload := map[string]interface{}{
// 		"email": data

// 			//Output:

// 		}
// 	}
// 	s.client.ChangeSchema("auth").From("users").Insert(data, false)

// 	req, err := http.NewRequest(http.MethodGet, requestUrl, nil)
// 	if err != nil {
// 		return user, http.StatusInternalServerError, err
// 	}
// 	bearer := "Bearer " + c.accessToken
// 	req.Header.Add("Authorization", bearer)

// 	res, err := s.client.Do(req)
// 	if err != nil {
// 		return user, http.StatusInternalServerError, err
// 	}
// 	defer res.Body.Close()

// 	if res.StatusCode != http.StatusOK {
// 		return user, res.StatusCode, fmt.Errorf("error creating user: %d", accountID)
// 	}

// 	body, err := io.ReadAll(res.Body)
// 	if err != nil {
// 		return user, http.StatusInternalServerError, err
// 	}

// 	if err := json.Unmarshal(body, &authUser); err != nil {
// 		return user, http.StatusInternalServerError, err
// 	}

// 	return user, http.StatusOK, nil
// }
