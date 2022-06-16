import { AuthenticationClient } from 'authing-js-sdk';

interface ProviderOption {
  appId: string;
  appHost: string;
  redirectUri: string;
  wellKnown: string;
  secret: string;
}

export default function AuthingProvider (option: ProviderOption): any {
  const authing = new AuthenticationClient({
    appId: option.appId,
    secret: option.secret,
    appHost: option.appHost,
    redirectUri: option.redirectUri,
    tokenEndPointAuthMethod: 'client_secret_basic'
  });

  return {
    id: 'authing',
    name: 'Authing',
    type: 'oauth',
    idToken: false,
    wellKnown: option.wellKnown,
    authorization: authing.buildAuthorizeUrl({
      scope: 'openid profile email phone address offline_access'
    }),
    clientId: option.appId,
    clientSecret: option.secret,
    token: {
      async request(context) {
        const tokens = await authing.getAccessTokenByCode(context.params.code)
        return { tokens };
      }
    },
    userinfo: {
      async request(context) {
        return await authing.getUserInfoByAccessToken(context.tokens.access_token);
      }
    },
    profile(profile) {
      return {
        id: profile.sub,
        name: profile.name,
        email: profile.email,
        image: profile.picture,
      }
    },
  }
};
