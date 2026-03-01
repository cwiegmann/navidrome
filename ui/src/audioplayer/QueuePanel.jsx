import React, { useCallback, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Drawer,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Typography,
  Divider,
  Button,
  makeStyles,
} from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import DeleteIcon from '@material-ui/icons/Delete'
import DragIndicatorIcon from '@material-ui/icons/DragIndicator'
import { useDrag, useDrop } from 'react-dnd'
import { syncQueue, clearQueue } from '../actions'

const DRAWER_WIDTH = 350
const QUEUE_ITEM_TYPE = 'QUEUE_TRACK'

const useStyles = makeStyles(
  (theme) => ({
    drawer: {
      width: DRAWER_WIDTH,
      flexShrink: 0,
    },
    drawerPaper: {
      width: DRAWER_WIDTH,
      backgroundColor: theme.palette.background.default,
      paddingBottom: 100,
    },
    header: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: theme.spacing(1.5, 2),
    },
    headerLeft: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1.5),
    },
    clearButton: {
      textTransform: 'none',
      fontSize: '0.8rem',
      color: theme.palette.text.secondary,
      minWidth: 'auto',
      padding: theme.spacing(0.25, 1),
      '&:hover': {
        color: theme.palette.error.main,
      },
    },
    nowPlayingSection: {
      padding: theme.spacing(1, 2, 1.5, 2),
    },
    nowPlayingCard: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1.5),
      padding: theme.spacing(1),
      borderRadius: 8,
      borderLeft: `3px solid ${theme.palette.primary.main}`,
      backgroundColor:
        theme.palette.type === 'dark'
          ? 'rgba(255,255,255,0.04)'
          : 'rgba(0,0,0,0.02)',
    },
    nowPlayingCover: {
      width: 56,
      height: 56,
      borderRadius: 6,
      flexShrink: 0,
    },
    nowPlayingText: {
      overflow: 'hidden',
      flex: 1,
      minWidth: 0,
    },
    nowPlayingTitle: {
      fontWeight: 600,
      fontSize: '14px',
      color: theme.palette.type === 'dark' ? '#eee' : 'black',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    nowPlayingArtist: {
      fontSize: '12px',
      color: theme.palette.type === 'dark' ? '#c5c5c5' : '#696969',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    equalizer: {
      display: 'flex',
      alignItems: 'flex-end',
      gap: 2,
      height: 16,
      flexShrink: 0,
    },
    eqBar: {
      width: 3,
      backgroundColor: theme.palette.primary.main,
      borderRadius: 1,
      animation: '$eqBounce 0.8s ease-in-out infinite alternate',
    },
    eqBar1: { height: 8, animationDelay: '0s' },
    eqBar2: { height: 14, animationDelay: '0.2s' },
    eqBar3: { height: 6, animationDelay: '0.4s' },
    eqBar4: { height: 12, animationDelay: '0.1s' },
    '@keyframes eqBounce': {
      '0%': { height: 4 },
      '100%': { height: 16 },
    },
    sectionLabel: {
      padding: theme.spacing(1.5, 2, 0.5, 2),
      fontWeight: 600,
      color: theme.palette.text.secondary,
      textTransform: 'uppercase',
      fontSize: '0.7rem',
      letterSpacing: '0.08em',
    },
    listItem: {
      paddingRight: theme.spacing(6),
      paddingTop: theme.spacing(0.5),
      paddingBottom: theme.spacing(0.5),
      paddingLeft: theme.spacing(1),
      cursor: 'grab',
      transition: 'background-color 150ms ease',
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
      },
      '&:hover $removeButton': {
        opacity: 1,
      },
    },
    listItemDragging: {
      opacity: 0.4,
      backgroundColor: theme.palette.action.selected,
    },
    listItemOver: {
      borderTop: `2px solid ${theme.palette.primary.main}`,
    },
    avatar: {
      width: 44,
      height: 44,
      borderRadius: 6,
      marginRight: theme.spacing(0.5),
    },
    trackTitle: {
      fontSize: '13px',
      color: theme.palette.type === 'dark' ? '#eee' : 'black',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    trackArtist: {
      fontSize: '11px',
      color: theme.palette.type === 'dark' ? '#c5c5c5' : '#696969',
    },
    dragHandle: {
      color: theme.palette.text.secondary,
      cursor: 'grab',
      marginRight: theme.spacing(0.5),
      opacity: 0.3,
      fontSize: '1.1rem',
      transition: 'opacity 150ms ease',
      '&:hover': {
        opacity: 0.8,
      },
    },
    duration: {
      fontSize: '11px',
      color: theme.palette.text.secondary,
      marginRight: theme.spacing(3),
    },
    removeButton: {
      opacity: 0,
      transition: 'opacity 150ms ease',
    },
    emptyMessage: {
      padding: theme.spacing(4, 2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
    },
  }),
  { name: 'NDQueuePanel' },
)

