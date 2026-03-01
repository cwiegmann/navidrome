import React, { useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useTranslate } from 'react-admin'
import {
  Typography,
  Slider,
  FormControl,
  makeStyles,
} from '@material-ui/core'
import { setCrossfade } from '../actions'

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    maxWidth: 400,
    padding: theme.spacing(1, 0, 2, 0),
  },
  label: {
    marginBottom: theme.spacing(0.5),
    fontWeight: 500,
  },
  valueLabel: {
    color: theme.palette.text.secondary,
    fontSize: '0.85rem',
  },
}))

const marks = [
  { value: 0, label: 'Off' },
  { value: 3, label: '3s' },
  { value: 6, label: '6s' },
  { value: 9, label: '9s' },
  { value: 12, label: '12s' },
]

const CrossfadeSlider = () => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const crossfadeDuration = useSelector(
    (state) => state.player.crossfadeDuration || 0,
  )

  const handleChange = useCallback(
    (_, value) => {
      dispatch(setCrossfade(value))
    },
    [dispatch],
  )

  const displayValue =
    crossfadeDuration === 0
      ? 'Off'
      : `${crossfadeDuration} second${crossfadeDuration !== 1 ? 's' : ''}`

  return (
    <FormControl className={classes.root}>
      <Typography className={classes.label} variant="body2">
        Crossfade
      </Typography>
      <Slider
        value={crossfadeDuration}
        onChange={handleChange}
        min={0}
        max={12}
        step={1}
        marks={marks}
        valueLabelDisplay="auto"
        aria-label="Crossfade duration"
      />
      <Typography className={classes.valueLabel}>{displayValue}</Typography>
    </FormControl>
  )
}

export default CrossfadeSlider
