package supabase

import "github.com/supabase-community/postgrest-go"

type Supabase struct {
	client *postgrest.Client
	Secret string
}

func New(baseUrl, publicAnonKey string, secret string) (*Supabase, error) {
	baseUrl = baseUrl + "/rest/v1"

	client := postgrest.NewClient(baseUrl, "canvas", map[string]string{
		"apiKey": publicAnonKey,
	})
	if client.ClientError != nil {
		return nil, client.ClientError
	}

	supabase := &Supabase{
		client: client,
		Secret: secret,
	}

	return supabase, nil
}
