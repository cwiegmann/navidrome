package metadata

import (
	. "github.com/onsi/ginkgo/v2"
	. "github.com/onsi/gomega"
)

var _ = Describe("parseFilenameMetadata", func() {
	It("parses standard Artist - Album - Track# Title pattern", func() {
		result := parseFilenameMetadata("/music/OK Go - Of the Blue Colour of the Sky - 13 In The Glass.wav")
		Expect(result).NotTo(BeNil())
		Expect(result.Artist).To(Equal("OK Go"))
		Expect(result.Album).To(Equal("Of the Blue Colour of the Sky"))
		Expect(result.TrackNum).To(Equal(13))
		Expect(result.Title).To(Equal("In The Glass"))
	})

	It("parses zero-padded track numbers", func() {
		result := parseFilenameMetadata("/music/OK Go - Of the Blue Colour of the Sky - 01 WTF.wav")
		Expect(result).NotTo(BeNil())
		Expect(result.TrackNum).To(Equal(1))
		Expect(result.Title).To(Equal("WTF"))
	})

	It("returns nil for filenames without the pattern", func() {
		result := parseFilenameMetadata("/music/regular_song.mp3")
		Expect(result).To(BeNil())
	})

	It("returns nil for filenames with only one separator", func() {
		result := parseFilenameMetadata("/music/Artist - Title.wav")
		Expect(result).To(BeNil())
	})

	It("handles artists with special characters", func() {
		result := parseFilenameMetadata("/music/AC-DC - Back in Black - 01 Hells Bells.wav")
		Expect(result).NotTo(BeNil())
		Expect(result.Artist).To(Equal("AC-DC"))
		Expect(result.Album).To(Equal("Back in Black"))
	})

	It("returns nil for empty path", func() {
		result := parseFilenameMetadata("")
		Expect(result).To(BeNil())
	})
})
