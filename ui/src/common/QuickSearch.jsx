import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import {
  Dialog,
  DialogContent,
  InputBase,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Divider,
  makeStyles,
  InputAdornment,
  CircularProgress,
  Chip,
} from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'
import AlbumIcon from '@material-ui/icons/Album'
import PersonIcon from '@material-ui/icons/Person'
import MusicNoteIcon from '@material-ui/icons/MusicNote'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import HistoryIcon from '@material-ui/icons/History'
import IconButton from '@material-ui/core/IconButton'
import subsonic from '../subsonic'
import { useHistory } from 'react-router-dom'
import { setTrack } from '../actions'
import config from '../config'

const RECENT_SEARCHES_KEY = 'nd_recent_searches'
const MAX_RECENT_SEARCHES = 8

const useStyles = makeStyles((theme) => ({
  dialog: {
    '& .MuiDialog-paper': {
      width: 560,
      maxHeight: '70vh',
      borderRadius: 12,
      overflow: 'hidden',
    },
    '& .MuiDialog-paperScrollPaper': {
      maxHeight: '70vh',
    },
  },
  searchInputWrapper: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1.5, 2),
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  searchInput: {
    flex: 1,
    fontSize: '1.1rem',
  },
  kbdBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 6px',
    borderRadius: 4,
    fontSize: '0.7rem',
    fontFamily: 'inherit',
    fontWeight: 600,
    color: theme.palette.text.secondary,
    backgroundColor:
      theme.palette.type === 'dark'
        ? 'rgba(255,255,255,0.08)'
        : 'rgba(0,0,0,0.06)',
    border: `1px solid ${theme.palette.divider}`,
    whiteSpace: 'nowrap',
    lineHeight: 1.4,
    marginLeft: theme.spacing(1),
  },
  content: {
    padding: '0 !important',
    overflowY: 'auto',
  },
  recentSection: {
    padding: theme.spacing(1.5, 2, 1, 2),
  },
  recentHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing(1),
  },
  recentLabel: {
    fontWeight: 600,
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    fontSize: '0.7rem',
    letterSpacing: '0.1em',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },
  clearRecentBtn: {
    fontSize: '0.7rem',
    color: theme.palette.text.hint,
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    padding: 0,
    '&:hover': {
      color: theme.palette.text.secondary,
    },
  },
  recentChips: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: theme.spacing(0.75),
  },
  recentChip: {
    borderRadius: 16,
    fontSize: '0.8rem',
    height: 28,
    cursor: 'pointer',
  },
  sectionLabel: {
    padding: theme.spacing(1.5, 2, 0.5, 2),
    fontWeight: 600,
    color: theme.palette.text.secondary,
    textTransform: 'uppercase',
    fontSize: '0.7rem',
    letterSpacing: '0.1em',
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  sectionIcon: {
    fontSize: '0.9rem',
  },
  listItem: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(2),
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  selectedItem: {
    backgroundColor: theme.palette.action.hover,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 6,
  },
  artistAvatar: {
    width: 40,
    height: 40,
    borderRadius: '50%',
  },
  primaryText: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  secondaryText: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  songDuration: {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    flexShrink: 0,
    marginLeft: theme.spacing(1),
  },
  emptyState: {
    padding: theme.spacing(4),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  hint: {
    padding: theme.spacing(2),
    textAlign: 'center',
    color: theme.palette.text.hint,
    fontSize: '0.85rem',
  },
  loadingIndicator: {
    padding: theme.spacing(3),
    display: 'flex',
    justifyContent: 'center',
  },
  playButton: {
    padding: 4,
  },
  footer: {
    display: 'flex',
    justifyContent: 'center',
    gap: theme.spacing(2.5),
    padding: theme.spacing(1, 2),
    borderTop: `1px solid ${theme.palette.divider}`,
    backgroundColor:
      theme.palette.type === 'dark'
        ? 'rgba(255,255,255,0.02)'
        : 'rgba(0,0,0,0.02)',
  },
  footerHint: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    fontSize: '0.7rem',
    color: theme.palette.text.hint,
  },
  footerKbd: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 18,
    padding: '1px 4px',
    borderRadius: 3,
    fontSize: '0.65rem',
    fontFamily: 'inherit',
    fontWeight: 600,
    color: theme.palette.text.secondary,
    backgroundColor:
      theme.palette.type === 'dark'
        ? 'rgba(255,255,255,0.1)'
        : 'rgba(0,0,0,0.08)',
    border: `1px solid ${theme.palette.divider}`,
  },
}))

const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return ''
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const getRecentSearches = () => {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}

const saveRecentSearch = (term) => {
  if (!term || term.trim().length < 2) return
  const trimmed = term.trim()
  const recent = getRecentSearches().filter(
    (s) => s.toLowerCase() !== trimmed.toLowerCase(),
  )
  recent.unshift(trimmed)
  localStorage.setItem(
    RECENT_SEARCHES_KEY,
    JSON.stringify(recent.slice(0, MAX_RECENT_SEARCHES)),
  )
}

