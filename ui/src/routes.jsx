import React from 'react'
import { Route, Redirect } from 'react-router-dom'
import Personal from './personal/Personal'
import HomePage from './home/HomePage'
import AppearanceSettings from './personal/AppearanceSettings'
import ListeningStats from './stats/ListeningStats'
import SmartPlaylists from './smart/SmartPlaylists'
import OfflineQueue from './pwa/OfflineQueue'
import FavouritesPage from './favourites/FavouritesPage'
import TopRatedPage from './curated/TopRatedPage'
import RecentlyAddedPage from './curated/RecentlyAddedPage'
import RecentlyPlayedPage from './curated/RecentlyPlayedPage'
import MostPlayedPage from './curated/MostPlayedPage'

const routes = [
  <Route exact path="/personal" render={() => <Personal />} key={'personal'} />,
  <Route exact path="/home" render={() => <HomePage />} key={'home'} />,
  <Route exact path="/browse" render={() => <Redirect to="/home" />} key={'browse'} />,
  <Route exact path="/history" render={() => <Redirect to="/home" />} key={'history'} />,
  <Route exact path="/appearance" render={() => <AppearanceSettings />} key={'appearance'} />,
  <Route exact path="/stats" render={() => <ListeningStats />} key={'stats'} />,
  <Route exact path="/smart-playlists" render={() => <SmartPlaylists />} key={'smart-playlists'} />,
  <Route exact path="/offline" render={() => <OfflineQueue />} key={'offline'} />,
  <Route exact path="/favourites" render={() => <FavouritesPage />} key={'favourites'} />,
  <Route exact path="/top-rated" render={() => <TopRatedPage />} key={'top-rated'} />,
  <Route exact path="/recently-added" render={() => <RecentlyAddedPage />} key={'recently-added'} />,
  <Route exact path="/recently-played" render={() => <RecentlyPlayedPage />} key={'recently-played'} />,
  <Route exact path="/most-played" render={() => <MostPlayedPage />} key={'most-played'} />,
  <Route exact path="/album/starred" render={() => <Redirect to="/favourites" />} key={'starred-redirect'} />,
  <Route exact path="/album/topRated" render={() => <Redirect to="/top-rated" />} key={'toprated-redirect'} />,
  <Route exact path="/album/recentlyAdded" render={() => <Redirect to="/recently-added" />} key={'recentlyadded-redirect'} />,
  <Route exact path="/album/recentlyPlayed" render={() => <Redirect to="/recently-played" />} key={'recentlyplayed-redirect'} />,
  <Route exact path="/album/mostPlayed" render={() => <Redirect to="/most-played" />} key={'mostplayed-redirect'} />,
]

export default routes
