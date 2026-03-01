import React, { useEffect, useState, useCallback } from 'react'
import { useDataProvider, Loading } from 'react-admin'
import { useDispatch } from 'react-redux'
import {
  Typography,
  makeStyles,
  useMediaQuery,
  Avatar,
} from '@material-ui/core'
import { Link } from 'react-router-dom'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import RepeatIcon from '@material-ui/icons/Repeat'
import subsonic from '../subsonic'
import { setTrack } from '../actions'

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
    maxWidth: 1400,
  },
  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    marginBottom: theme.spacing(4),
  },
  pageIcon: {
    color: theme.palette.primary.main,
    fontSize: '2rem',
  },
  pageTitle: {
    fontWeight: 700,
    fontSize: '1.75rem',
  },
  sectionTitle: {
    fontWeight: 600,
    fontSize: '1.15rem',
    marginBottom: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
  },
  sectionCount: {
    fontSize: '0.85rem',
    color: theme.palette.text.secondary,
    fontWeight: 400,
  },
  albumGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: theme.spacing(2.5),
    marginBottom: theme.spacing(5),
    [theme.breakpoints.down('xs')]: {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
  },
  albumCard: {
    textDecoration: 'none',
    borderRadius: 6,
    position: 'relative',
    '&:hover $albumOverlay': { opacity: 1 },
  },
  albumCover: {
    width: '100%',
    aspectRatio: '1',
    objectFit: 'cover',
    borderRadius: 6,
    display: 'block',
  },
  albumOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'rgba(0,0,0,0.4)',
    opacity: 0,
    transition: 'opacity 200ms ease',
    borderRadius: 6,
    aspectRatio: '1',
  },
  albumPlayIcon: { color: '#fff', fontSize: 40 },
  albumName: {
    fontSize: '0.85rem',
    fontWeight: 500,
    color: theme.palette.type === 'dark' ? '#eee' : 'black',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
    marginTop: 6,
  },
  albumMeta: {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  playCount: {
    fontSize: '0.75rem',
    fontWeight: 600,
    color: theme.palette.primary.main,
  },
  songList: {
    display: 'flex',
    flexDirection: 'column',
  },
  songEntry: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(0.75, 1),
    borderRadius: 6,
    cursor: 'pointer',
    transition: 'background-color 150ms ease',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  songRank: {
    fontWeight: 700,
    fontSize: '0.9rem',
    color: theme.palette.text.hint,
    minWidth: 24,
    textAlign: 'center',
    flexShrink: 0,
  },
  songCover: {
    width: 44,
    height: 44,
    borderRadius: 4,
    flexShrink: 0,
  },
  songInfo: {
    flex: 1,
    minWidth: 0,
  },
  songTitle: {
    fontSize: '0.9rem',
    fontWeight: 500,
    color: theme.palette.type === 'dark' ? '#eee' : 'black',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  songArtist: {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  songPlays: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: theme.palette.primary.main,
    flexShrink: 0,
  },
  emptyState: {
    padding: theme.spacing(4),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(3),
  },
}))

const MostPlayedPage = () => {
  const classes = useStyles()
  const dataProvider = useDataProvider()
  const dispatch = useDispatch()
  const [albums, setAlbums] = useState([])
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const isDesktop = useMediaQuery((theme) => theme.breakpoints.up('md'), { noSsr: true })

  useEffect(() => {
    Promise.all([
      dataProvider.getList('album', {
        sort: { field: 'play_count', order: 'DESC' },
        pagination: { page: 1, perPage: 25 },
      }),
      dataProvider.getList('song', {
        sort: { field: 'play_count', order: 'DESC' },
        pagination: { page: 1, perPage: 25 },
      }),
    ])
      .then(([albumRes, songRes]) => {
        setAlbums((albumRes.data || []).filter((a) => a.playCount > 0))
        setSongs((songRes.data || []).filter((s) => s.playCount > 0))
      })
      .catch(() => {
        setAlbums([])
        setSongs([])
      })
      .finally(() => setLoading(false))
  }, [dataProvider])

  const handlePlaySong = useCallback(
    (song) => dispatch(setTrack(song)),
    [dispatch],
  )

  if (loading) return <Loading />

  return (
    <div className={classes.root}>
      <div className={classes.pageHeader}>
        <RepeatIcon className={classes.pageIcon} />
        <Typography className={classes.pageTitle}>Most Played</Typography>
      </div>

      <Typography className={classes.sectionTitle}>
        Albums
        {albums.length > 0 && <span className={classes.sectionCount}>({albums.length})</span>}
      </Typography>
      {albums.length > 0 ? (
        <div className={classes.albumGrid}>
          {albums.map((album) => (
            <Link key={album.id} to={`/album/${album.id}/show`} className={classes.albumCard}>
              <img
                src={subsonic.getCoverArtUrl(album, 300, true)}
                alt={album.name}
                className={classes.albumCover}
                loading="lazy"
              />
              {isDesktop && (
                <div className={classes.albumOverlay}>
                  <PlayArrowIcon className={classes.albumPlayIcon} />
                </div>
              )}
              <Typography className={classes.albumName}>{album.name}</Typography>
              <Typography className={classes.albumMeta}>
                {album.albumArtist}
                <span style={{ margin: '0 4px' }}>·</span>
                <span className={classes.playCount}>{album.playCount}x</span>
              </Typography>
            </Link>
          ))}
        </div>
      ) : (
        <Typography className={classes.emptyState}>
          No played albums yet. Start listening!
        </Typography>
      )}

      <Typography className={classes.sectionTitle}>
        Songs
        {songs.length > 0 && <span className={classes.sectionCount}>({songs.length})</span>}
      </Typography>
      {songs.length > 0 ? (
        <div className={classes.songList}>
          {songs.map((song, i) => (
            <div key={song.id} className={classes.songEntry} onClick={() => handlePlaySong(song)}>
              <span className={classes.songRank}>{i + 1}</span>
              <Avatar
                variant="square"
                src={subsonic.getCoverArtUrl({ id: song.albumId, updatedAt: song.updatedAt }, 80, true)}
                className={classes.songCover}
                alt={song.title}
              />
              <div className={classes.songInfo}>
                <Typography className={classes.songTitle}>{song.title}</Typography>
                <Typography className={classes.songArtist}>
                  {song.artist} &mdash; {song.album}
                </Typography>
              </div>
              <span className={classes.songPlays}>{song.playCount}x</span>
            </div>
          ))}
        </div>
      ) : (
        <Typography className={classes.emptyState}>
          No played songs yet. Start listening!
        </Typography>
      )}
    </div>
  )
}

export default MostPlayedPage
