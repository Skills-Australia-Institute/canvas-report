package canvas

import (
	"fmt"
	"io"
	"net/http"
	"regexp"
	"strings"
	"time"
)

type Canvas struct {
	baseUrl     string
	accessToken string
	pageSize    int
	client      *http.Client
	httpClient  *canvasClient
	HtmlUrl     string
}

type canvasClient struct {
	accessToken string
	client      *http.Client
}

func newCanvasClient(accessToken string) *canvasClient {
	client := &http.Client{
		Timeout: 10 * time.Second,
	}

	return &canvasClient{
		accessToken: accessToken,
		client:      client,
	}
}

func (c *canvasClient) do(req *http.Request) ([]byte, error) {
	bearer := "Bearer " + c.accessToken
	req.Header.Add("Authorization", bearer)

	res, err := c.client.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("request unsuccessful")
	}

	body, err := io.ReadAll(res.Body)
	if err != nil {
		return nil, err
	}

	return body, nil
}

func NewCanvas(baseUrl string, accessToken string, pageSize int, htmlUrl string) *Canvas {
	return &Canvas{
		baseUrl:     baseUrl,
		accessToken: accessToken,
		pageSize:    pageSize,
		client: &http.Client{
			Timeout: time.Second * 15,
		},
		httpClient: newCanvasClient(accessToken),
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
