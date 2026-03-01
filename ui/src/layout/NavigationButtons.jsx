import React, { useCallback, useState, useEffect, useRef } from 'react'
import { IconButton, makeStyles, Tooltip } from '@material-ui/core'
import ArrowBackIcon from '@material-ui/icons/ArrowBack'
import ArrowForwardIcon from '@material-ui/icons/ArrowForward'
import { useHistory } from 'react-router-dom'

const useStyles = makeStyles(
  (theme) => ({
    root: {
      display: 'flex',
      alignItems: 'center',
      marginRight: theme.spacing(1),
    },
    button: {
      color: 'inherit',
      padding: theme.spacing(1),
    },
  }),
  { name: 'NDNavigationButtons' },
)

const NavigationButtons = () => {
  const classes = useStyles()
  const history = useHistory()
  const [canGoBack, setCanGoBack] = useState(false)
  const [canGoForward, setCanGoForward] = useState(false)

  const stackRef = useRef([])
  const indexRef = useRef(-1)
  const navigatingRef = useRef(false)

  const updateButtons = useCallback(() => {
    setCanGoBack(indexRef.current > 0)
    setCanGoForward(indexRef.current < stackRef.current.length - 1)
  }, [])

  useEffect(() => {
    const initialPath = history.location.pathname + history.location.search
    stackRef.current = [initialPath]
    indexRef.current = 0
    updateButtons()

    const unlisten = history.listen((location) => {
      if (navigatingRef.current) {
        navigatingRef.current = false
        return
      }

      const newPath = location.pathname + location.search
      const stack = stackRef.current
      const idx = indexRef.current

      const MAX_STACK = 100
      let truncated = stack.slice(0, idx + 1)
      truncated.push(newPath)

      if (truncated.length > MAX_STACK) {
        const overflow = truncated.length - MAX_STACK
        truncated = truncated.slice(overflow)
        indexRef.current = truncated.length - 1
      } else {
        indexRef.current = truncated.length - 1
      }
      stackRef.current = truncated
      updateButtons()
    })

    return unlisten
  }, [history, updateButtons])

  const handleBack = useCallback(() => {
    if (indexRef.current > 0) {
      navigatingRef.current = true
      indexRef.current -= 1
      history.replace(stackRef.current[indexRef.current])
      updateButtons()
    }
  }, [history, updateButtons])

  const handleForward = useCallback(() => {
    if (indexRef.current < stackRef.current.length - 1) {
      navigatingRef.current = true
      indexRef.current += 1
      history.replace(stackRef.current[indexRef.current])
      updateButtons()
    }
  }, [history, updateButtons])

  return (
    <div className={classes.root}>
      <Tooltip title="Back">
        <span>
          <IconButton
            className={classes.button}
            onClick={handleBack}
            disabled={!canGoBack}
            size="small"
          >
            <ArrowBackIcon />
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip title="Forward">
        <span>
          <IconButton
            className={classes.button}
            onClick={handleForward}
            disabled={!canGoForward}
            size="small"
          >
            <ArrowForwardIcon />
          </IconButton>
        </span>
      </Tooltip>
    </div>
  )
}

export default NavigationButtons
