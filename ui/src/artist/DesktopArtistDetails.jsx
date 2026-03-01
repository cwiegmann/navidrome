import React, { useState, useCallback } from 'react'
import { Typography, Collapse, Button } from '@material-ui/core'
import { makeStyles } from '@material-ui/core'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import ShuffleIcon from '@material-ui/icons/Shuffle'
import ArtistExternalLinks from './ArtistExternalLink'
import config from '../config'
import { LoveButton, RatingField } from '../common'
import Lightbox from 'react-image-lightbox'
import ExpandInfoDialog from '../dialogs/ExpandInfoDialog'
import AlbumInfo from '../album/AlbumInfo'
import subsonic from '../subsonic'
import { SafeHTML } from '../common/SafeHTML'
import { useDispatch } from 'react-redux'
import { useDataProvider } from 'react-admin'
import { playTracks } from '../actions'
import SimilarArtists from './SimilarArtists'

const useStyles = makeStyles(
  (theme) => ({
    heroWrapper: {
      position: 'relative',
      width: '100%',
      minHeight: 280,
      overflow: 'hidden',
      marginBottom: theme.spacing(0.5),
      [theme.breakpoints.up('md')]: {
        minHeight: 320,
      },
    },
    heroBg: {
      position: 'absolute',
      top: '-20%',
      left: '-10%',
      width: '120%',
      height: '140%',
      objectFit: 'cover',
      filter: 'blur(30px) brightness(0.35) saturate(1.3)',
      zIndex: 0,
    },
    heroOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '60%',
      background: `linear-gradient(to top, ${
        theme.palette.type === 'dark'
          ? theme.palette.background.default
          : '#fafafa'
      } 0%, transparent 100%)`,
      zIndex: 1,
    },
    heroContent: {
      position: 'relative',
      zIndex: 2,
      display: 'flex',
      alignItems: 'flex-end',
      gap: theme.spacing(3),
      padding: theme.spacing(3, 4),
      height: '100%',
      minHeight: 280,
      [theme.breakpoints.up('md')]: {
        minHeight: 320,
        padding: theme.spacing(4, 5),
      },
    },
    artistAvatar: {
      width: 160,
      height: 160,
      borderRadius: '50%',
      objectFit: 'cover',
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      border: '4px solid rgba(255,255,255,0.15)',
      cursor: 'pointer',
      flexShrink: 0,
      transition: 'opacity 0.3s ease-in-out',
      [theme.breakpoints.up('md')]: {
        width: 180,
        height: 180,
      },
    },
    avatarLoading: {
      opacity: 0.5,
    },
    heroInfo: {
      flex: 1,
      minWidth: 0,
      paddingBottom: theme.spacing(1),
    },
    artistName: {
      color: '#fff',
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.2,
      wordBreak: 'break-word',
      textShadow: '0 2px 8px rgba(0,0,0,0.3)',
      [theme.breakpoints.up('md')]: {
        fontSize: '2.5rem',
      },
    },
    statsLine: {
      color: 'rgba(255,255,255,0.6)',
      fontSize: '0.9rem',
      marginTop: theme.spacing(0.5),
    },
    actionRow: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1.5),
      marginTop: theme.spacing(2),
    },
    playAllButton: {
      borderRadius: 20,
      padding: theme.spacing(0.75, 2.5),
      fontWeight: 600,
      textTransform: 'none',
      fontSize: '0.9rem',
    },
    shuffleButton: {
      borderRadius: 20,
      padding: theme.spacing(0.75, 2.5),
      fontWeight: 600,
      textTransform: 'none',
      fontSize: '0.9rem',
      color: '#fff',
      borderColor: 'rgba(255,255,255,0.4)',
      '&:hover': {
        borderColor: '#fff',
      },
    },
    loveButton: {
      color: 'rgba(255,255,255,0.6)',
      '&:hover': {
        color: '#fff',
      },
    },
    bioSection: {
      padding: theme.spacing(0, 4, 2, 4),
      [theme.breakpoints.up('md')]: {
        padding: theme.spacing(0, 5, 2, 5),
      },
    },
    biography: {
      display: 'inline-block',
      wordBreak: 'break-word',
      cursor: 'pointer',
      minHeight: '3em',
    },
    externalLinks: {
      padding: theme.spacing(0, 4, 1, 4),
      [theme.breakpoints.up('md')]: {
        padding: theme.spacing(0, 5, 1, 5),
      },
    },
    rating: {
      marginTop: theme.spacing(0.5),
    },
  }),
  { name: 'NDDesktopArtistDetails' },
)

