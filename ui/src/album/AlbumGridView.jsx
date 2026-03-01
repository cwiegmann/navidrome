import React, { useCallback } from 'react'
import {
  GridList,
  GridListTile,
  Typography,
  useMediaQuery,
  IconButton,
} from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'
import withWidth from '@material-ui/core/withWidth'
import { Link } from 'react-router-dom'
import {
  linkToRecord,
  useListContext,
  useDataProvider,
  Loading,
} from 'react-admin'
import { withContentRect } from 'react-measure'
import { useDrag } from 'react-dnd'
import { useDispatch } from 'react-redux'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder'
import FavoriteIcon from '@material-ui/icons/Favorite'
import QueueMusicIcon from '@material-ui/icons/QueueMusic'
import subsonic from '../subsonic'
import { AlbumContextMenu, ArtistLinkField, useToggleLove } from '../common'
import { DraggableTypes } from '../consts'
import { playTracks, addTracks } from '../actions'
import clsx from 'clsx'
import { AlbumDatesField } from './AlbumDatesField.jsx'

const useStyles = makeStyles(
  (theme) => ({
    root: {
      margin: '20px',
      display: 'grid',
    },
    albumContainer: {
      borderRadius: 6,
      position: 'relative',
    },
    coverWrapper: {
      position: 'relative',
      display: 'block',
      textDecoration: 'none',
      borderRadius: 6,
      overflow: 'hidden',
      '&:hover $overlay': {
        opacity: 1,
      },
      '&:hover $playButtonCenter': {
        opacity: 1,
        transform: 'translate(-50%, -50%) scale(1)',
      },
      '&:hover $hoverActions': {
        opacity: 1,
      },
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.45)',
      opacity: 0,
      transition: 'opacity 200ms ease',
      borderRadius: 6,
      pointerEvents: 'none',
    },
    playButtonCenter: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%) scale(0.8)',
      width: 48,
      height: 48,
      backgroundColor: theme.palette.primary.main,
      color: '#fff',
      opacity: 0,
      transition: 'all 200ms ease',
      zIndex: 2,
      '&:hover': {
        backgroundColor: theme.palette.primary.dark,
        transform: 'translate(-50%, -50%) scale(1.1)',
      },
    },
    hoverActions: {
      position: 'absolute',
      bottom: 8,
      right: 8,
      display: 'flex',
      gap: 4,
      opacity: 0,
      transition: 'opacity 200ms ease',
      zIndex: 2,
    },
    hoverActionButton: {
      color: '#fff',
      backgroundColor: 'rgba(0,0,0,0.5)',
      padding: 5,
      '&:hover': {
        backgroundColor: 'rgba(0,0,0,0.75)',
      },
    },
    mobileActions: {
      position: 'absolute',
      bottom: 4,
      right: 4,
      zIndex: 2,
    },
    albumLink: {
      position: 'relative',
      display: 'block',
      textDecoration: 'none',
    },
    albumName: {
      fontSize: '14px',
      color: theme.palette.type === 'dark' ? '#eee' : 'black',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      textOverflow: 'ellipsis',
      marginTop: 4,
    },
    missingAlbum: {
      opacity: 0.3,
    },
    albumVersion: {
      fontSize: '12px',
      color: theme.palette.type === 'dark' ? '#c5c5c5' : '#696969',
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
  }),
  { name: 'NDAlbumGridView' },
)

const useCoverStyles = makeStyles({
  cover: {
    display: 'inline-block',
    width: '100%',
    objectFit: 'contain',
    height: (props) => props.height,
    transition: 'opacity 0.3s ease-in-out',
    borderRadius: 6,
  },
  coverLoading: {
    opacity: 0.5,
  },
})

const getColsForWidth = (width) => {
  if (width === 'xs') return 2
  if (width === 'sm') return 3
  if (width === 'md') return 4
  if (width === 'lg') return 6
  return 9
}

