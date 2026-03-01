import React, { useEffect, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import {
  Dialog,
  IconButton,
  Typography,
  Slider,
  makeStyles,
} from '@material-ui/core'
import CloseIcon from '@material-ui/icons/Close'
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious'
import SkipNextIcon from '@material-ui/icons/SkipNext'
import PlayArrowIcon from '@material-ui/icons/PlayArrow'
import PauseIcon from '@material-ui/icons/Pause'
import ShuffleIcon from '@material-ui/icons/Shuffle'
import RepeatIcon from '@material-ui/icons/Repeat'
import RepeatOneIcon from '@material-ui/icons/RepeatOne'
import FavoriteIcon from '@material-ui/icons/Favorite'
import FavoriteBorderIcon from '@material-ui/icons/FavoriteBorder'
import VolumeUpIcon from '@material-ui/icons/VolumeUp'
import VolumeDownIcon from '@material-ui/icons/VolumeDown'
import QueueMusicIcon from '@material-ui/icons/QueueMusic'
import subsonic from '../subsonic'

const useStyles = makeStyles((theme) => ({
  root: {
    '& .MuiDialog-paper': {
      margin: 0,
      maxWidth: '100%',
      maxHeight: '100%',
      width: '100%',
      height: '100%',
      borderRadius: 0,
      overflow: 'hidden',
      backgroundColor: 'transparent',
    },
    '& .MuiBackdrop-root': {
      backgroundColor: 'rgba(0,0,0,0.95)',
    },
  },
  container: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 1,
  },
  bgImage: {
    position: 'absolute',
    top: '-10%',
    left: '-10%',
    width: '120%',
    height: '120%',
    objectFit: 'cover',
    filter: 'blur(60px) brightness(0.3) saturate(1.5)',
    zIndex: 0,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    color: 'rgba(255,255,255,0.7)',
    zIndex: 2,
    '&:hover': {
      color: '#fff',
    },
  },
  artwork: {
    width: 320,
    height: 320,
    borderRadius: 12,
    objectFit: 'cover',
    boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
    marginBottom: theme.spacing(4),
    [theme.breakpoints.up('md')]: {
      width: 400,
      height: 400,
    },
  },
  songInfo: {
    textAlign: 'center',
    maxWidth: 500,
    marginBottom: theme.spacing(3),
  },
  songTitle: {
    color: '#fff',
    fontWeight: 700,
    fontSize: '1.5rem',
    lineHeight: 1.3,
    [theme.breakpoints.up('md')]: {
      fontSize: '1.8rem',
    },
  },
  songArtist: {
    color: 'rgba(255,255,255,0.65)',
    fontSize: '1rem',
    marginTop: 4,
    [theme.breakpoints.up('md')]: {
      fontSize: '1.1rem',
    },
  },
  songAlbum: {
    color: 'rgba(255,255,255,0.4)',
    fontSize: '0.85rem',
    marginTop: 2,
  },
  progressSection: {
    width: '100%',
    maxWidth: 500,
    marginBottom: theme.spacing(2),
    padding: theme.spacing(0, 2),
  },
  progressSlider: {
    color: '#fff',
    padding: '8px 0',
    '& .MuiSlider-track': {
      height: 4,
      borderRadius: 2,
    },
    '& .MuiSlider-rail': {
      height: 4,
      borderRadius: 2,
      opacity: 0.2,
    },
    '& .MuiSlider-thumb': {
      width: 12,
      height: 12,
      marginTop: -4,
      '&:hover': {
        boxShadow: '0 0 0 8px rgba(255,255,255,0.1)',
      },
    },
  },
  timeRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: -4,
  },
  time: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '0.75rem',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },
  controlButton: {
    color: 'rgba(255,255,255,0.65)',
    '&:hover': {
      color: '#fff',
    },
  },
  controlButtonActive: {
    color: theme.palette.primary.main,
  },
  playButton: {
    width: 56,
    height: 56,
    backgroundColor: '#fff',
    color: '#000',
    '&:hover': {
      backgroundColor: 'rgba(255,255,255,0.9)',
    },
  },
  bottomRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(3),
    width: '100%',
    maxWidth: 500,
    padding: theme.spacing(0, 2),
    justifyContent: 'center',
  },
  volumeControl: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    color: 'rgba(255,255,255,0.5)',
  },
  volumeSlider: {
    width: 100,
    color: 'rgba(255,255,255,0.5)',
    '& .MuiSlider-track': { height: 3 },
    '& .MuiSlider-rail': { height: 3, opacity: 0.2 },
    '& .MuiSlider-thumb': { width: 10, height: 10 },
  },
}))