const DesktopArtistDetails = ({ artistInfo, record, biography }) => {
  const [expanded, setExpanded] = useState(false)
  const classes = useStyles()
  const dispatch = useDispatch()
  const dataProvider = useDataProvider()
  const [isLightboxOpen, setLightboxOpen] = useState(false)
  const [imageLoading, setImageLoading] = useState(true)
  const [imageError, setImageError] = useState(false)

  React.useEffect(() => {
    setImageLoading(true)
    setImageError(false)
  }, [record.id])

  const handleImageLoad = useCallback(() => {
    setImageLoading(false)
    setImageError(false)
  }, [])

  const handleImageError = useCallback(() => {
    setImageLoading(false)
    setImageError(true)
  }, [])

  const handleOpenLightbox = useCallback(() => {
    if (!imageError) setLightboxOpen(true)
  }, [imageError])

  const handleCloseLightbox = useCallback(() => setLightboxOpen(false), [])

  const fetchArtistSongs = useCallback(() => {
    return dataProvider
      .getList('song', {
        pagination: { page: 1, perPage: -1 },
        sort: { field: 'album', order: 'ASC' },
        filter: { artist_id: record.id },
      })
      .then((response) => {
        const data = response.data.reduce(
          (acc, cur) => ({ ...acc, [cur.id]: cur }),
          {},
        )
        const ids = response.data.map((r) => r.id)
        return { data, ids }
      })
  }, [dataProvider, record.id])

  const handlePlayAll = useCallback(() => {
    fetchArtistSongs()
      .then(({ data, ids }) => dispatch(playTracks(data, ids)))
      .catch((e) => console.error('Failed to play artist songs:', e)) // eslint-disable-line no-console
  }, [fetchArtistSongs, dispatch])

  const handleShuffle = useCallback(() => {
    fetchArtistSongs()
      .then(({ data, ids }) => {
        const shuffled = [...ids]
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1))
          ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
        }
        dispatch(playTracks(data, shuffled))
      })
      .catch((e) => console.error('Failed to shuffle artist songs:', e)) // eslint-disable-line no-console
  }, [fetchArtistSongs, dispatch])

  const coverUrl = subsonic.getCoverArtUrl(record, 400)
  const albumCount = record?.stats?.['maincredit']?.albumCount || record.albumCount || 0
  const songCount = record?.stats?.['maincredit']?.songCount || record.songCount || 0

  return (
    <>
      <div className={classes.heroWrapper}>
        <img
          src={coverUrl}
          alt=""
          className={classes.heroBg}
        />
        <div className={classes.heroOverlay} />
        <div className={classes.heroContent}>
          <img
            key={record.id}
            src={coverUrl}
            alt={record.name}
            className={`${classes.artistAvatar} ${imageLoading ? classes.avatarLoading : ''}`}
            onClick={handleOpenLightbox}
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{ cursor: imageError ? 'default' : 'pointer' }}
          />
          <div className={classes.heroInfo}>
            <Typography className={classes.artistName}>
              {record.name}
            </Typography>
            <Typography className={classes.statsLine}>
              {albumCount > 0 && `${albumCount} albums`}
              {albumCount > 0 && songCount > 0 && ' · '}
              {songCount > 0 && `${songCount} songs`}
            </Typography>
            {config.enableStarRating && (
              <RatingField
                record={record}
                resource={'artist'}
                size={'small'}
                className={classes.rating}
              />
            )}
            <div className={classes.actionRow}>
              <Button
                variant="contained"
                color="primary"
                className={classes.playAllButton}
                startIcon={<PlayArrowIcon />}
                onClick={handlePlayAll}
              >
                Play All
              </Button>
              <Button
                variant="outlined"
                className={classes.shuffleButton}
                startIcon={<ShuffleIcon />}
                onClick={handleShuffle}
              >
                Shuffle
              </Button>
              <LoveButton
                className={classes.loveButton}
                record={record}
                resource={'artist'}
                size={'default'}
                color="inherit"
              />
            </div>
          </div>
        </div>
      </div>

      {biography && (
        <div className={classes.bioSection}>
          <Collapse
            collapsedHeight={'3em'}
            in={expanded}
            timeout={'auto'}
            className={classes.biography}
          >
            <Typography
              variant={'body2'}
              onClick={() => setExpanded(!expanded)}
            >
              <SafeHTML>{biography}</SafeHTML>
            </Typography>
          </Collapse>
        </div>
      )}

      <SimilarArtists record={record} />

      {config.enableExternalServices && (
        <div className={classes.externalLinks}>
          <ArtistExternalLinks artistInfo={artistInfo} record={record} />
        </div>
      )}

      {isLightboxOpen && !imageError && (
        <Lightbox
          imagePadding={50}
          animationDuration={200}
          imageTitle={record.name}
          mainSrc={subsonic.getCoverArtUrl(record)}
          onCloseRequest={handleCloseLightbox}
        />
      )}
      <ExpandInfoDialog content={<AlbumInfo />} />
    </>
  )
}

export default DesktopArtistDetails
