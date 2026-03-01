import React from 'react'
import ShuffleIcon from '@material-ui/icons/Shuffle'
import AlbumIcon from '@material-ui/icons/Album'
import AlbumOutlinedIcon from '@material-ui/icons/AlbumOutlined'
import LibraryBooksIcon from '@material-ui/icons/LibraryBooks'
import LibraryBooksOutlinedIcon from '@material-ui/icons/LibraryBooksOutlined'
import DynamicMenuIcon from '../layout/DynamicMenuIcon'

const albumLists = {
  all: {
    icon: (
      <DynamicMenuIcon
        path={'album/all'}
        icon={AlbumOutlinedIcon}
        activeIcon={AlbumIcon}
      />
    ),
    params: 'sort=name&order=ASC&filter={}',
  },
  random: {
    icon: <ShuffleIcon />,
    params: 'sort=random&order=ASC&filter={}',
  },
  lps: {
    icon: (
      <DynamicMenuIcon
        path={'album/lps'}
        icon={LibraryBooksOutlinedIcon}
        activeIcon={LibraryBooksIcon}
      />
    ),
    params: 'sort=name&order=ASC&filter={"full_length":true}',
  },
}

export default albumLists
export const defaultAlbumList = 'all'
