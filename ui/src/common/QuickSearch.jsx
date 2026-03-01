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
} from '@material-ui/core'
import SearchIcon from '@material-ui/icons/Search'
import AlbumIcon from '@material-ui/icons/Album'
import PersonIcon from '@material-ui/icons/Person'
import MusicNoteIcon from '@material-ui/icons/MusicNote'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import IconButton from '@material-ui/core/IconButton'
import subsonic from '../subsonic'
import { setTrack } from '../actions'
import config from '../config'

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
  searchInput: {
    padding: theme.spacing(1.5, 2),
    fontSize: '1.1rem',
    borderBottom: `1px solid ${theme.palette.divider}`,
  },
  content: {
    padding: '0 !important',
    overflowY: 'auto',
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
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 4,
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
}))

const getArtistLink = (artistId) => {
  if (config.devShowArtistPage && artistId !== config.variousArtistsId) {
    return `#/artist/${artistId}/show`
  }
  return `#/album?filter=${encodeURIComponent(JSON.stringify({ artist_id: artistId }))}&order=ASC&sort=max_year`
}

const QuickSearch = ({ open, onClose }) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState(null)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef(null)

  useEffect(() => {
    if (open) {
      setQuery('')
      setResults(null)
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

    setLoading(true)
    subsonic
      .search3(searchQuery.trim())
      .then((resp) => resp.json['subsonic-response'])
      .then((data) => {
        if (data.status === 'ok') {
          const sr = data.searchResult3 || {}
          setResults({
            artists: sr.artist || [],
            albums: sr.album || [],
            songs: sr.song || [],
          })
        }
      })
      .catch(() => setResults(null))
      .finally(() => setLoading(false))
  }, [])

  const handleQueryChange = useCallback(
    (e) => {
      const value = e.target.value
      setQuery(value)

      if (debounceRef.current) {
        clearTimeout(debounceRef.current)
      }
      debounceRef.current = setTimeout(() => performSearch(value), 300)
    },
    [performSearch],
  )

  const navigateTo = useCallback(
    (href) => {
      window.location.href = href
      onClose()
    },
    [onClose],
  )

  const handlePlaySong = useCallback(
    (e, song) => {
      e.stopPropagation()
      dispatch(setTrack(song))
      onClose()
    },
    [dispatch, onClose],
  )

  const hasResults =
    results &&
    (results.artists.length > 0 ||
      results.albums.length > 0 ||
      results.songs.length > 0)

  return (
    <Dialog
      open={open}
      onClose={onClose}
      className={classes.dialog}
      disableRestoreFocus
    >
      <InputBase
        autoFocus
        fullWidth
        placeholder="Search albums, artists, songs..."
        value={query}
        onChange={handleQueryChange}
        className={classes.searchInput}
        startAdornment={
          <InputAdornment position="start">
            <SearchIcon color="action" />
          </InputAdornment>
        }
      />

      <DialogContent className={classes.content}>
        {loading && (
          <div className={classes.loadingIndicator}>
            <CircularProgress size={24} />
          </div>
        )}

        {!loading && !results && query.length === 0 && (
          <Typography className={classes.hint}>
            Start typing to search your library
          </Typography>
        )}

        {!loading && results && !hasResults && (
          <Typography className={classes.emptyState}>
            No results found for "{query}"
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
                  {results.artists.map((artist) => (
                    <ListItem
                      key={artist.id}
                      button
                      className={classes.listItem}
                      onClick={() => navigateTo(getArtistLink(artist.id))}
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
                  ))}
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
                  {results.albums.map((album) => (
                    <ListItem
                      key={album.id}
                      button
                      className={classes.listItem}
                      onClick={() =>
                        navigateTo(`#/album/${album.id}/show`)
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
                        secondary={album.artist}
                      />
                    </ListItem>
                  ))}
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
                  {results.songs.map((song) => (
                    <ListItem
                      key={song.id}
                      button
                      className={classes.listItem}
                      onClick={() =>
                        navigateTo(`#/album/${song.albumId}/show`)
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
                        secondary={`${song.artist} — ${song.album}`}
                      />
                      <IconButton
                        className={classes.playButton}
                        onClick={(e) => handlePlaySong(e, song)}
                        size="small"
                      >
                        <PlayArrowIcon fontSize="small" />
                      </IconButton>
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default QuickSearch
