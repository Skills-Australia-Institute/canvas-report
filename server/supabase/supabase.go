package supabase

import "github.com/supabase-community/postgrest-go"

type SupabaseClient struct {
	client *postgrest.Client
	secret string
}

func NewSupabaseClient(baseUrl, publicAnonKey string, secret string) (*SupabaseClient, error) {
	baseUrl = baseUrl + "/rest/v1"

	client := postgrest.NewClient(baseUrl, "canvas", map[string]string{
		"apiKey": publicAnonKey,
	})
	if client.ClientError != nil {
		return nil, client.ClientError
	}

	supabase := &SupabaseClient{
		client: client,
		secret: secret,
	}

	return supabase, nil
}
