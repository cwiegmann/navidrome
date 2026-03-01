import React, { useState, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Title } from 'react-admin'
import {
  Typography,
  Card,
  CardContent,
  makeStyles,
  Slider,
} from '@material-ui/core'
import CheckIcon from '@material-ui/icons/Check'
import Brightness4Icon from '@material-ui/icons/Brightness4'
import Brightness7Icon from '@material-ui/icons/Brightness7'
import SettingsBrightnessIcon from '@material-ui/icons/SettingsBrightness'
import themes from '../themes'
import { changeTheme } from '../actions'
import { AUTO_THEME_ID } from '../consts'

const ACCENT_COLORS = [
  { name: 'Purple', value: '#5f5fc4' },
  { name: 'Blue', value: '#2196f3' },
  { name: 'Teal', value: '#009688' },
  { name: 'Green', value: '#4caf50' },
  { name: 'Orange', value: '#ff9800' },
  { name: 'Red', value: '#f44336' },
  { name: 'Pink', value: '#e91e63' },
  { name: 'Yellow', value: '#ffc107' },
]

const THEME_CATEGORIES = [
  {
    id: AUTO_THEME_ID,
    name: 'System',
    icon: SettingsBrightnessIcon,
    description: 'Follows OS',
  },
  {
    id: 'LightTheme',
    name: 'Light',
    icon: Brightness7Icon,
    description: 'Light mode',
  },
  {
    id: 'DarkTheme',
    name: 'Dark',
    icon: Brightness4Icon,
    description: 'Dark mode',
  },
]

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
    maxWidth: 900,
  },
  pageTitle: {
    fontWeight: 700,
    fontSize: '1.75rem',
    marginBottom: theme.spacing(4),
  },
  section: {
    marginBottom: theme.spacing(4),
  },
  sectionTitle: {
    fontWeight: 600,
    fontSize: '1rem',
    marginBottom: theme.spacing(2),
  },
  themeGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('xs')]: {
      gridTemplateColumns: '1fr',
    },
  },
  themeCard: {
    borderRadius: 12,
    cursor: 'pointer',
    border: `2px solid transparent`,
    transition: 'all 200ms ease',
    overflow: 'hidden',
    '&:hover': {
      borderColor: theme.palette.primary.main + '80',
    },
  },
  themeCardSelected: {
    borderColor: theme.palette.primary.main,
    boxShadow: `0 0 0 1px ${theme.palette.primary.main}`,
  },
  themePreview: {
    height: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  themePreviewLight: {
    background: 'linear-gradient(135deg, #f5f5f5, #e0e0e0)',
  },
  themePreviewDark: {
    background: 'linear-gradient(135deg, #424242, #303030)',
  },
  themePreviewAuto: {
    background:
      'linear-gradient(135deg, #f5f5f5 50%, #303030 50%)',
  },
  themeIcon: {
    fontSize: 32,
    color: theme.palette.type === 'dark' ? '#aaa' : '#666',
  },
  themeInfo: {
    padding: theme.spacing(1.5),
    textAlign: 'center',
  },
  themeName: {
    fontWeight: 600,
    fontSize: '0.9rem',
  },
  themeDesc: {
    fontSize: '0.75rem',
    color: theme.palette.text.secondary,
  },
  communityThemes: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
    gap: theme.spacing(1.5),
  },
  miniThemeCard: {
    borderRadius: 8,
    cursor: 'pointer',
    border: `2px solid transparent`,
    padding: theme.spacing(1.5),
    textAlign: 'center',
    transition: 'all 150ms ease',
    backgroundColor:
      theme.palette.type === 'dark'
        ? 'rgba(255,255,255,0.05)'
        : 'rgba(0,0,0,0.03)',
    '&:hover': {
      backgroundColor:
        theme.palette.type === 'dark'
          ? 'rgba(255,255,255,0.1)'
          : 'rgba(0,0,0,0.06)',
    },
  },
  miniThemeCardSelected: {
    borderColor: theme.palette.primary.main,
    backgroundColor:
      theme.palette.type === 'dark'
        ? 'rgba(255,255,255,0.1)'
        : 'rgba(0,0,0,0.06)',
  },
  miniThemeColor: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    margin: '0 auto 8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniThemeName: {
    fontSize: '0.75rem',
    fontWeight: 500,
  },
  accentRow: {
    display: 'flex',
    gap: theme.spacing(1.5),
    flexWrap: 'wrap',
  },
  accentCircle: {
    width: 40,
    height: 40,
    borderRadius: '50%',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 150ms ease, box-shadow 150ms ease',
    border: '3px solid transparent',
    '&:hover': {
      transform: 'scale(1.1)',
    },
  },
  accentSelected: {
    border: '3px solid',
    borderColor: theme.palette.type === 'dark' ? '#fff' : '#333',
    boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
  },
  sliderSection: {
    maxWidth: 400,
  },
  sliderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
  },
  sliderLabel: {
    fontSize: '0.8rem',
    color: theme.palette.text.secondary,
    minWidth: 40,
  },
  previewCard: {
    marginTop: theme.spacing(1),
    display: 'inline-block',
    padding: theme.spacing(2),
    transition: 'border-radius 300ms ease',
  },
  previewText: {
    fontSize: '0.8rem',
    color: theme.palette.text.secondary,
  },
  infoText: {
    fontSize: '0.8rem',
    color: theme.palette.text.hint,
    marginTop: theme.spacing(0.5),
  },
}))

