import React, { useEffect, useState } from 'react'
import { useDataProvider, Loading } from 'react-admin'
import {
  Typography,
  makeStyles,
  useMediaQuery,
} from '@material-ui/core'
import { Link } from 'react-router-dom'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import LibraryAddIcon from '@material-ui/icons/LibraryAdd'
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
    color: theme.palette.primary.main,
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
  albumArtist: {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
  emptyState: {
    padding: theme.spacing(6),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}))

const RecentlyAddedPage = () => {
  const classes = useStyles()
  const dataProvider = useDataProvider()
  const [albums, setAlbums] = useState([])
  const [loading, setLoading] = useState(true)
  const isDesktop = useMediaQuery((theme) => theme.breakpoints.up('md'), { noSsr: true })

  useEffect(() => {
    dataProvider
      .getList('album', {
        sort: { field: 'created_at', order: 'DESC' },
        pagination: { page: 1, perPage: 25 },
      })
      .then(({ data }) => setAlbums(data || []))
      .catch(() => setAlbums([]))
      .finally(() => setLoading(false))
  }, [dataProvider])

  if (loading) return <Loading />

  return (
    <div className={classes.root}>
      <div className={classes.pageHeader}>
        <LibraryAddIcon className={classes.pageIcon} />
        <div>
          <Typography className={classes.pageTitle}>Recently Added</Typography>
          <Typography className={classes.pageSubtitle}>
            The 25 most recently added albums
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
              <Typography className={classes.albumArtist}>{album.albumArtist}</Typography>
            </Link>
          ))}
        </div>
      ) : (
        <Typography className={classes.emptyState}>
          No albums in your library yet.
        </Typography>
      )}
    </div>
  )
}

export default RecentlyAddedPage
