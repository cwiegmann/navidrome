import React, { useState, useCallback, useEffect } from 'react'
import { useDataProvider, Loading } from 'react-admin'
import { useDispatch } from 'react-redux'
import {
  Typography,
  Card,
  CardActionArea,
  makeStyles,
} from '@material-ui/core'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import StarIcon from '@material-ui/icons/Star'
import TrendingUpIcon from '@material-ui/icons/TrendingUp'
import FiberNewIcon from '@material-ui/icons/FiberNew'
import HistoryIcon from '@material-ui/icons/History'
import ShuffleIcon from '@material-ui/icons/Shuffle'
import FavoriteIcon from '@material-ui/icons/Favorite'
import { playTracks, shuffleTracks } from '../actions'
import subsonic from '../subsonic'

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
    maxWidth: 1100,
  },
  pageTitle: {
    fontWeight: 700,
    fontSize: '1.75rem',
    marginBottom: theme.spacing(1),
  },
  subtitle: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(3),
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: theme.spacing(2),
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    transition: 'transform 150ms ease, box-shadow 150ms ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    },
  },
  cardContent: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    padding: theme.spacing(2),
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardIcon: {
    color: '#fff',
    fontSize: '1.5rem',
  },
  cardInfo: {
    flex: 1,
    minWidth: 0,
  },
  cardTitle: {
    fontWeight: 600,
    fontSize: '0.95rem',
  },
  cardDesc: {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    marginTop: 2,
  },
  songCount: {
    fontSize: '0.7rem',
    color: theme.palette.text.hint,
    marginTop: 4,
  },
  loadingChip: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  previewRow: {
    display: 'flex',
    gap: -6,
    marginTop: theme.spacing(1),
    paddingLeft: theme.spacing(8.5),
    paddingBottom: theme.spacing(1),
  },
  previewAvatar: {
    width: 28,
    height: 28,
    borderRadius: 4,
    marginLeft: -4,
    border: `2px solid ${theme.palette.background.paper}`,
  },
}))

const SMART_PLAYLISTS = [
  {
    id: 'top50',
    name: 'Top 50 Most Played',
    description: 'Your all-time favorites by play count',
    icon: TrendingUpIcon,
    color: '#e74c3c',
    sort: { field: 'play_count', order: 'DESC' },
    filter: {},
    limit: 50,
  },
  {
    id: 'starred',
    name: 'Starred Songs',
    description: 'All your loved tracks in one place',
    icon: FavoriteIcon,
    color: '#e91e63',
    sort: { field: 'starred_at', order: 'DESC' },
    filter: { starred: true },
    limit: 100,
  },
  {
    id: 'rated5',
    name: '5-Star Tracks',
    description: 'Only the best of the best',
    icon: StarIcon,
    color: '#f39c12',
    sort: { field: 'rating', order: 'DESC' },
    filter: { rating: 5 },
    limit: 100,
  },
  {
    id: 'recently_played',
    name: 'Recently Played',
    description: 'Jump back into what you were listening to',
    icon: HistoryIcon,
    color: '#3498db',
    sort: { field: 'play_date', order: 'DESC' },
    filter: { recently_played: true },
    limit: 50,
  },
  {
    id: 'recently_added',
    name: 'Added This Month',
    description: 'Fresh additions to your library',
    icon: FiberNewIcon,
    color: '#2ecc71',
    sort: { field: 'created_at', order: 'DESC' },
    filter: {},
    limit: 50,
  },
  {
    id: 'random',
    name: 'Random Mix',
    description: 'Rediscover forgotten gems',
    icon: ShuffleIcon,
    color: '#9b59b6',
    sort: { field: 'random', order: 'ASC' },
    filter: {},
    limit: 50,
    shuffle: true,
  },
]

const SmartPlaylistCard = ({ playlist, classes }) => {
  const dataProvider = useDataProvider()
  const dispatch = useDispatch()
  const [songCount, setSongCount] = useState(null)
  const [playing, setPlaying] = useState(false)
  const Icon = playlist.icon

  useEffect(() => {
    dataProvider
      .getList('song', {
        sort: playlist.sort,
        filter: playlist.filter,
        pagination: { page: 1, perPage: 1 },
      })
      .then(({ total }) => setSongCount(total || 0))
      .catch(() => {})
  }, [dataProvider, playlist.sort, playlist.filter])

  const handlePlay = useCallback(() => {
    setPlaying(true)
    dataProvider
      .getList('song', {
        sort: playlist.sort,
        filter: playlist.filter,
        pagination: { page: 1, perPage: playlist.limit },
      })
      .then(({ data }) => {
        if (data && data.length > 0) {
          const songsMap = data.reduce(
            (acc, cur) => ({ ...acc, [cur.id]: cur }),
            {},
          )
          const ids = data.map((s) => s.id)
          if (playlist.shuffle) {
            dispatch(shuffleTracks(songsMap, ids))
          } else {
            dispatch(playTracks(songsMap, ids))
          }
        }
      })
      .finally(() => setPlaying(false))
  }, [dataProvider, dispatch, playlist])

  return (
    <Card className={classes.card} elevation={0}>
      <CardActionArea onClick={handlePlay} disabled={playing}>
        <div className={classes.cardContent}>
          <div
            className={classes.iconWrapper}
            style={{ backgroundColor: playlist.color }}
          >
            <Icon className={classes.cardIcon} />
          </div>
          <div className={classes.cardInfo}>
            <Typography className={classes.cardTitle}>
              {playlist.name}
            </Typography>
            <Typography className={classes.cardDesc}>
              {playlist.description}
            </Typography>
            {songCount !== null && (
              <Typography className={classes.songCount}>
                {songCount} songs available
              </Typography>
            )}
          </div>
          <PlayArrowIcon
            style={{ color: playlist.color, fontSize: 28 }}
          />
        </div>
      </CardActionArea>
    </Card>
  )
}

const SmartPlaylists = () => {
  const classes = useStyles()

  return (
    <div className={classes.root}>
      <Typography className={classes.pageTitle}>Smart Playlists</Typography>
      <Typography className={classes.subtitle}>
        Auto-generated playlists based on your library and listening habits
      </Typography>

      <div className={classes.grid}>
        {SMART_PLAYLISTS.map((pl) => (
          <SmartPlaylistCard
            key={pl.id}
            playlist={pl}
            classes={classes}
          />
        ))}
      </div>
    </div>
  )
}

export default SmartPlaylists
