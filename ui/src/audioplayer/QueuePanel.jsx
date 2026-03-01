import React, { useCallback } from 'react'
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
  makeStyles,
} from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import DeleteIcon from '@material-ui/icons/Delete'
import { syncQueue } from '../actions'

const DRAWER_WIDTH = 350

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
    nowPlayingSection: {
      padding: theme.spacing(1, 2, 2, 2),
    },
    nowPlayingInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: theme.spacing(1.5),
    },
    nowPlayingCover: {
      width: 56,
      height: 56,
      borderRadius: 4,
    },
    nowPlayingText: {
      overflow: 'hidden',
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
    sectionLabel: {
      padding: theme.spacing(1, 2, 0.5, 2),
      fontWeight: 600,
      color: theme.palette.text.secondary,
      textTransform: 'uppercase',
      fontSize: '0.75rem',
      letterSpacing: '0.08em',
    },
    listItem: {
      paddingRight: theme.spacing(6),
      paddingTop: theme.spacing(0.75),
      paddingBottom: theme.spacing(0.75),
      cursor: 'pointer',
      '&:hover': {
        backgroundColor: theme.palette.action.hover,
      },
    },
    avatar: {
      width: 48,
      height: 48,
      borderRadius: 4,
      marginRight: theme.spacing(0.5),
    },
    trackTitle: {
      fontSize: '14px',
      color: theme.palette.type === 'dark' ? '#eee' : 'black',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    trackArtist: {
      fontSize: '12px',
      color: theme.palette.type === 'dark' ? '#c5c5c5' : '#696969',
    },
    emptyMessage: {
      padding: theme.spacing(4, 2),
      textAlign: 'center',
      color: theme.palette.text.secondary,
    },
  }),
  { name: 'NDQueuePanel' },
)

const QueuePanel = ({ open, onClose }) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const queue = useSelector((state) => state.player.queue)
  const current = useSelector((state) => state.player.current)

  const currentIndex = queue.findIndex((item) => item.uuid === current?.uuid)

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
      const audio = document.querySelector('audio')
      if (!audio) return
      const idx = queue.findIndex((q) => q.uuid === item.uuid)
      if (idx >= 0) {
        const event = new CustomEvent('playByIndex', { detail: idx })
        window.dispatchEvent(event)
      }
    },
    [queue],
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
        <Typography variant="h6">Queue</Typography>
        <IconButton size="small" onClick={onClose}>
          <CloseIcon />
        </IconButton>
      </div>

      <Divider />

      {currentTrack && (
        <>
          <Typography className={classes.sectionLabel}>Now Playing</Typography>
          <div className={classes.nowPlayingSection}>
            <div className={classes.nowPlayingInfo}>
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
            {upNext.map((item) => (
              <ListItem
                key={item.uuid}
                className={classes.listItem}
                onClick={() => handleTrackClick(item)}
              >
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
                    <Typography className={classes.trackTitle}>
                      {item.name}
                    </Typography>
                  }
                  secondary={
                    <span className={classes.trackArtist}>{item.singer}</span>
                  }
                />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    size="small"
                    onClick={(e) => handleRemoveTrack(e, item.uuid)}
                    aria-label="remove"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
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
