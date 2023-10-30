// This is used to determine if a user is authenticated and
// if they are allowed to visit the page they navigated to.

// If they are: they proceed to the page
// If not: they are redirected to the login page.
import React from 'react'
// TODO: import AuthService from './Services/AuthService'
import { Redirect, Route } from 'react-router-dom'

const DetailPrivateAdminRoute = ({
  component: Component,
  authed,
  currentTable,
  ...rest
}) => {
  return (
    <Route
      {...rest}
      render={props =>
        authed === true ? (
          currentTable? (
            <Component {...props} />
          ) : (
            <Redirect to={{ pathname: '/searchuser', state: { from: props.location } }}
            />
          )
        ) : (
          <Redirect to={{ pathname: '/', state: { from: props.location } }} />
        )
      }
    />
  )
}

export default DetailPrivateAdminRoute