const clearRecentSearches = () => {
  localStorage.removeItem(RECENT_SEARCHES_KEY)
}

const getArtistPath = (artistId) => {
  if (config.devShowArtistPage && artistId !== config.variousArtistsId) {
    return `/artist/${artistId}/show`
  }
  return `/album?filter=${encodeURIComponent(JSON.stringify({ artist_id: artistId }))}&order=ASC&sort=max_year`
}

const QuickSearch = ({ open, onClose }) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const history = useHistory()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const debounceRef = useRef(null)
  const searchQueryRef = useRef('')

  useEffect(() => {
    if (open) {
      setQuery('')
      setResults(null)
      setSelectedIndex(-1)
      setRecentSearches(getRecentSearches())
    }
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
    }
  }, [open])

  const performSearch = useCallback((searchQuery) => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults(null)
      setLoading(false)
      return
    }

    searchQueryRef.current = searchQuery
    setLoading(true)
    subsonic
      .search3(searchQuery.trim())
      .then((resp) => resp.json['subsonic-response'])
      .then((data) => {
        if (searchQueryRef.current !== searchQuery) return
        if (data.status === 'ok') {
          const sr = data.searchResult3 || {}
          setResults({
            artists: sr.artist || [],
            albums: sr.album || [],
            songs: sr.song || [],
          })
        }
      })
      .catch(() => {
        if (searchQueryRef.current === searchQuery) setResults(null)
      })
      .finally(() => {
        if (searchQueryRef.current === searchQuery) setLoading(false)
      })
  }, [])

  const handleQueryChange = useCallback(
    (e) => {
      const value = e.target.value
      setQuery(value)
      setSelectedIndex(-1)

      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      debounceRef.current = setTimeout(() => performSearch(value), 300)
    },
    [performSearch],
  )

  const navigateTo = useCallback(
    (path) => {
      if (query.trim().length >= 2) {
        saveRecentSearch(query)
      }
      history.push(path)
      onClose()
    },
    [onClose, query, history],
  )

  const handlePlaySong = useCallback(
    (e, song) => {
      e.stopPropagation()
      if (query.trim().length >= 2) {
        saveRecentSearch(query)
      }
      dispatch(setTrack(song))
      onClose()
    },
    [dispatch, onClose, query],
  )

  const handleRecentClick = useCallback(
    (term) => {
      setQuery(term)
      performSearch(term)
    },
    [performSearch],
  )

  const handleClearRecent = useCallback(() => {
    clearRecentSearches()
    setRecentSearches([])
  }, [])

  const getAllItems = useCallback(() => {
    if (!results) return []
    const items = []
    results.artists.forEach((a) =>
      items.push({ type: 'artist', data: a }),
    )
    results.albums.forEach((a) =>
      items.push({ type: 'album', data: a }),
    )
    results.songs.forEach((s) =>
      items.push({ type: 'song', data: s }),
    )
    return items
  }, [results])

  const handleKeyDown = useCallback(
    (e) => {
      const items = getAllItems()
      if (items.length === 0) return

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.min(prev + 1, items.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelectedIndex((prev) => Math.max(prev - 1, -1))
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault()
        const item = items[selectedIndex]
        if (item.type === 'artist') {
          navigateTo(getArtistPath(item.data.id))
        } else if (item.type === 'album') {
          navigateTo(`/album/${item.data.id}/show`)
        } else if (item.type === 'song') {
          navigateTo(`/album/${item.data.albumId}/show`)
        }
      }
    },
    [getAllItems, selectedIndex, navigateTo],
  )

  const hasResults =
    results &&
    (results.artists.length > 0 ||
      results.albums.length > 0 ||
      results.songs.length > 0)

  let itemCounter = -1

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className={classes.dialog}
      disableRestoreFocus
    >
      <div className={classes.searchInputWrapper}>
        <SearchIcon color="action" style={{ marginRight: 8 }} />
        <InputBase
          autoFocus
          fullWidth
          placeholder="Search albums, artists, songs..."
          value={query}
          onChange={handleQueryChange}
          onKeyDown={handleKeyDown}
          className={classes.searchInput}
        />
        <span className={classes.kbdBadge}>⌘K</span>
      </div>

      <DialogContent className={classes.content}>
        {loading && (
          <div className={classes.loadingIndicator}>
            <CircularProgress size={24} />
          </div>
        )}

        {!loading && !results && query.length === 0 && (
          <>
            {recentSearches.length > 0 && (
              <div className={classes.recentSection}>
                <div className={classes.recentHeader}>
                  <Typography className={classes.recentLabel}>
                    <HistoryIcon style={{ fontSize: '0.9rem' }} />
                    Recent Searches
                  </Typography>
                  <button
                    className={classes.clearRecentBtn}
                    onClick={handleClearRecent}
                  >
                    Clear
                  </button>
                </div>
                <div className={classes.recentChips}>
                  {recentSearches.map((term) => (
                    <Chip
                      key={term}
                      label={term}
                      className={classes.recentChip}
                      variant="outlined"
                      size="small"
                      onClick={() => handleRecentClick(term)}
                    />
                  ))}
                </div>
              </div>
            )}
            {recentSearches.length === 0 && (
              <Typography className={classes.hint}>
                Start typing to search your library
              </Typography>
            )}
          </>
        )}

        {!loading && results && !hasResults && (
          <Typography className={classes.emptyState}>
            No results found for &ldquo;{query}&rdquo;
          </Typography>
        )}

        {!loading && hasResults && (
          <>
            {results.artists.length > 0 && (
              <>
                <Typography className={classes.sectionLabel}>
                  <PersonIcon className={classes.sectionIcon} />
                  Artists
                </Typography>
                <List dense>
                  {results.artists.map((artist) => {
                    itemCounter++
                    const idx = itemCounter
                    return (
                      <ListItem
                        key={artist.id}
                        button
                        className={`${classes.listItem} ${selectedIndex === idx ? classes.selectedItem : ''}`}
                        onClick={() =>
                          navigateTo(getArtistPath(artist.id))
                        }
                      >
                        <ListItemAvatar>
                          <Avatar
                            src={subsonic.getCoverArtUrl(
                              { id: artist.id },
                              80,
                            )}
                            className={classes.artistAvatar}
                            alt={artist.name}
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              className={classes.primaryText}
                            >
                              {artist.name}
                            </Typography>
                          }
                          secondary={`${artist.albumCount || 0} albums`}
                        />
                      </ListItem>
                    )
                  })}
                </List>
                <Divider />
              </>
            )}

            {results.albums.length > 0 && (
              <>
                <Typography className={classes.sectionLabel}>
                  <AlbumIcon className={classes.sectionIcon} />
                  Albums
                </Typography>
                <List dense>
                  {results.albums.map((album) => {
                    itemCounter++
                    const idx = itemCounter
                    return (
                      <ListItem
                        key={album.id}
                        button
                        className={`${classes.listItem} ${selectedIndex === idx ? classes.selectedItem : ''}`}
                        onClick={() =>
                          navigateTo(`/album/${album.id}/show`)
                        }
                      >
                        <ListItemAvatar>
                          <Avatar
                            variant="square"
                            src={subsonic.getCoverArtUrl(
                              {
                                id: album.id,
                                updatedAt: album.updatedAt,
                                albumArtist: album.artist,
                              },
                              80,
                            )}
                            className={classes.avatar}
                            alt={album.name}
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              className={classes.primaryText}
                            >
                              {album.name}
                            </Typography>
                          }
                          secondary={`${album.artist}${album.year ? ` · ${album.year}` : ''}`}
                        />
                      </ListItem>
                    )
                  })}
                </List>
                <Divider />
              </>
            )}

            {results.songs.length > 0 && (
              <>
                <Typography className={classes.sectionLabel}>
                  <MusicNoteIcon className={classes.sectionIcon} />
                  Songs
                </Typography>
                <List dense>
                  {results.songs.map((song) => {
                    itemCounter++
                    const idx = itemCounter
                    return (
                      <ListItem
                        key={song.id}
                        button
                        className={`${classes.listItem} ${selectedIndex === idx ? classes.selectedItem : ''}`}
                        onClick={() =>
                          navigateTo(`/album/${song.albumId}/show`)
                        }
                      >
                        <ListItemAvatar>
                          <Avatar
                            variant="square"
                            src={subsonic.getCoverArtUrl(
                              {
                                id: song.id,
                                updatedAt: song.updatedAt,
                                album: song.album,
                              },
                              80,
                            )}
                            className={classes.avatar}
                            alt={song.title}
                          />
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography
                              variant="body2"
                              className={classes.primaryText}
                            >
                              {song.title}
                            </Typography>
                          }
                          secondary={
                            <span className={classes.secondaryText}>
                              <span>
                                {song.artist} &mdash; {song.album}
                              </span>
                              <span className={classes.songDuration}>
                                {formatDuration(song.duration)}
                              </span>
                            </span>
                          }
                        />
                        <IconButton
                          className={classes.playButton}
                          onClick={(e) => handlePlaySong(e, song)}
                          size="small"
                          aria-label="play song"
                        >
                          <PlayArrowIcon fontSize="small" />
                        </IconButton>
                      </ListItem>
                    )
                  })}
                </List>
              </>
            )}
          </>
        )}
      </DialogContent>

      <div className={classes.footer}>
        <span className={classes.footerHint}>
          <span className={classes.footerKbd}>↑</span>
          <span className={classes.footerKbd}>↓</span>
          Navigate
        </span>
        <span className={classes.footerHint}>
          <span className={classes.footerKbd}>↵</span>
          Select
        </span>
        <span className={classes.footerHint}>
          <span className={classes.footerKbd}>esc</span>
          Close
        </span>
      </div>
    </Dialog>
  )
}

export default QuickSearch
