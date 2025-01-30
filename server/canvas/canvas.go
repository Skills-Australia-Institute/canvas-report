package canvas

import (
	"fmt"
	"io"
	"net/http"
	"regexp"
	"strings"
	"time"
)

type CanvasClient struct {
	baseUrl    string
	pageSize   int
	httpClient *httpClient
	HtmlUrl    string
}

type httpClient struct {
	accessToken string
	client      *http.Client
}

func newHttpClient(accessToken string) *httpClient {
	client := &http.Client{
		Timeout: 15 * time.Second,
	}

	return &httpClient{
		accessToken: accessToken,
		client:      client,
	}
}

func (c *httpClient) do(req *http.Request) (data []byte, link string, code int, err error) {
	bearer := "Bearer " + c.accessToken
	req.Header.Add("Authorization", bearer)

	res, err := c.client.Do(req)
	if err != nil {
		return nil, "", http.StatusInternalServerError, err
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return nil, "", res.StatusCode, fmt.Errorf("unsuccessful request: %s", req.URL.RequestURI())
	}

	data, err = io.ReadAll(res.Body)
	if err != nil {
		return nil, "", http.StatusInternalServerError, err
	}

	return data, res.Header.Get("Link"), http.StatusOK, nil
}

func NewCanvasClient(baseUrl string, accessToken string, pageSize int, htmlUrl string) *CanvasClient {
	return &CanvasClient{
		baseUrl:    baseUrl,
		pageSize:   pageSize,
		httpClient: newHttpClient(accessToken),
		HtmlUrl:    htmlUrl,
	}
}

func getNextUrl(linkTxt string) string {
	url := ""

	if linkTxt != "" {
		links := strings.Split(linkTxt, ",")
		nextRegEx := regexp.MustCompile(`^<(.*)>; rel="next"$`)

		for i := 0; i < len(links); i++ {
			matches := nextRegEx.Match([]byte(links[i]))

			if matches {
				startIndex := strings.Index(links[i], "<")
				endIndex := strings.Index(links[i], ">")
				url = links[i][startIndex+1 : endIndex]
				break
			}
		}
	}

	return url
}
