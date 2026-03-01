package metadata

import (
	"regexp"
	"strconv"
	"strings"

	"github.com/navidrome/navidrome/utils"
)

// filenamePattern matches "Artist - Album - Track# Title" naming convention.
// Example: "OK Go - Of the Blue Colour of the Sky - 13 In The Glass"
var filenamePattern = regexp.MustCompile(`^(.+?) - (.+?) - (\d+)\s+(.+)$`)

type parsedFilename struct {
	Artist   string
	Album    string
	TrackNum int
	Title    string
}

// parseFilenameMetadata attempts to extract structured metadata from
// a filename that follows the "Artist - Album - TrackNum Title" convention.
// Returns nil if the filename does not match the expected pattern.
func parseFilenameMetadata(filePath string) *parsedFilename {
	basename := utils.BaseName(filePath)
	matches := filenamePattern.FindStringSubmatch(basename)
	if matches == nil {
		return nil
	}

	trackNum, _ := strconv.Atoi(matches[3])

	return &parsedFilename{
		Artist:   strings.TrimSpace(matches[1]),
		Album:    strings.TrimSpace(matches[2]),
		TrackNum: trackNum,
		Title:    strings.TrimSpace(matches[4]),
	}
}
