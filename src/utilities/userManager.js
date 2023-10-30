import { createUserManager } from 'redux-oidc';

const userManagerConfig = {
  client_id:  window.ENV.REACT_APP_CLIENT_ID,
  redirect_uri: window.ENV.REACT_APP_REDIRECT_URI,
  post_logout_redirect_uri: window.ENV.REACT_APP_POST_LOGOUT_REDIRECT_URI,
  response_type: 'id_token token',
  scope: 'openid profile',
  authority: window.ENV.REACT_APP_AUTHORITY,
  silent_redirect_uri: window.ENV.REACT_APP_SILENT_REDIRECT_URI,
  automaticSilentRenew: true,
  revokeAccessTokenOnSignout:true,
  requireHttps: window.ENV.REACT_APP_REQUIRE_HTTPS,
  includeIdTokenInSilentRenew: true,
  filterProtocolClaims: false,
  loadUserInfo: false,
  monitorSession: true,
  accessTokenExpiringNotificationTime:300,
  clockSkew: 10800
};

const userManager = createUserManager(userManagerConfig);

export default userManager;