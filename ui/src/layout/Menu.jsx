import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { Divider, makeStyles } from '@material-ui/core'
import clsx from 'clsx'
import { useTranslate, MenuItemLink, getResources } from 'react-admin'
import ViewListIcon from '@material-ui/icons/ViewList'
import AlbumIcon from '@material-ui/icons/Album'
import HomeIcon from '@material-ui/icons/Home'
import PaletteIcon from '@material-ui/icons/Palette'
import BarChartIcon from '@material-ui/icons/BarChart'
import AutorenewIcon from '@material-ui/icons/Autorenew'
import CloudQueueIcon from '@material-ui/icons/CloudQueue'
import FavoriteIcon from '@material-ui/icons/Favorite'
import StarIcon from '@material-ui/icons/Star'
import LibraryAddIcon from '@material-ui/icons/LibraryAdd'
import VideoLibraryIcon from '@material-ui/icons/VideoLibrary'
import RepeatIcon from '@material-ui/icons/Repeat'
import SubMenu from './SubMenu'
import { humanize, pluralize } from 'inflection'
import albumLists from '../album/albumLists'
import PlaylistsSubMenu from './PlaylistsSubMenu'
import LibrarySelector from '../common/LibrarySelector'
import config from '../config'

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    paddingBottom: (props) => (props.addPadding ? '80px' : '20px'),
  },
  open: {
    width: 240,
  },
  closed: {
    width: 55,
  },
  active: {
    color: theme.palette.text.primary,
    fontWeight: 'bold',
  },
}))

const translatedResourceName = (resource, translate) =>
  translate(`resources.${resource.name}.name`, {
    smart_count: 2,
    _:
      resource.options && resource.options.label
        ? translate(resource.options.label, {
            smart_count: 2,
            _: resource.options.label,
          })
        : humanize(pluralize(resource.name)),
  })

const Menu = ({ dense = false }) => {
  const open = useSelector((state) => state.admin.ui.sidebarOpen)
  const translate = useTranslate()
  const queue = useSelector((state) => state.player?.queue ?? [])
  const classes = useStyles({ addPadding: queue.length > 0 })
  const resources = useSelector(getResources)

  // TODO State is not persisted in mobile when you close the sidebar menu. Move to redux?
  const [state, setState] = useState({
    menuAlbumList: true,
    menuPlaylists: true,
    menuSharedPlaylists: true,
  })

  const handleToggle = (menu) => {
    setState((state) => ({ ...state, [menu]: !state[menu] }))
  }

  const renderResourceMenuItemLink = (resource) => (
    <MenuItemLink
      key={resource.name}
      to={`/${resource.name}`}
      activeClassName={classes.active}
      primaryText={translatedResourceName(resource, translate)}
      leftIcon={resource.icon || <ViewListIcon />}
      sidebarIsOpen={open}
      dense={dense}
    />
  )

  const renderAlbumMenuItemLink = (type, al) => {
    const resource = resources.find((r) => r.name === 'album')
    if (!resource) {
      return null
    }

    const albumListAddress = `/album/${type}`

    const name = translate(`resources.album.lists.${type || 'default'}`, {
      _: translatedResourceName(resource, translate),
    })

    return (
      <MenuItemLink
        key={albumListAddress}
        to={albumListAddress}
        activeClassName={classes.active}
        primaryText={name}
        leftIcon={al.icon || <ViewListIcon />}
        sidebarIsOpen={open}
        dense={dense}
        exact
      />
    )
  }

  const subItems = (subMenu) => (resource) =>
    resource.hasList && resource.options && resource.options.subMenu === subMenu

  return (
    <div
      className={clsx(classes.root, {
        [classes.open]: open,
        [classes.closed]: !open,
      })}
    >
      {open && <LibrarySelector />}
      <MenuItemLink
        to="/home"
        activeClassName={classes.active}
        primaryText="Home"
        leftIcon={<HomeIcon />}
        sidebarIsOpen={open}
        dense={dense}
        exact
      />
      <SubMenu
        handleToggle={() => handleToggle('menuAlbumList')}
        isOpen={state.menuAlbumList}
        sidebarIsOpen={open}
        name="menu.albumList"
        icon={<AlbumIcon />}
        dense={dense}
      >
        {Object.keys(albumLists).map((type) =>
          renderAlbumMenuItemLink(type, albumLists[type]),
        )}
        {config.enableStarRating && (
          <MenuItemLink
            to="/top-rated"
            activeClassName={classes.active}
            primaryText={translate('resources.album.lists.topRated', { _: 'Top Rated' })}
            leftIcon={<StarIcon />}
            sidebarIsOpen={open}
            dense={dense}
            exact
          />
        )}
        <MenuItemLink
          to="/recently-added"
          activeClassName={classes.active}
          primaryText={translate('resources.album.lists.recentlyAdded', { _: 'Recently Added' })}
          leftIcon={<LibraryAddIcon />}
          sidebarIsOpen={open}
          dense={dense}
          exact
        />
        <MenuItemLink
          to="/recently-played"
          activeClassName={classes.active}
          primaryText={translate('resources.album.lists.recentlyPlayed', { _: 'Recently Played' })}
          leftIcon={<VideoLibraryIcon />}
          sidebarIsOpen={open}
          dense={dense}
          exact
        />
        <MenuItemLink
          to="/most-played"
          activeClassName={classes.active}
          primaryText={translate('resources.album.lists.mostPlayed', { _: 'Most Played' })}
          leftIcon={<RepeatIcon />}
          sidebarIsOpen={open}
          dense={dense}
          exact
        />
      </SubMenu>
      {config.enableFavourites && (
        <MenuItemLink
          to="/favourites"
          activeClassName={classes.active}
          primaryText="Favourites"
          leftIcon={<FavoriteIcon />}
          sidebarIsOpen={open}
          dense={dense}
          exact
        />
      )}
      {resources.filter(subItems(undefined)).map(renderResourceMenuItemLink)}
      {config.devSidebarPlaylists && open ? (
        <>
          <Divider />
          <PlaylistsSubMenu
            state={state}
            setState={setState}
            sidebarIsOpen={open}
            dense={dense}
          />
        </>
      ) : (
        resources.filter(subItems('playlist')).map(renderResourceMenuItemLink)
      )}
      {open && <Divider style={{ margin: '8px 0' }} />}
      <MenuItemLink
        to="/stats"
        activeClassName={classes.active}
        primaryText="Stats"
        leftIcon={<BarChartIcon />}
        sidebarIsOpen={open}
        dense={dense}
        exact
      />
      <MenuItemLink
        to="/smart-playlists"
        activeClassName={classes.active}
        primaryText="Smart Playlists"
        leftIcon={<AutorenewIcon />}
        sidebarIsOpen={open}
        dense={dense}
        exact
      />
      <MenuItemLink
        to="/offline"
        activeClassName={classes.active}
        primaryText="Offline Queue"
        leftIcon={<CloudQueueIcon />}
        sidebarIsOpen={open}
        dense={dense}
        exact
      />
      {open && <Divider style={{ margin: '8px 0' }} />}
      <MenuItemLink
        to="/appearance"
        activeClassName={classes.active}
        primaryText="Appearance"
        leftIcon={<PaletteIcon />}
        sidebarIsOpen={open}
        dense={dense}
        exact
      />
    </div>
  )
}

export default Menu
