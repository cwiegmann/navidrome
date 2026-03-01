import React from 'react'
import { Route } from 'react-router-dom'
import Personal from './personal/Personal'
import HomePage from './home/HomePage'

const routes = [
  <Route exact path="/personal" render={() => <Personal />} key={'personal'} />,
  <Route exact path="/home" render={() => <HomePage />} key={'home'} />,
]

export default routes