const AppearanceSettings = () => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const currentTheme = useSelector((state) => state.theme)
  const [borderRadius, setBorderRadius] = useState(6)

  const handleThemeChange = useCallback(
    (themeId) => {
      dispatch(changeTheme(themeId))
    },
    [dispatch],
  )

  const communityThemes = Object.keys(themes).filter(
    (key) =>
      key !== 'LightTheme' && key !== 'DarkTheme',
  )

  const getThemePreviewColor = (key) => {
    const t = themes[key]
    return t?.palette?.primary?.main || t?.palette?.secondary?.main || '#666'
  }

  return (
    <div className={classes.root}>
      <Title title="Navidrome - Appearance" />
      <Typography className={classes.pageTitle}>Appearance</Typography>

      <div className={classes.section}>
        <Typography className={classes.sectionTitle}>Theme</Typography>
        <div className={classes.themeGrid}>
          {THEME_CATEGORIES.map((cat) => {
            const Icon = cat.icon
            const isSelected =
              currentTheme === cat.id ||
              (!currentTheme && cat.id === AUTO_THEME_ID)
            return (
              <Card
                key={cat.id}
                className={`${classes.themeCard} ${isSelected ? classes.themeCardSelected : ''}`}
                elevation={0}
                onClick={() => handleThemeChange(cat.id)}
              >
                <div
                  className={`${classes.themePreview} ${
                    cat.id === 'LightTheme'
                      ? classes.themePreviewLight
                      : cat.id === 'DarkTheme'
                        ? classes.themePreviewDark
                        : classes.themePreviewAuto
                  }`}
                >
                  <Icon className={classes.themeIcon} />
                </div>
                <div className={classes.themeInfo}>
                  <Typography className={classes.themeName}>
                    {cat.name}
                  </Typography>
                  <Typography className={classes.themeDesc}>
                    {cat.description}
                  </Typography>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      <div className={classes.section}>
        <Typography className={classes.sectionTitle}>
          Community Themes
        </Typography>
        <div className={classes.communityThemes}>
          {communityThemes.map((key) => {
            const isSelected = currentTheme === key
            const color = getThemePreviewColor(key)
            return (
              <div
                key={key}
                className={`${classes.miniThemeCard} ${isSelected ? classes.miniThemeCardSelected : ''}`}
                onClick={() => handleThemeChange(key)}
              >
                <div
                  className={classes.miniThemeColor}
                  style={{ backgroundColor: color }}
                >
                  {isSelected && (
                    <CheckIcon
                      style={{ color: '#fff', fontSize: 16 }}
                    />
                  )}
                </div>
                <Typography className={classes.miniThemeName}>
                  {themes[key].themeName}
                </Typography>
              </div>
            )
          })}
        </div>
      </div>

      <div className={classes.section}>
        <Typography className={classes.sectionTitle}>
          Accent Color
        </Typography>
        <div className={classes.accentRow}>
          {ACCENT_COLORS.map((color) => (
            <div
              key={color.value}
              className={classes.accentCircle}
              style={{ backgroundColor: color.value }}
              title={color.name}
            >
            </div>
          ))}
        </div>
        <Typography className={classes.infoText}>
          Accent color customization is coming in a future update.
          Currently controlled by the selected theme.
        </Typography>
      </div>

      <div className={classes.section}>
        <Typography className={classes.sectionTitle}>
          Border Radius
        </Typography>
        <div className={classes.sliderSection}>
          <div className={classes.sliderRow}>
            <Typography className={classes.sliderLabel}>
              Sharp
            </Typography>
            <Slider
              value={borderRadius}
              min={0}
              max={16}
              step={1}
              onChange={(_, val) => setBorderRadius(val)}
              valueLabelDisplay="auto"
              valueLabelFormat={(v) => `${v}px`}
            />
            <Typography className={classes.sliderLabel}>
              Round
            </Typography>
          </div>
          <Card
            className={classes.previewCard}
            elevation={2}
            style={{ borderRadius }}
          >
            <Typography className={classes.previewText}>
              Preview: {borderRadius}px border radius
            </Typography>
          </Card>
        </div>
        <Typography className={classes.infoText}>
          Global border radius is currently set to 6px in the theme.
          Full dynamic control is coming in a future update.
        </Typography>
      </div>
    </div>
  )
}

export default AppearanceSettings
