import React, { useEffect, useState, useMemo } from 'react'
import { useDataProvider, Loading } from 'react-admin'
import {
  GridList,
  GridListTile,
  Typography,
  useMediaQuery,
  makeStyles,
  Card,
  CardContent,
  Avatar,
  Divider,
} from '@material-ui/core'
import withWidth from '@material-ui/core/withWidth'
import { Link } from 'react-router-dom'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import LibraryMusicIcon from '@material-ui/icons/LibraryMusic'
import AccessTimeIcon from '@material-ui/icons/AccessTime'
import MusicNoteIcon from '@material-ui/icons/MusicNote'
import FolderIcon from '@material-ui/icons/Folder'
import subsonic from '../subsonic'
import config from '../config'

const useStyles = makeStyles(
  (theme) => ({
    root: {
      padding: theme.spacing(3),
      maxWidth: 1400,
    },
    greeting: {
      fontWeight: 700,
      fontSize: '1.75rem',
      marginBottom: theme.spacing(3),
      [theme.breakpoints.up('md')]: {
        fontSize: '2rem',
      },
    },
    quickResumeRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: theme.spacing(1.5),
      marginBottom: theme.spacing(4),
    },
    quickResumeCard: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1.5),
      padding: 0,
      borderRadius: 6,
      overflow: 'hidden',
      backgroundColor:
        theme.palette.type === 'dark'
          ? 'rgba(255,255,255,0.07)'
          : 'rgba(0,0,0,0.04)',
      textDecoration: 'none',
      transition: 'background-color 150ms ease',
      height: 56,
      '&:hover': {
        backgroundColor:
          theme.palette.type === 'dark'
            ? 'rgba(255,255,255,0.12)'
            : 'rgba(0,0,0,0.08)',
      },
    },
    quickResumeCover: {
      width: 56,
      height: 56,
      objectFit: 'cover',
      flexShrink: 0,
    },
    quickResumeName: {
      fontSize: '0.8rem',
      fontWeight: 600,
      color: theme.palette.type === 'dark' ? '#eee' : 'black',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      paddingRight: theme.spacing(1),
    },
    mainContent: {
      display: 'grid',
      gridTemplateColumns: '1fr',
      gap: theme.spacing(3),
      [theme.breakpoints.up('lg')]: {
        gridTemplateColumns: '1fr 320px',
      },
    },
    leftColumn: {},
    rightColumn: {
      display: 'flex',
      flexDirection: 'column',
      gap: theme.spacing(2),
    },
    sectionTitle: {
      fontWeight: 600,
      fontSize: '1.15rem',
      marginBottom: theme.spacing(1.5),
    },
    link: {
      position: 'relative',
      display: 'block',
      textDecoration: 'none',
      borderRadius: 6,
      overflow: 'hidden',
      '&:hover $playOverlay': {
        opacity: 1,
      },
    },
    albumLink: {
      display: 'block',
      textDecoration: 'none',
    },
    cover: {
      display: 'block',
      width: '100%',
      objectFit: 'contain',
      borderRadius: 6,
    },
    playOverlay: {
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
    },
    playIcon: {
      color: '#fff',
      fontSize: 40,
    },
    albumName: {
      fontSize: '13px',
      fontWeight: 500,
      color: theme.palette.type === 'dark' ? '#eee' : 'black',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      marginTop: 6,
    },
    albumSubtitle: {
      fontSize: '12px',
      color: theme.palette.type === 'dark' ? '#c5c5c5' : '#696969',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    },
    artistCover: {
      display: 'block',
      width: '100%',
      objectFit: 'contain',
      borderRadius: '50%',
    },
    artistName: {
      fontSize: '13px',
      fontWeight: 500,
      color: theme.palette.type === 'dark' ? '#eee' : 'black',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      textAlign: 'center',
      marginTop: 6,
    },
    mixesRow: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
      gap: theme.spacing(2),
      marginBottom: theme.spacing(4),
    },
    mixCard: {
      borderRadius: 8,
      padding: theme.spacing(2),
      minHeight: 100,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      textDecoration: 'none',
      transition: 'transform 150ms ease, box-shadow 150ms ease',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      },
    },
    mixLabel: {
      color: '#fff',
      fontWeight: 700,
      fontSize: '1rem',
      lineHeight: 1.2,
      textShadow: '0 1px 4px rgba(0,0,0,0.3)',
    },
    statsCard: {
      borderRadius: 8,
      backgroundColor:
        theme.palette.type === 'dark'
          ? 'rgba(255,255,255,0.05)'
          : 'rgba(0,0,0,0.03)',
    },
    statsTitle: {
      fontWeight: 600,
      fontSize: '0.85rem',
      color: theme.palette.text.secondary,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      marginBottom: theme.spacing(1.5),
    },
    statRow: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1.5),
      marginBottom: theme.spacing(1.5),
    },
    statIcon: {
      color: theme.palette.primary.main,
      fontSize: '1.2rem',
    },
    statValue: {
      fontWeight: 700,
      fontSize: '1.3rem',
    },
    statLabel: {
      fontSize: '0.8rem',
      color: theme.palette.text.secondary,
    },
    newInLibraryCard: {
      borderRadius: 8,
      backgroundColor:
        theme.palette.type === 'dark'
          ? 'rgba(255,255,255,0.05)'
          : 'rgba(0,0,0,0.03)',
    },
    newItem: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1.5),
      padding: theme.spacing(0.75, 0),
      textDecoration: 'none',
      '&:hover': {
        opacity: 0.8,
      },
    },
    newItemCover: {
      width: 40,
      height: 40,
      borderRadius: 4,
      objectFit: 'cover',
      flexShrink: 0,
    },
    newItemTitle: {
      fontSize: '0.85rem',
      fontWeight: 500,
      color: theme.palette.type === 'dark' ? '#eee' : 'black',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    },
    newItemSub: {
      fontSize: '0.75rem',
      color: theme.palette.text.secondary,
    },
    emptyState: {
      padding: theme.spacing(4),
      textAlign: 'center',
      color: theme.palette.text.secondary,
    },
    divider: {
      margin: theme.spacing(5, 0, 4, 0),
    },
    // Browse section styles
    genreGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
      gap: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
    genreCard: {
      borderRadius: 8,
      padding: theme.spacing(2, 2),
      minHeight: 80,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-end',
      textDecoration: 'none',
      transition: 'transform 150ms ease, box-shadow 150ms ease',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden',
      '&:hover': {
        transform: 'translateY(-2px)',
        boxShadow: '0 6px 24px rgba(0,0,0,0.25)',
      },
    },
    genreFolderIcon: {
      position: 'absolute',
      top: 10,
      left: 12,
      color: 'rgba(255,255,255,0.3)',
      fontSize: '1.3rem',
    },
    genreName: {
      color: '#fff',
      fontWeight: 700,
      fontSize: '0.9rem',
      lineHeight: 1.2,
      textShadow: '0 1px 4px rgba(0,0,0,0.3)',
    },
    genreCount: {
      color: 'rgba(255,255,255,0.7)',
      fontSize: '0.7rem',
      marginTop: 2,
    },
    // History section styles
    historyEntry: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1.5),
      padding: theme.spacing(0.75, 1),
      borderRadius: 6,
      textDecoration: 'none',
      transition: 'background-color 150ms ease',
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
      },
    },
    historyTimestamp: {
      fontSize: '0.75rem',
      color: theme.palette.text.hint,
      minWidth: 52,
      flexShrink: 0,
    },
    historyCover: {
      width: 40,
      height: 40,
      borderRadius: 4,
      flexShrink: 0,
    },
    historyInfo: {
      flex: 1,
      minWidth: 0,
    },
    historySongTitle: {
      fontSize: '0.9rem',
      fontWeight: 500,
      color: theme.palette.type === 'dark' ? '#eee' : 'black',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    historySongArtist: {
      fontSize: '0.75rem',
      color: theme.palette.text.secondary,
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    historyDuration: {
      fontSize: '0.75rem',
      color: theme.palette.text.hint,
      flexShrink: 0,
    },
    dayGroup: {
      marginBottom: theme.spacing(3),
    },
    dayLabel: {
      fontWeight: 600,
      fontSize: '0.85rem',
      color: theme.palette.text.secondary,
      textTransform: 'uppercase',
      letterSpacing: '0.05em',
      marginBottom: theme.spacing(1),
      paddingBottom: theme.spacing(0.5),
      borderBottom: `1px solid ${theme.palette.divider}`,
    },
  }),
  { name: 'NDHomePage' },
)

