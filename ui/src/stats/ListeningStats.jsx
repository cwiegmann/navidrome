import React, { useEffect, useState } from 'react'
import { useDataProvider, Loading } from 'react-admin'
import {
  Typography,
  Card,
  CardContent,
  Avatar,
  makeStyles,
} from '@material-ui/core'
import { Link } from 'react-router-dom'
import AccessTimeIcon from '@material-ui/icons/AccessTime'
import MusicNoteIcon from '@material-ui/icons/MusicNote'
import AlbumIcon from '@material-ui/icons/Album'
import PersonIcon from '@material-ui/icons/Person'
import subsonic from '../subsonic'
import config from '../config'

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
    maxWidth: 1100,
  },
  pageTitle: {
    fontWeight: 700,
    fontSize: '1.75rem',
    marginBottom: theme.spacing(3),
  },
  statCards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(4),
  },
  statCard: {
    borderRadius: 12,
    backgroundColor:
      theme.palette.type === 'dark'
        ? 'rgba(255,255,255,0.05)'
        : 'rgba(0,0,0,0.03)',
  },
  statIcon: {
    color: theme.palette.primary.main,
    fontSize: '1.5rem',
    marginBottom: theme.spacing(1),
  },
  statValue: {
    fontWeight: 700,
    fontSize: '1.8rem',
    lineHeight: 1.2,
  },
  statLabel: {
    fontSize: '0.8rem',
    color: theme.palette.text.secondary,
  },
  section: {
    marginBottom: theme.spacing(4),
  },
  sectionTitle: {
    fontWeight: 600,
    fontSize: '1.1rem',
    marginBottom: theme.spacing(2),
  },
  listGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
    gap: theme.spacing(1.5),
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(1),
    borderRadius: 8,
    textDecoration: 'none',
    transition: 'background-color 150ms ease',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  rank: {
    fontWeight: 700,
    fontSize: '1rem',
    color: theme.palette.text.hint,
    minWidth: 24,
    textAlign: 'center',
  },
  cover: {
    width: 48,
    height: 48,
    borderRadius: 6,
    flexShrink: 0,
  },
  artistCover: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    flexShrink: 0,
  },
  itemInfo: {
    flex: 1,
    minWidth: 0,
  },
  itemTitle: {
    fontSize: '0.9rem',
    fontWeight: 500,
    color: theme.palette.type === 'dark' ? '#eee' : 'black',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  itemSub: {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
  },
  playCount: {
    fontSize: '0.8rem',
    fontWeight: 600,
    color: theme.palette.primary.main,
    flexShrink: 0,
  },
  emptyState: {
    padding: theme.spacing(6),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}))

const formatHours = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}

const getArtistLink = (artistId) => {
  if (config.devShowArtistPage) {
    return `/artist/${artistId}/show`
  }
  return `/album?filter=${encodeURIComponent(JSON.stringify({ artist_id: artistId }))}&order=ASC&sort=max_year`
}

