import React, { useEffect, useState } from 'react'
import {
  Typography,
  makeStyles,
} from '@material-ui/core'
import { Link } from 'react-router-dom'
import { useRecordContext } from 'react-admin'
import subsonic from '../subsonic'
import config from '../config'

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(0, 4, 3, 4),
    [theme.breakpoints.up('md')]: {
      padding: theme.spacing(0, 5, 3, 5),
    },
  },
  title: {
    fontWeight: 600,
    fontSize: '1rem',
    marginBottom: theme.spacing(2),
  },
  grid: {
    display: 'flex',
    gap: theme.spacing(2.5),
    overflowX: 'auto',
    paddingBottom: theme.spacing(1),
    '&::-webkit-scrollbar': {
      height: 4,
    },
    '&::-webkit-scrollbar-thumb': {
      borderRadius: 2,
      backgroundColor: theme.palette.divider,
    },
  },
  card: {
    textDecoration: 'none',
    textAlign: 'center',
    flexShrink: 0,
    width: 110,
    transition: 'opacity 150ms ease',
    '&:hover': {
      opacity: 0.8,
    },
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: '50%',
    objectFit: 'cover',
    display: 'block',
    margin: '0 auto',
    backgroundColor: theme.palette.action.hover,
  },
  name: {
    fontSize: '0.8rem',
    fontWeight: 500,
    color: theme.palette.type === 'dark' ? '#eee' : 'black',
    marginTop: 8,
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textOverflow: 'ellipsis',
  },
}))

const getArtistLink = (artistId) => {
  if (config.devShowArtistPage) {
    return `/artist/${artistId}/show`
  }
  return `/album?filter=${encodeURIComponent(JSON.stringify({ artist_id: artistId }))}&order=ASC&sort=max_year`
}

const SimilarArtists = (props) => {
  const classes = useStyles()
  const record = useRecordContext(props)
  const [similar, setSimilar] = useState([])

  useEffect(() => {
    if (!record?.id) return
    subsonic
      .getArtistInfo(record.id)
      .then((resp) => resp.json['subsonic-response'])
      .then((data) => {
        if (data.status === 'ok' && data.artistInfo?.similarArtist) {
          setSimilar(data.artistInfo.similarArtist.slice(0, 8))
        }
      })
      .catch((e) => console.error('Similar artists fetch failed:', e)) // eslint-disable-line no-console
  }, [record?.id])

  if (similar.length === 0) return null

  return (
    <div className={classes.root}>
      <Typography className={classes.title}>
        Fans Also Like
      </Typography>
      <div className={classes.grid}>
        {similar.map((artist) => (
          <Link
            key={artist.id}
            to={getArtistLink(artist.id)}
            className={classes.card}
          >
            <img
              src={subsonic.getCoverArtUrl(
                { id: artist.id },
                200,
                true,
              )}
              alt={artist.name}
              className={classes.avatar}
              loading="lazy"
            />
            <Typography className={classes.name}>
              {artist.name}
            </Typography>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default SimilarArtists
