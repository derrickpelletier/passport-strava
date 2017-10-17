/**
 * Module dependencies.
 */
var util = require('util')
  , OAuth2Strategy = require('passport-oauth').OAuth2Strategy
  , InternalOAuthError = require('passport-oauth').InternalOAuthError;


/**
 * `Strategy` constructor.
 *
 * The Strava authentication strategy authenticates requests by delegating to
 * Strava using the OAuth 2.0 protocol.
 *
 * Applications must supply a `verify` callback which accepts an `accessToken`,
 * `refreshToken` and service-specific `profile`, and then calls the `done`
 * callback supplying a `user`, which should be set to `false` if the
 * credentials are not valid.  If an exception occured, `err` should be set.
 *
 * Options:
 *   - `clientID`      your Strava application's Client ID
 *   - `clientSecret`  your Strava application's Client Secret
 *   - `callbackURL`   URL to which Strava will redirect the user after granting authorization
 *
 * Examples:
 *
 *     passport.use(new StravaStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret'
 *         callbackURL: 'https://www.example.net/auth/strava/callback',
 *       },
 *       function(accessToken, refreshToken, profile, done) {
 *         User.findOrCreate(..., function (err, user) {
 *           done(err, user);
 *         });
 *       }
 *     ));
 *
 * @param {Object} options
 * @param {Function} verify
 * @api public
 */
function Strategy(options, verify) {
  options = options || {};
  options.authorizationURL = options.authorizationURL || 'https://www.strava.com/oauth/authorize';
  options.tokenURL = options.tokenURL || 'https://www.strava.com/oauth/token';

  OAuth2Strategy.call(this, options, verify);
  this.name = 'strava';
  this._userProfileURL = options.userProfileURL || 'https://www.strava.com/api/v3/athlete';
}

/**
 * Inherit from `OAuth2Strategy`.
 */
util.inherits(Strategy, OAuth2Strategy);


/**
 * Retrieve user profile from Strava.
 *
 * This function constructs a normalized profile, with the following properties:
 *
 *   - `provider`         always set to `strava`
 *   - `id`               the user's Athlete ID
 *   - `displayName`      the user's full name
 *   - `name`             the users first and last name
 *   - `avatar`           the user's highest quality avatar
 *
 * @param {String} accessToken
 * @param {Function} done
 * @api protected
 */
Strategy.prototype.userProfile = function (accessToken, done) {
  setTimeout(() => {
    this._oauth2.get(this._userProfileURL, accessToken, function (err, body, res) {
      if (err) {
        var log = " accessToken: " + accessToken;
        return done(new InternalOAuthError("failed to fetch user profile" + log, err));
      }

      try {
        var json = JSON.parse(body);

        var profile = { provider: 'strava' };
        profile.id = json.id;
        profile.displayName = json.firstname + " " + json.lastname;
        profile.name = {
          first: json.firstname
          , last: json.lastname
        };

        profile.avatar = json.profile;

        profile._raw = body;
        profile._json = json;

        done(null, profile);
      } catch (e) {
        done(e);
      }
    });
  }, 100);
}

/**
 * override authorizationParams to support approval_prompt
 */
Strategy.prototype.authorizationParams = function (options) {
  var params = {};
  var approval_prompt = options.approval_prompt;
  if (approval_prompt) { params.approval_prompt = approval_prompt; }
  return params;
}


/**
 * Expose `Strategy`.
 */
module.exports = Strategy;