const ListeningStats = () => {
  const classes = useStyles()
  const dataProvider = useDataProvider()
  const [loading, setLoading] = useState(true)
  const [topSongs, setTopSongs] = useState([])
  const [topAlbums, setTopAlbums] = useState([])
  const [topArtists, setTopArtists] = useState([])
  const [stats, setStats] = useState({
    totalListened: 0,
    songCount: 0,
    albumCount: 0,
    artistCount: 0,
  })

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [songsRes, albumsRes, artistsRes] = await Promise.all([
          dataProvider.getList('song', {
            sort: { field: 'play_count', order: 'DESC' },
            pagination: { page: 1, perPage: 100 },
          }),
          dataProvider.getList('album', {
            sort: { field: 'play_count', order: 'DESC' },
            pagination: { page: 1, perPage: 10 },
          }),
          dataProvider.getList('artist', {
            sort: { field: 'play_count', order: 'DESC' },
            pagination: { page: 1, perPage: 10 },
          }),
        ])

        const songs = songsRes.data || []
        const albums = albumsRes.data || []
        const artists = artistsRes.data || []

        setTopSongs(songs.filter((s) => s.playCount > 0).slice(0, 10))
        setTopAlbums(albums.filter((a) => a.playCount > 0).slice(0, 10))
        setTopArtists(artists.filter((a) => a.playCount > 0).slice(0, 10))

        const totalDuration = songs.reduce(
          (acc, s) => acc + (s.duration || 0) * (s.playCount || 0),
          0,
        )

        setStats({
          totalListened: totalDuration,
          songCount: songsRes.total || 0,
          albumCount: albumsRes.total || 0,
          artistCount: artistsRes.total || 0,
        })
      } catch (e) {
        console.error('Stats fetch error:', e) // eslint-disable-line no-console
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [dataProvider])

  if (loading) return <Loading />

  return (
    <div className={classes.root}>
      <Typography className={classes.pageTitle}>Listening Stats</Typography>

      <div className={classes.statCards}>
        <Card className={classes.statCard} elevation={0}>
          <CardContent>
            <AccessTimeIcon className={classes.statIcon} />
            <Typography className={classes.statValue}>
              {formatHours(stats.totalListened)}
            </Typography>
            <Typography className={classes.statLabel}>
              total listening time
            </Typography>
          </CardContent>
        </Card>
        <Card className={classes.statCard} elevation={0}>
          <CardContent>
            <MusicNoteIcon className={classes.statIcon} />
            <Typography className={classes.statValue}>
              {stats.songCount.toLocaleString()}
            </Typography>
            <Typography className={classes.statLabel}>songs</Typography>
          </CardContent>
        </Card>
        <Card className={classes.statCard} elevation={0}>
          <CardContent>
            <AlbumIcon className={classes.statIcon} />
            <Typography className={classes.statValue}>
              {stats.albumCount.toLocaleString()}
            </Typography>
            <Typography className={classes.statLabel}>albums</Typography>
          </CardContent>
        </Card>
        <Card className={classes.statCard} elevation={0}>
          <CardContent>
            <PersonIcon className={classes.statIcon} />
            <Typography className={classes.statValue}>
              {stats.artistCount.toLocaleString()}
            </Typography>
            <Typography className={classes.statLabel}>artists</Typography>
          </CardContent>
        </Card>
      </div>

      {topSongs.length > 0 && (
        <div className={classes.section}>
          <Typography className={classes.sectionTitle}>
            Most Played Songs
          </Typography>
          <div className={classes.listGrid}>
            {topSongs.map((song, i) => (
              <Link
                key={song.id}
                to={`/album/${song.albumId}/show`}
                className={classes.listItem}
              >
                <span className={classes.rank}>{i + 1}</span>
                <Avatar
                  variant="square"
                  src={subsonic.getCoverArtUrl(
                    { id: song.id, updatedAt: song.updatedAt, album: song.album },
                    80,
                  )}
                  className={classes.cover}
                  alt={song.title}
                />
                <div className={classes.itemInfo}>
                  <Typography className={classes.itemTitle}>
                    {song.title}
                  </Typography>
                  <Typography className={classes.itemSub}>
                    {song.artist}
                  </Typography>
                </div>
                <span className={classes.playCount}>
                  {song.playCount}x
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {topAlbums.length > 0 && (
        <div className={classes.section}>
          <Typography className={classes.sectionTitle}>
            Most Played Albums
          </Typography>
          <div className={classes.listGrid}>
            {topAlbums.map((album, i) => (
              <Link
                key={album.id}
                to={`/album/${album.id}/show`}
                className={classes.listItem}
              >
                <span className={classes.rank}>{i + 1}</span>
                <Avatar
                  variant="square"
                  src={subsonic.getCoverArtUrl(album, 80)}
                  className={classes.cover}
                  alt={album.name}
                />
                <div className={classes.itemInfo}>
                  <Typography className={classes.itemTitle}>
                    {album.name}
                  </Typography>
                  <Typography className={classes.itemSub}>
                    {album.albumArtist}
                  </Typography>
                </div>
                <span className={classes.playCount}>
                  {album.playCount}x
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {topArtists.length > 0 && (
        <div className={classes.section}>
          <Typography className={classes.sectionTitle}>
            Most Played Artists
          </Typography>
          <div className={classes.listGrid}>
            {topArtists.map((artist, i) => (
              <Link
                key={artist.id}
                to={getArtistLink(artist.id)}
                className={classes.listItem}
              >
                <span className={classes.rank}>{i + 1}</span>
                <Avatar
                  src={subsonic.getCoverArtUrl({ id: artist.id }, 80)}
                  className={classes.artistCover}
                  alt={artist.name}
                />
                <div className={classes.itemInfo}>
                  <Typography className={classes.itemTitle}>
                    {artist.name}
                  </Typography>
                  <Typography className={classes.itemSub}>
                    {artist.albumCount || 0} albums
                  </Typography>
                </div>
                <span className={classes.playCount}>
                  {artist.playCount}x
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {topSongs.length === 0 && topAlbums.length === 0 && (
        <Typography className={classes.emptyState}>
          No listening data yet. Start playing some music!
        </Typography>
      )}
    </div>
  )
}

export default ListeningStats