const Cover = withContentRect('bounds')(({
  record,
  measureRef,
  contentRect,
}) => {
  const classes = useCoverStyles({ height: contentRect.bounds.width })
  const [imageLoading, setImageLoading] = React.useState(true)
  const [, setImageError] = React.useState(false)
  const [, dragAlbumRef] = useDrag(
    () => ({
      type: DraggableTypes.ALBUM,
      item: { albumIds: [record.id] },
      options: { dropEffect: 'copy' },
    }),
    [record],
  )

  React.useEffect(() => {
    setImageLoading(true)
    setImageError(false)
  }, [record.id])

  const handleImageLoad = React.useCallback(() => {
    setImageLoading(false)
    setImageError(false)
  }, [])

  const handleImageError = React.useCallback(() => {
    setImageLoading(false)
    setImageError(true)
  }, [])

  return (
    <div ref={measureRef}>
      <div ref={dragAlbumRef}>
        <img
          key={record.id}
          src={subsonic.getCoverArtUrl(record, 300, true)}
          alt={record.name}
          className={`${classes.cover} ${imageLoading ? classes.coverLoading : ''}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      </div>
    </div>
  )
})

const extractSongsData = (response) => {
  const data = response.data.reduce(
    (acc, cur) => ({ ...acc, [cur.id]: cur }),
    {},
  )
  const ids = response.data.map((r) => r.id)
  return { data, ids }
}

const AlbumGridTile = ({ showArtist, record, basePath }) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const dataProvider = useDataProvider()
  const isDesktop = useMediaQuery((theme) => theme.breakpoints.up('md'), {
    noSsr: true,
  })
  const [toggleLove] = useToggleLove('album', record)

  const handlePlay = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      dataProvider
        .getList('song', {
          pagination: { page: 1, perPage: -1 },
          sort: { field: 'album', order: 'ASC' },
          filter: { album_id: record.id },
        })
        .then((response) => {
          const { data, ids } = extractSongsData(response)
          dispatch(playTracks(data, ids))
        })
    },
    [dataProvider, dispatch, record.id],
  )

  const handleAddToQueue = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      dataProvider
        .getList('song', {
          pagination: { page: 1, perPage: -1 },
          sort: { field: 'album', order: 'ASC' },
          filter: { album_id: record.id },
        })
        .then((response) => {
          const { data, ids } = extractSongsData(response)
          dispatch(addTracks(data, ids))
        })
    },
    [dataProvider, dispatch, record.id],
  )

  const handleLove = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      toggleLove()
    },
    [toggleLove],
  )

  if (!record) {
    return null
  }

  const computedClasses = clsx(
    classes.albumContainer,
    record.missing && classes.missingAlbum,
  )

  return (
    <div className={computedClasses}>
      <Link
        className={classes.coverWrapper}
        to={linkToRecord(basePath, record.id, 'show')}
      >
        <Cover record={record} />
        {!record.missing && (
          isDesktop ? (
            <>
              <div className={classes.overlay} />
              <IconButton
                className={classes.playButtonCenter}
                onClick={handlePlay}
                size="small"
                aria-label="play album"
              >
                <PlayArrowIcon style={{ fontSize: 28 }} />
              </IconButton>
              <div className={classes.hoverActions}>
                <IconButton
                  className={classes.hoverActionButton}
                  onClick={handleLove}
                  size="small"
                  aria-label="love"
                >
                  {record.starred ? (
                    <FavoriteIcon style={{ fontSize: 16 }} />
                  ) : (
                    <FavoriteBorderIcon style={{ fontSize: 16 }} />
                  )}
                </IconButton>
                <IconButton
                  className={classes.hoverActionButton}
                  onClick={handleAddToQueue}
                  size="small"
                  aria-label="add to queue"
                >
                  <QueueMusicIcon style={{ fontSize: 16 }} />
                </IconButton>
                <AlbumContextMenu record={record} color={'white'} size="small" />
              </div>
            </>
          ) : (
            <div className={classes.mobileActions}>
              <AlbumContextMenu record={record} color={'white'} />
            </div>
          )
        )}
      </Link>
      <Link
        className={classes.albumLink}
        to={linkToRecord(basePath, record.id, 'show')}
      >
        <span>
          <Typography className={classes.albumName}>{record.name}</Typography>
          {record.tags && record.tags['albumversion'] && (
            <Typography className={classes.albumVersion}>
              {record.tags['albumversion']}
            </Typography>
          )}
        </span>
      </Link>
      {showArtist ? (
        <ArtistLinkField record={record} className={classes.albumSubtitle} />
      ) : (
        <AlbumDatesField record={record} className={classes.albumSubtitle} />
      )}
    </div>
  )
}

const LoadedAlbumGrid = ({ ids, data, basePath, width }) => {
  const classes = useStyles()
  const { filterValues } = useListContext()
  const isArtistView = !!(filterValues && filterValues.artist_id)
  return (
    <div className={classes.root}>
      <GridList
        component={'div'}
        cellHeight={'auto'}
        cols={getColsForWidth(width)}
        spacing={20}
      >
        {ids
          .filter((id) => data[id])
          .map((id) => (
            <GridListTile key={id}>
              <AlbumGridTile
                record={data[id]}
                basePath={basePath}
                showArtist={!isArtistView}
              />
            </GridListTile>
          ))}
      </GridList>
    </div>
  )
}

const AlbumGridView = ({ albumListType, loaded, loading, ...props }) => {
  const hide =
    (loading && albumListType === 'random') || !props.data || !props.ids
  return hide ? <Loading /> : <LoadedAlbumGrid {...props} />
}

const AlbumGridViewWithWidth = withWidth()(AlbumGridView)

export default AlbumGridViewWithWidth