const getGreeting = () => {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good Morning'
  if (hour < 17) return 'Good Afternoon'
  return 'Good Evening'
}

const getColsForWidth = (width) => {
  if (width === 'xs') return 2
  if (width === 'sm') return 3
  if (width === 'md') return 4
  if (width === 'lg') return 5
  return 5
}

const getAlbumLink = (id) => `/album/${id}/show`

const getArtistLink = (artistId) => {
  if (config.devShowArtistPage && artistId !== config.variousArtistsId) {
    return `/artist/${artistId}/show`
  }
  return `/album?filter=${encodeURIComponent(JSON.stringify({ artist_id: artistId }))}&order=ASC&sort=max_year`
}

const MIX_GRADIENTS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
]

const GENRE_GRADIENTS = [
  'linear-gradient(135deg, #e67e22, #d35400)',
  'linear-gradient(135deg, #3498db, #2980b9)',
  'linear-gradient(135deg, #8e6e53, #6d4c41)',
  'linear-gradient(135deg, #9b59b6, #8e44ad)',
  'linear-gradient(135deg, #1abc9c, #16a085)',
  'linear-gradient(135deg, #e74c3c, #c0392b)',
  'linear-gradient(135deg, #f39c12, #e67e22)',
  'linear-gradient(135deg, #2ecc71, #27ae60)',
  'linear-gradient(135deg, #e84393, #d63384)',
  'linear-gradient(135deg, #6c5ce7, #5f3dc4)',
  'linear-gradient(135deg, #00b894, #00a381)',
  'linear-gradient(135deg, #fdcb6e, #f0932b)',
]

