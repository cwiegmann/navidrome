import React, { useEffect, useState } from 'react'
import { useDataProvider, Loading } from 'react-admin'
import {
  GridList,
  GridListTile,
  GridListTileBar,
  Typography,
  useMediaQuery,
  makeStyles,
} from '@material-ui/core'
import withWidth from '@material-ui/core/withWidth'
import { Link } from 'react-router-dom'
import subsonic from '../subsonic'
import config from '../config'

const useStyles = makeStyles(
  (theme) => ({
    root: {
      margin: '20px',
      display: 'grid',
    },
    sectionTitle: {
      fontWeight: 600,
      marginBottom: theme.spacing(1),
      marginTop: theme.spacing(3),
      '&:first-child': {
        marginTop: 0,
      },
    },
    tileBar: {
      transition: 'all 150ms ease-out',
      opacity: 0,
      textAlign: 'left',
      marginBottom: '3px',
      background:
        'linear-gradient(to top, rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.4) 70%,rgba(0,0,0,0) 100%)',
    },
    tileBarMobile: {
      textAlign: 'left',
      marginBottom: '3px',
      background:
        'linear-gradient(to top, rgba(0,0,0,0.7) 0%,rgba(0,0,0,0.4) 70%,rgba(0,0,0,0) 100%)',
    },
    link: {
      position: 'relative',
      display: 'block',
      textDecoration: 'none',
      '&:hover $tileBar': {
        opacity: 1,
      },
    },
    albumLink: {
      position: 'relative',
      display: 'block',
      textDecoration: 'none',
    },
    cover: {
      display: 'inline-block',
      width: '100%',
      objectFit: 'contain',
    },
    albumName: {
      fontSize: '14px',
      color: theme.palette.type === 'dark' ? '#eee' : 'black',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    },
    albumSubtitle: {
      fontSize: '12px',
      color: theme.palette.type === 'dark' ? '#c5c5c5' : '#696969',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
    },
    artistCover: {
      display: 'inline-block',
      width: '100%',
      objectFit: 'contain',
      borderRadius: '50%',
    },
    artistName: {
      fontSize: '14px',
      color: theme.palette.type === 'dark' ? '#eee' : 'black',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      textAlign: 'center',
    },
    emptyState: {
      padding: theme.spacing(4),
      textAlign: 'center',
      color: theme.palette.text.secondary,
    },
  }),
  { name: 'NDHomePage' },
)

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

const AlbumTile = ({ album, classes, isDesktop }) => {
  const coverUrl = subsonic.getCoverArtUrl(album, 300, true)

  return (
    <div>
      <Link className={classes.link} to={getAlbumLink(album.id)}>
        <img
          src={coverUrl}
          alt={album.name}
          className={classes.cover}
          loading="lazy"
        />
        <GridListTileBar
          className={isDesktop ? classes.tileBar : classes.tileBarMobile}
        />
      </Link>
      <Link className={classes.albumLink} to={getAlbumLink(album.id)}>
        <Typography className={classes.albumName}>{album.name}</Typography>
      </Link>
      <Typography className={classes.albumSubtitle}>
        {album.albumArtist}
      </Typography>
    </div>
  )
}

const ArtistTile = ({ artist, classes }) => {
  const coverUrl = subsonic.getCoverArtUrl(
    { id: artist.id, updatedAt: artist.updatedAt },
    300,
    true,
  )

  return (
    <div>
      <Link className={classes.link} to={getArtistLink(artist.id)}>
        <img
          src={coverUrl}
          alt={artist.name}
          className={classes.artistCover}
          loading="lazy"
        />
      </Link>
      <Link className={classes.albumLink} to={getArtistLink(artist.id)}>
        <Typography className={classes.artistName}>{artist.name}</Typography>
      </Link>
    </div>
  )
}

const HomePageContent = ({ width }) => {
  const classes = useStyles()
  const dataProvider = useDataProvider()
  const [albums, setAlbums] = useState([])
  const [artists, setArtists] = useState([])
  const [loading, setLoading] = useState(true)
  const isDesktop = useMediaQuery((theme) => theme.breakpoints.up('md'), {
    noSsr: true,
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [albumResult, artistResult] = await Promise.all([
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
        ])
        const albumData = albumResult.data || []
        const artistData = artistResult.data || []
        setAlbums(albumData.filter((a) => a.playDate))
        setArtists(artistData.filter((a) => a.playDate))
      } catch (err) {
        console.error('Failed to load home page data:', err) // eslint-disable-line no-console
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [dataProvider])

  if (loading) {
    return <Loading />
  }

  const cols = getColsForWidth(width)

  return (
    <div className={classes.root}>
      <Typography variant="h5" className={classes.sectionTitle}>
        Recently Played Albums
      </Typography>
      {albums.length > 0 ? (
        <GridList
          component="div"
          cellHeight="auto"
          cols={cols}
          spacing={20}
        >
          {albums.map((album) => (
            <GridListTile key={album.id}>
              <AlbumTile
                album={album}
                classes={classes}
                isDesktop={isDesktop}
              />
            </GridListTile>
          ))}
        </GridList>
      ) : (
        <Typography className={classes.emptyState}>
          No recently played albums yet. Start listening!
        </Typography>
      )}

      <Typography variant="h5" className={classes.sectionTitle}>
        Recently Played Artists
      </Typography>
      {artists.length > 0 ? (
        <GridList
          component="div"
          cellHeight="auto"
          cols={cols}
          spacing={20}
        >
          {artists.map((artist) => (
            <GridListTile key={artist.id}>
              <ArtistTile artist={artist} classes={classes} />
            </GridListTile>
          ))}
        </GridList>
      ) : (
        <Typography className={classes.emptyState}>
          No recently played artists yet. Start listening!
        </Typography>
      )}
    </div>
  )
}

const HomePage = withWidth()(HomePageContent)
export default HomePage
