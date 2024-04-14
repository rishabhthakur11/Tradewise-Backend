import passport from 'passport';
import { Strategy as GoogleStrategy} from 'passport-google-oauth2';
import {CALLBACK_URL, GOOGLE_OAUTH_CLIENT_SECRET, GOOGLE_OAUTH_CLIENT_ID} from '../config/config';
import UserModel from '../models/user.model';
import UserType from './interfaces/user.interface'
import AuthServices from '../services/auth.services';


const authService = new AuthServices();
passport.use(
    new GoogleStrategy(
        {
            clientID: GOOGLE_OAUTH_CLIENT_ID || '',
            clientSecret: GOOGLE_OAUTH_CLIENT_SECRET || '',
            callbackURL: CALLBACK_URL || '',
        },
        async (accessToken, refreshToken, profile, done) => {
           console.log("Login successful!");
           const user = await UserModel.findOne({ email: profile.email });
           // if user doesn't exist in db
           if(!user) {
            const first_name = profile.displayName.split(' ')[0];
            const last_name = profile.displayName.split(' ')[1];
            
            const rndPassword = authService.GenerateRandomPassword();
            const newUser = await UserModel.create({
                first_name,
                last_name,
                userID: profile.id,
                email: profile.emails?.[0].value,
                profileImgUrl: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
                dateOfBirth: profile._json.birthdate,
                password: rndPassword,
                balance: 0 // as user doesn't exist in db
              });
              if (newUser) {
                done(null, newUser);
              } 
           }
           // if user already exists
           else {
            done(null, user);
          }
        }
    )
);


passport.serializeUser((user, done) => {
    done(null, user._id);
});

passport.deserializeUser(async (_id, done) => {
    const user = await UserModel.findById(_id);
    done(null, user);
});
