import React, { useState, useEffect, useCallback } from 'react'
import { useSelector } from 'react-redux'
import {
  Typography,
  IconButton,
  Avatar,
  Tooltip,
  LinearProgress,
  makeStyles,
  Snackbar,
} from '@material-ui/core'
import CloudDownloadIcon from '@material-ui/icons/CloudDownload'
import CloudDoneIcon from '@material-ui/icons/CloudDone'
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline'
import CloudOffIcon from '@material-ui/icons/CloudOff'
import Alert from '@material-ui/lab/Alert'

const DB_NAME = 'navidrome-offline-queue'
const DB_VERSION = 1
const STORE_NAME = 'tracks'

const openDB = () =>
  new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)
    request.onupgradeneeded = (e) => {
      const db = e.target.result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'trackId' })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })

const saveTrack = async (trackId, blob, meta) => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put({ trackId, blob, meta, cachedAt: Date.now() })
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

const deleteTrack = async (trackId) => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(trackId)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

const getAllTracks = async () => {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const request = tx.objectStore(STORE_NAME).getAll()
    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
}

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
    maxWidth: 800,
  },
  pageTitle: {
    fontWeight: 700,
    fontSize: '1.75rem',
    marginBottom: theme.spacing(0.5),
  },
  subtitle: {
    color: theme.palette.text.secondary,
    marginBottom: theme.spacing(3),
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  cacheSize: {
    fontSize: '0.85rem',
    color: theme.palette.text.secondary,
  },
  trackList: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(0.5),
  },
  track: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1.5),
    padding: theme.spacing(1),
    borderRadius: 8,
    transition: 'background-color 150ms ease',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
  cover: {
    width: 40,
    height: 40,
    borderRadius: 4,
  },
  info: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: '0.9rem',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  artist: {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
  },
  status: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(0.5),
  },
  cachedIcon: {
    color: theme.palette.success.main || '#4caf50',
    fontSize: '1.2rem',
  },
  progress: {
    width: 80,
    borderRadius: 4,
  },
  emptyState: {
    padding: theme.spacing(6),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
  emptyIcon: {
    fontSize: '3rem',
    color: theme.palette.text.hint,
    marginBottom: theme.spacing(1),
  },
  downloadBtn: {
    borderRadius: 20,
    fontWeight: 600,
    textTransform: 'none',
  },
}))

const formatSize = (bytes) => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const OfflineQueue = () => {
  const classes = useStyles()
  const queue = useSelector((state) => state.player?.queue ?? [])
  const [cached, setCached] = useState({})
  const [downloading, setDownloading] = useState({})
  const [snack, setSnack] = useState(null)

  const loadCached = useCallback(async () => {
    try {
      const tracks = await getAllTracks()
      const map = {}
      tracks.forEach((t) => {
        map[t.trackId] = { size: t.blob?.size || 0, cachedAt: t.cachedAt }
      })
      setCached(map)
    } catch (e) {
      setCached({})
    }
  }, [])

  useEffect(() => {
    loadCached()
  }, [loadCached])

  const handleDownload = useCallback(
    async (item) => {
      if (cached[item.trackId] || downloading[item.trackId]) return
      setDownloading((prev) => ({ ...prev, [item.trackId]: 0 }))

      try {
        const response = await fetch(item.musicSrc)
        const reader = response.body?.getReader()
        const contentLength = +response.headers.get('Content-Length') || 0
        const chunks = []
        let received = 0

        if (reader) {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            chunks.push(value)
            received += value.length
            if (contentLength > 0) {
              setDownloading((prev) => ({
                ...prev,
                [item.trackId]: Math.round((received / contentLength) * 100),
              }))
            }
          }
        }

        const blob = new Blob(chunks)
        await saveTrack(item.trackId, blob, {
          name: item.name,
          singer: item.singer,
          cover: item.cover,
          duration: item.duration,
        })

        setDownloading((prev) => {
          const next = { ...prev }
          delete next[item.trackId]
          return next
        })
        setCached((prev) => ({
          ...prev,
          [item.trackId]: { size: blob.size, cachedAt: Date.now() },
        }))
        setSnack({ severity: 'success', message: `Cached "${item.name}"` })
      } catch (err) {
        setDownloading((prev) => {
          const next = { ...prev }
          delete next[item.trackId]
          return next
        })
        setSnack({
          severity: 'error',
          message: `Failed to cache "${item.name}"`,
        })
      }
    },
    [cached, downloading],
  )

  const handleDelete = useCallback(async (trackId, name) => {
    try {
      await deleteTrack(trackId)
      setCached((prev) => {
        const next = { ...prev }
        delete next[trackId]
        return next
      })
      setSnack({ severity: 'info', message: `Removed "${name}"` })
    } catch (e) {
      setSnack({ severity: 'error', message: 'Failed to remove track' })
    }
  }, [])

  const totalSize = Object.values(cached).reduce((a, c) => a + (c.size || 0), 0)

  return (
    <div className={classes.root}>
      <Typography className={classes.pageTitle}>Offline Queue</Typography>
      <Typography className={classes.subtitle}>
        Cache your current queue for offline listening
      </Typography>

      <div className={classes.toolbar}>
        <Typography className={classes.cacheSize}>
          {Object.keys(cached).length} tracks cached &middot;{' '}
          {formatSize(totalSize)}
        </Typography>
      </div>

      {queue.length === 0 ? (
        <div className={classes.emptyState}>
          <CloudOffIcon className={classes.emptyIcon} />
          <Typography>Your queue is empty. Add some music first!</Typography>
        </div>
      ) : (
        <div className={classes.trackList}>
          {queue.map((item) => {
            const isCached = !!cached[item.trackId]
            const dlProgress = downloading[item.trackId]
            const isDownloading = dlProgress !== undefined

            return (
              <div key={item.uuid} className={classes.track}>
                <Avatar
                  variant="square"
                  src={item.cover}
                  className={classes.cover}
                  alt={item.name}
                />
                <div className={classes.info}>
                  <Typography className={classes.title}>{item.name}</Typography>
                  <Typography className={classes.artist}>
                    {item.singer}
                  </Typography>
                </div>
                <div className={classes.status}>
                  {isCached && (
                    <>
                      <CloudDoneIcon className={classes.cachedIcon} />
                      <Tooltip title="Remove from cache">
                        <IconButton
                          size="small"
                          onClick={() =>
                            handleDelete(item.trackId, item.name)
                          }
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                  {isDownloading && (
                    <LinearProgress
                      variant="determinate"
                      value={dlProgress}
                      className={classes.progress}
                    />
                  )}
                  {!isCached && !isDownloading && (
                    <Tooltip title="Cache for offline">
                      <IconButton
                        size="small"
                        onClick={() => handleDownload(item)}
                      >
                        <CloudDownloadIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      <Snackbar
        open={!!snack}
        autoHideDuration={3000}
        onClose={() => setSnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {snack && (
          <Alert
            onClose={() => setSnack(null)}
            severity={snack.severity}
            variant="filled"
            elevation={6}
          >
            {snack.message}
          </Alert>
        )}
      </Snackbar>
    </div>
  )
}

export default OfflineQueue
