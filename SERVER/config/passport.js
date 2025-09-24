let JWTStraytegy = require("passport-jwt").Strategy;
let ExtracJWT = require("passport-jwt").ExtractJwt;
const User = require("../models").user;

module.exports = (passport) => {
  let opts = {};
  opts.jwtFromRequest = ExtracJWT.fromAuthHeaderWithScheme("jwt");
  opts.secretOrKey = process.env.PASSPORT_SECRET;

  passport.use(
    new JWTStraytegy(opts, async function (jwt_payload, done) {
      try {
        let foundUser = await User.findOne({ _id: jwt_payload._id }).exec();
        if (foundUser) {
          done(null, foundUser);
        } else {
          done(null, false);
        }
      } catch (e) {
        return done(e, false);
      }
    })
  );
};