const formatDuration = (seconds) => {
  if (!seconds || isNaN(seconds)) return ''
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const Equalizer = ({ classes }) => (
  <div className={classes.equalizer}>
    <div className={`${classes.eqBar} ${classes.eqBar1}`} />
    <div className={`${classes.eqBar} ${classes.eqBar2}`} />
    <div className={`${classes.eqBar} ${classes.eqBar3}`} />
    <div className={`${classes.eqBar} ${classes.eqBar4}`} />
  </div>
)

const DraggableQueueItem = ({
  item,
  index,
  classes,
  onTrackClick,
  onRemoveTrack,
  onMoveTrack,
}) => {
  const ref = useRef(null)

  const [{ isDragging }, drag] = useDrag({
    type: QUEUE_ITEM_TYPE,
    item: () => ({ index, uuid: item.uuid }),
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  })

  const [{ isOver }, drop] = useDrop({
    accept: QUEUE_ITEM_TYPE,
    hover(draggedItem, monitor) {
      if (!ref.current) return
      const dragIndex = draggedItem.index
      const hoverIndex = index
      if (dragIndex === hoverIndex) return

      const hoverBoundingRect = ref.current.getBoundingClientRect()
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
      const clientOffset = monitor.getClientOffset()
      const hoverClientY = clientOffset.y - hoverBoundingRect.top

      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) return
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) return

      onMoveTrack(dragIndex, hoverIndex)
      draggedItem.index = hoverIndex
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  })

  drag(drop(ref))

  return (
    <ListItem
      ref={ref}
      className={`${classes.listItem} ${isDragging ? classes.listItemDragging : ''} ${isOver ? classes.listItemOver : ''}`}
      onClick={() => onTrackClick(item)}
    >
      <DragIndicatorIcon className={classes.dragHandle} />
      <ListItemAvatar>
        <Avatar
          variant="square"
          src={item.cover}
          className={classes.avatar}
          alt={item.name}
        />
      </ListItemAvatar>
      <ListItemText
        primary={
          <Typography className={classes.trackTitle}>{item.name}</Typography>
        }
        secondary={
          <span className={classes.trackArtist}>{item.singer}</span>
        }
      />
      <span className={classes.duration}>
        {formatDuration(item.duration)}
      </span>
      <ListItemSecondaryAction>
        <IconButton
          edge="end"
          size="small"
          className={classes.removeButton}
          onClick={(e) => onRemoveTrack(e, item.uuid)}
          aria-label="remove"
        >
          <DeleteIcon fontSize="small" />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  )
}

const QueuePanel = ({ open, onClose }) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const queue = useSelector((state) => state.player.queue)
  const current = useSelector((state) => state.player.current)

  const currentIndex = queue.findIndex((item) => item.uuid === current?.uuid)

  const handleClearQueue = useCallback(() => {
    dispatch(clearQueue())
    onClose()
  }, [dispatch, onClose])

  const handleRemoveTrack = useCallback(
    (e, uuid) => {
      e.stopPropagation()
      const newQueue = queue.filter((item) => item.uuid !== uuid)
      dispatch(syncQueue(current, newQueue))
    },
    [queue, current, dispatch],
  )

  const handleTrackClick = useCallback(
    (item) => {
      const idx = queue.findIndex((q) => q.uuid === item.uuid)
      if (idx >= 0) {
        const event = new CustomEvent('playByIndex', { detail: idx })
        window.dispatchEvent(event)
      }
    },
    [queue],
  )

  const handleMoveTrack = useCallback(
    (fromUpNextIndex, toUpNextIndex) => {
      const fromQueueIndex = currentIndex + 1 + fromUpNextIndex
      const toQueueIndex = currentIndex + 1 + toUpNextIndex

      const newQueue = [...queue]
      const [moved] = newQueue.splice(fromQueueIndex, 1)
      newQueue.splice(toQueueIndex, 0, moved)
      dispatch(syncQueue(current, newQueue))
    },
    [queue, current, currentIndex, dispatch],
  )

  const upNext = queue.slice(currentIndex + 1)
  const currentTrack = currentIndex >= 0 ? queue[currentIndex] : null

  return (
    <Drawer
      className={classes.drawer}
      variant="persistent"
      anchor="right"
      open={open}
      classes={{ paper: classes.drawerPaper }}
    >
      <div className={classes.header}>
        <div className={classes.headerLeft}>
          <Typography variant="h6">Queue</Typography>
          {queue.length > 0 && (
            <Button
              className={classes.clearButton}
              onClick={handleClearQueue}
              size="small"
            >
              Clear
            </Button>
          )}
        </div>
        <IconButton size="small" onClick={onClose} aria-label="close queue">
          <CloseIcon />
        </IconButton>
      </div>

      <Divider />

      {currentTrack && (
        <>
          <Typography className={classes.sectionLabel}>Now Playing</Typography>
          <div className={classes.nowPlayingSection}>
            <div className={classes.nowPlayingCard}>
              <Avatar
                variant="square"
                src={currentTrack.cover}
                className={classes.nowPlayingCover}
                alt={currentTrack.name}
              />
              <div className={classes.nowPlayingText}>
                <Typography className={classes.nowPlayingTitle}>
                  {currentTrack.name}
                </Typography>
                <Typography className={classes.nowPlayingArtist}>
                  {currentTrack.singer}
                </Typography>
              </div>
              <Equalizer classes={classes} />
            </div>
          </div>
          <Divider />
        </>
      )}

      {upNext.length > 0 ? (
        <>
          <Typography className={classes.sectionLabel}>
            Next Up &middot; {upNext.length}
          </Typography>
          <List dense>
            {upNext.map((item, index) => (
              <DraggableQueueItem
                key={item.uuid}
                item={item}
                index={index}
                classes={classes}
                onTrackClick={handleTrackClick}
                onRemoveTrack={handleRemoveTrack}
                onMoveTrack={handleMoveTrack}
              />
            ))}
          </List>
        </>
      ) : (
        <Typography className={classes.emptyMessage}>
          {queue.length === 0
            ? 'Queue is empty'
            : 'No more tracks in queue'}
        </Typography>
      )}
    </Drawer>
  )
}

export default QueuePanel
