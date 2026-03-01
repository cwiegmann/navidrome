import React, { useEffect, useState } from 'react'
import { useDataProvider, Loading } from 'react-admin'
import {
  Typography,
  makeStyles,
  useMediaQuery,
} from '@material-ui/core'
import { Link } from 'react-router-dom'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import StarIcon from '@material-ui/icons/Star'
import subsonic from '../subsonic'

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
    color: '#ffc107',
    fontSize: '2rem',
  },
  pageTitle: {
    fontWeight: 700,
    fontSize: '1.75rem',
  },
  pageSubtitle: {
    fontSize: '0.9rem',
    color: theme.palette.text.secondary,
    marginTop: 2,
  },
  albumGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
    gap: theme.spacing(2.5),
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
    display: 'flex',
    alignItems: 'center',
    gap: 2,
  },
  starIcon: {
    fontSize: '0.8rem',
    color: '#ffc107',
  },
  emptyState: {
    padding: theme.spacing(6),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}))

const TopRatedPage = () => {
  const classes = useStyles()
  const dataProvider = useDataProvider()
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const isDesktop = useMediaQuery((theme) => theme.breakpoints.up('md'), { noSsr: true })

  useEffect(() => {
    dataProvider
      .getList('album', {
        sort: { field: 'rating', order: 'DESC' },
        filter: { has_rating: true },
        pagination: { page: 1, perPage: 200 },
      })
      .then(({ data }) => {
        setAlbums((data || []).filter((a) => a.rating >= 4))
      })
      .catch(() => setAlbums([]))
      .finally(() => setLoading(false))
  }, [dataProvider])

  if (loading) return <Loading />

  return (
    <div className={classes.root}>
      <div className={classes.pageHeader}>
        <StarIcon className={classes.pageIcon} />
        <div>
          <Typography className={classes.pageTitle}>Top Rated</Typography>
          <Typography className={classes.pageSubtitle}>
            Albums rated 4 stars or higher
          </Typography>
        </div>
      </div>

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
                {Array.from({ length: Math.round(album.rating) }).map((_, i) => (
                  <StarIcon key={i} className={classes.starIcon} />
                ))}
              </Typography>
            </Link>
          ))}
        </div>
      ) : (
        <Typography className={classes.emptyState}>
          No albums rated 4 stars or higher yet. Rate some albums to see them here!
        </Typography>
      )}
    </div>
  )
}

export default TopRatedPage
