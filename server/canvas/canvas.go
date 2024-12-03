package canvas

import (
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
	HtmlUrl     string
}

func New(baseUrl string, accessToken string, pageSize int, htmlUrl string) *Canvas {
	return &Canvas{
		baseUrl:     baseUrl,
		accessToken: accessToken,
		pageSize:    pageSize,
		client: &http.Client{
			Timeout: time.Second * 15,
		},
		HtmlUrl: htmlUrl,
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