const formatTime = (seconds) => {
  if (!seconds || isNaN(seconds)) return '0:00'
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const NowPlayingView = ({ open, onClose, onToggleQueue }) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const playerState = useSelector((state) => state.player)
  const current = playerState.current || {}
  const song = current.song || {}
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(playerState.volume || 0.7)
  const [loved, setLoved] = useState(!!song.starred)

  useEffect(() => {
    const audioEl = document.querySelector('audio')
    if (!audioEl) return

    const onTimeUpdate = () => {
      setProgress(audioEl.currentTime)
      setDuration(audioEl.duration || 0)
      setIsPlaying(!audioEl.paused)
    }
    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)

    audioEl.addEventListener('timeupdate', onTimeUpdate)
    audioEl.addEventListener('play', onPlay)
    audioEl.addEventListener('pause', onPause)

    setProgress(audioEl.currentTime)
    setDuration(audioEl.duration || 0)
    setIsPlaying(!audioEl.paused)

    return () => {
      audioEl.removeEventListener('timeupdate', onTimeUpdate)
      audioEl.removeEventListener('play', onPlay)
      audioEl.removeEventListener('pause', onPause)
    }
  }, [open, current.uuid])

  const handlePlayPause = useCallback(() => {
    const audioEl = document.querySelector('audio')
    if (!audioEl) return
    if (audioEl.paused) {
      audioEl.play().catch(() => {})
    } else {
      audioEl.pause()
    }
  }, [])

  const handlePrev = useCallback(() => {
    const btn = document.querySelector('.music-player-controller-setting .prev-audio')
      || document.querySelector('[title="Previous"]')
      || document.querySelector('.prev-audio')
    if (btn) btn.click()
  }, [])

  const handleNext = useCallback(() => {
    const btn = document.querySelector('.music-player-controller-setting .next-audio')
      || document.querySelector('[title="Next"]')
      || document.querySelector('.next-audio')
    if (btn) btn.click()
  }, [])

  const handleSeek = useCallback((_, value) => {
    const audioEl = document.querySelector('audio')
    if (audioEl && !isNaN(value)) {
      audioEl.currentTime = value
    }
  }, [])

  const handleVolume = useCallback((_, value) => {
    const audioEl = document.querySelector('audio')
    if (audioEl) {
      audioEl.volume = value
      setVolume(value)
    }
  }, [])

  const handleToggleShuffle = useCallback(() => {
    const nextMode = playerState.mode === 'shufflePlay' ? 'order' : 'shufflePlay'
    dispatch({ type: 'PLAYER_SET_MODE', data: { mode: nextMode } })
  }, [dispatch, playerState.mode])

  const handleToggleRepeat = useCallback(() => {
    const modes = ['order', 'singleLoop', 'orderLoop']
    const currentIdx = modes.indexOf(playerState.mode)
    const nextMode = modes[(currentIdx + 1) % modes.length]
    dispatch({ type: 'PLAYER_SET_MODE', data: { mode: nextMode } })
  }, [dispatch, playerState.mode])

  const handleToggleFavorite = useCallback(() => {
    if (!song.id) return
    const toggleFn = loved ? subsonic.unstar : subsonic.star
    toggleFn(song.id)
      .then(() => setLoved((prev) => !prev))
      .catch((e) => console.error('Failed to toggle favorite:', e)) // eslint-disable-line no-console
  }, [song.id, loved])

  useEffect(() => {
    setLoved(!!song.starred)
  }, [song.starred, song.id])

  const coverUrl = song.albumId
    ? subsonic.getCoverArtUrl({ id: song.albumId }, 600)
    : current.cover || ''

  return (
    <Dialog open={open} onClose={onClose} fullScreen className={classes.root}>
      {coverUrl && (
        <img src={coverUrl} alt="" className={classes.bgImage} />
      )}
      <div className={classes.container}>
        <IconButton className={classes.closeButton} onClick={onClose}>
          <CloseIcon />
        </IconButton>

        {coverUrl && (
          <img
            src={coverUrl}
            alt={song.title || current.name}
            className={classes.artwork}
          />
        )}

        <div className={classes.songInfo}>
          <Typography className={classes.songTitle}>
            {song.title || current.name || 'Unknown'}
          </Typography>
          <Typography className={classes.songArtist}>
            {song.artist || current.singer || ''}
          </Typography>
          <Typography className={classes.songAlbum}>
            {song.album || ''}
            {song.year ? ` (${song.year})` : ''}
          </Typography>
        </div>

        <div className={classes.progressSection}>
          <Slider
            className={classes.progressSlider}
            value={progress || 0}
            max={duration || 100}
            onChange={handleSeek}
          />
          <div className={classes.timeRow}>
            <Typography className={classes.time}>
              {formatTime(progress)}
            </Typography>
            <Typography className={classes.time}>
              {formatTime(duration)}
            </Typography>
          </div>
        </div>

        <div className={classes.controls}>
          <IconButton
            className={`${classes.controlButton} ${playerState.mode === 'shufflePlay' ? classes.controlButtonActive : ''}`}
            size="small"
            onClick={handleToggleShuffle}
          >
            <ShuffleIcon />
          </IconButton>
          <IconButton
            className={classes.controlButton}
            onClick={handlePrev}
          >
            <SkipPreviousIcon style={{ fontSize: 32 }} />
          </IconButton>
          <IconButton
            className={classes.playButton}
            onClick={handlePlayPause}
          >
            {isPlaying ? (
              <PauseIcon style={{ fontSize: 32 }} />
            ) : (
              <PlayArrowIcon style={{ fontSize: 32 }} />
            )}
          </IconButton>
          <IconButton
            className={classes.controlButton}
            onClick={handleNext}
          >
            <SkipNextIcon style={{ fontSize: 32 }} />
          </IconButton>
          <IconButton
            className={`${classes.controlButton} ${(playerState.mode === 'singleLoop' || playerState.mode === 'orderLoop') ? classes.controlButtonActive : ''}`}
            size="small"
            onClick={handleToggleRepeat}
          >
            {playerState.mode === 'singleLoop' ? (
              <RepeatOneIcon />
            ) : (
              <RepeatIcon />
            )}
          </IconButton>
        </div>

        <div className={classes.bottomRow}>
          <IconButton
            className={classes.controlButton}
            size="small"
            onClick={handleToggleFavorite}
          >
            {loved ? (
              <FavoriteIcon style={{ color: '#f44336' }} />
            ) : (
              <FavoriteBorderIcon style={{ color: 'rgba(255,255,255,0.5)' }} />
            )}
          </IconButton>
          <div className={classes.volumeControl}>
            <VolumeDownIcon style={{ fontSize: 18 }} />
            <Slider
              className={classes.volumeSlider}
              value={volume}
              min={0}
              max={1}
              step={0.01}
              onChange={handleVolume}
            />
            <VolumeUpIcon style={{ fontSize: 18 }} />
          </div>
          <IconButton
            className={classes.controlButton}
            size="small"
            onClick={() => {
              onClose()
              if (onToggleQueue) onToggleQueue()
            }}
          >
            <QueueMusicIcon style={{ color: 'rgba(255,255,255,0.5)' }} />
          </IconButton>
        </div>
      </div>
    </Dialog>
  )
}

export default NowPlayingView