const formatDurationHours = (seconds) => {
  const hours = Math.floor(seconds / 3600)
  const mins = Math.floor((seconds % 3600) / 60)
  if (hours > 0) return `${hours}h ${mins}m`
  return `${mins}m`
}

const formatTime = (dateStr) => {
  const d = new Date(dateStr)
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

const formatDay = (dateStr) => {
  const d = new Date(dateStr)
  const now = new Date()
  const diff = Math.floor((now - d) / (1000 * 60 * 60 * 24))
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Yesterday'
  return d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })
}

const formatSongDuration = (seconds) => {
  if (!seconds) return ''
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const getDateKey = (dateStr) => {
  const d = new Date(dateStr)
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
}

const HomePageContent = ({ width }) => {
  const classes = useStyles()
  const dataProvider = useDataProvider()
  const [albums, setAlbums] = useState([])
  const [artists, setArtists] = useState([])
  const [recentlyAdded, setRecentlyAdded] = useState([])
  const [genres, setGenres] = useState([])
  const [historySongs, setHistorySongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const isDesktop = useMediaQuery((theme) => theme.breakpoints.up('md'), {
    noSsr: true,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [albumResult, artistResult, addedResult, songResult, genreResult] =
          await Promise.all([
            dataProvider.getList('album', {
              sort: { field: 'play_date', order: 'DESC' },
              filter: { recently_played: true },
              pagination: { page: 1, perPage: 10 },
            }),
            dataProvider.getList('artist', {
              sort: { field: 'play_date', order: 'DESC' },
              filter: { recently_played: true },
              pagination: { page: 1, perPage: 10 },
            }),
            dataProvider.getList('album', {
              sort: { field: 'created_at', order: 'DESC' },
              pagination: { page: 1, perPage: 5 },
            }),
            dataProvider
              .getList('song', {
                sort: { field: 'play_date', order: 'DESC' },
                filter: { recently_played: true },
                pagination: { page: 1, perPage: 100 },
              })
              .catch(() => ({ data: [] })),
            dataProvider
              .getList('genre', {
                sort: { field: 'name', order: 'ASC' },
                pagination: { page: 1, perPage: 200 },
              })
              .catch(() => ({ data: [] })),
          ])

        const allSongs = (songResult.data || []).filter((s) => s.playDate)
        setAlbums((albumResult.data || []).filter((a) => a.playDate))
        setArtists((artistResult.data || []).filter((a) => a.playDate))
        setRecentlyAdded(addedResult.data || [])
        setHistorySongs(allSongs.slice(0, 50))

        setGenres(
          (genreResult.data || [])
            .filter((g) => g.albumCount > 0)
            .sort((a, b) => b.albumCount - a.albumCount)
            .slice(0, 12),
        )

        const songs = allSongs
        const totalDuration = songs.reduce((acc, s) => acc + (s.duration || 0), 0)
        const topArtistMap = {}
        songs.forEach((s) => {
          if (s.artist) topArtistMap[s.artist] = (topArtistMap[s.artist] || 0) + 1
        })
        const topArtist = Object.entries(topArtistMap).sort((a, b) => b[1] - a[1])[0]

        setStats({
          songsPlayed: songs.length,
          totalDuration,
          topArtist: topArtist ? topArtist[0] : null,
        })
      } catch (err) {
        console.error('Failed to load home page data:', err) // eslint-disable-line no-console
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [dataProvider])

  const genreMixes = useMemo(() => {
    const genreMap = {}
    albums.forEach((a) => {
      if (a.genre) genreMap[a.genre] = (genreMap[a.genre] || 0) + 1
    })
    return Object.entries(genreMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([genre], i) => ({
        name: `${genre} Mix`,
        gradient: MIX_GRADIENTS[i % MIX_GRADIENTS.length],
        link: `/album?filter=${encodeURIComponent(JSON.stringify({ genre }))}&order=DESC&sort=play_count`,
      }))
  }, [albums])

  const historyGrouped = useMemo(() => {
    const grouped = {}
    historySongs.forEach((song) => {
      const key = getDateKey(song.playDate)
      if (!grouped[key]) {
        grouped[key] = { label: formatDay(song.playDate), songs: [] }
      }
      grouped[key].songs.push(song)
    })
    return Object.values(grouped).slice(0, 5)
  }, [historySongs])

  if (loading) return <Loading />

  const cols = getColsForWidth(width)

  return (
    <div className={classes.root}>
      {/* ── Section 1: Home Dashboard ── */}
      <Typography className={classes.greeting}>{getGreeting()}</Typography>

      {albums.length > 0 && (
        <div className={classes.quickResumeRow}>
          {albums.slice(0, 6).map((album) => (
            <Link key={album.id} to={getAlbumLink(album.id)} className={classes.quickResumeCard}>
              <img src={subsonic.getCoverArtUrl(album, 120, true)} alt={album.name} className={classes.quickResumeCover} />
              <Typography className={classes.quickResumeName}>{album.name}</Typography>
            </Link>
          ))}
        </div>
      )}

      <div className={classes.mainContent}>
        <div className={classes.leftColumn}>
          <Typography className={classes.sectionTitle}>Recently Played</Typography>
          {albums.length > 0 ? (
            <GridList component="div" cellHeight="auto" cols={Math.min(cols, 5)} spacing={20} style={{ marginBottom: 32 }}>
              {albums.map((album) => (
                <GridListTile key={album.id}>
                  <div>
                    <Link className={classes.link} to={getAlbumLink(album.id)}>
                      <img src={subsonic.getCoverArtUrl(album, 300, true)} alt={album.name} className={classes.cover} loading="lazy" />
                      {isDesktop && (
                        <div className={classes.playOverlay}>
                          <PlayArrowIcon className={classes.playIcon} />
                        </div>
                      )}
                    </Link>
                    <Link className={classes.albumLink} to={getAlbumLink(album.id)}>
                      <Typography className={classes.albumName}>{album.name}</Typography>
                    </Link>
                    <Typography className={classes.albumSubtitle}>{album.albumArtist}</Typography>
                  </div>
                </GridListTile>
              ))}
            </GridList>
          ) : (
            <Typography className={classes.emptyState}>No recently played albums yet. Start listening!</Typography>
          )}

          {genreMixes.length > 0 && (
            <>
              <Typography className={classes.sectionTitle}>Your Top Mixes</Typography>
              <div className={classes.mixesRow}>
                {genreMixes.map((mix) => (
                  <Link key={mix.name} to={mix.link} className={classes.mixCard} style={{ background: mix.gradient }}>
                    <Typography className={classes.mixLabel}>{mix.name}</Typography>
                  </Link>
                ))}
              </div>
            </>
          )}

          <Typography className={classes.sectionTitle}>Recently Played Artists</Typography>
          {artists.length > 0 ? (
            <GridList component="div" cellHeight="auto" cols={Math.min(cols, 5)} spacing={20}>
              {artists.map((artist) => (
                <GridListTile key={artist.id}>
                  <div>
                    <Link className={classes.link} to={getArtistLink(artist.id)}>
                      <img
                        src={subsonic.getCoverArtUrl({ id: artist.id, updatedAt: artist.updatedAt }, 300, true)}
                        alt={artist.name}
                        className={classes.artistCover}
                        loading="lazy"
                      />
                    </Link>
                    <Link className={classes.albumLink} to={getArtistLink(artist.id)}>
                      <Typography className={classes.artistName}>{artist.name}</Typography>
                    </Link>
                  </div>
                </GridListTile>
              ))}
            </GridList>
          ) : (
            <Typography className={classes.emptyState}>No recently played artists yet. Start listening!</Typography>
          )}
        </div>

        <div className={classes.rightColumn}>
          {stats && (
            <Card className={classes.statsCard} elevation={0}>
              <CardContent>
                <Typography className={classes.statsTitle}>Recent Activity</Typography>
                <div className={classes.statRow}>
                  <AccessTimeIcon className={classes.statIcon} />
                  <div>
                    <Typography className={classes.statValue}>{formatDurationHours(stats.totalDuration)}</Typography>
                    <Typography className={classes.statLabel}>listened recently</Typography>
                  </div>
                </div>
                <div className={classes.statRow}>
                  <MusicNoteIcon className={classes.statIcon} />
                  <div>
                    <Typography className={classes.statValue}>{stats.songsPlayed}</Typography>
                    <Typography className={classes.statLabel}>songs played</Typography>
                  </div>
                </div>
                {stats.topArtist && (
                  <div className={classes.statRow}>
                    <LibraryMusicIcon className={classes.statIcon} />
                    <div>
                      <Typography className={classes.statValue}>{stats.topArtist}</Typography>
                      <Typography className={classes.statLabel}>top artist</Typography>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {recentlyAdded.length > 0 && (
            <Card className={classes.newInLibraryCard} elevation={0}>
              <CardContent>
                <Typography className={classes.statsTitle}>New in Library</Typography>
                {recentlyAdded.map((album) => (
                  <Link key={album.id} to={getAlbumLink(album.id)} className={classes.newItem}>
                    <img src={subsonic.getCoverArtUrl(album, 80, true)} alt={album.name} className={classes.newItemCover} />
                    <div style={{ minWidth: 0 }}>
                      <Typography className={classes.newItemTitle}>{album.name}</Typography>
                      <Typography className={classes.newItemSub}>{album.albumArtist}</Typography>
                    </div>
                  </Link>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* ── Section 2: Browse by Genre ── */}
      {genres.length > 0 && (
        <>
          <Divider className={classes.divider} />
          <Typography className={classes.sectionTitle}>Browse by Genre</Typography>
          <div className={classes.genreGrid}>
            {genres.map((genre, i) => (
              <Link
                key={genre.id || genre.name}
                to={`/album?filter=${encodeURIComponent(JSON.stringify({ genre_id: genre.id }))}&order=ASC&sort=name`}
                className={classes.genreCard}
                style={{ background: GENRE_GRADIENTS[i % GENRE_GRADIENTS.length] }}
              >
                <FolderIcon className={classes.genreFolderIcon} />
                <Typography className={classes.genreName}>{genre.name}</Typography>
                <Typography className={classes.genreCount}>{genre.albumCount} albums</Typography>
              </Link>
            ))}
          </div>
        </>
      )}

      {/* ── Section 3: Listen History ── */}
      {historyGrouped.length > 0 && (
        <>
          <Divider className={classes.divider} />
          <Typography className={classes.sectionTitle}>Listen History</Typography>
          {historyGrouped.map((day, i) => (
            <div key={i} className={classes.dayGroup}>
              <Typography className={classes.dayLabel}>{day.label}</Typography>
              {day.songs.map((song) => (
                <Link
                  key={`${song.id}-${song.playDate}`}
                  to={`/album/${song.albumId}/show`}
                  className={classes.historyEntry}
                >
                  <Typography className={classes.historyTimestamp}>{formatTime(song.playDate)}</Typography>
                  <Avatar
                    variant="square"
                    src={subsonic.getCoverArtUrl({ id: song.id, updatedAt: song.updatedAt, album: song.album }, 80)}
                    className={classes.historyCover}
                    alt={song.title}
                  />
                  <div className={classes.historyInfo}>
                    <Typography className={classes.historySongTitle}>{song.title}</Typography>
                    <Typography className={classes.historySongArtist}>{song.artist} &mdash; {song.album}</Typography>
                  </div>
                  <Typography className={classes.historyDuration}>{formatSongDuration(song.duration)}</Typography>
                </Link>
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  )
}

const HomePage = withWidth()(HomePageContent)
export default HomePage
