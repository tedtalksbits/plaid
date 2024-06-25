import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import routes from './routes';
import config, { checkEnvVariables } from './config';
import cookieSession from 'cookie-session';

dotenv.config();
const app = express();

app.use(
  cors({
    origin: config.client.url,
    credentials: true,
  })
);
console.log('config.client.url: ' + config.client.url);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', 1);
app.use(
  cookieSession({
    name: 'session',
    secret: process.env.COOKIE_SECRET,
    secure: process.env.NODE_ENV === 'production',
  })
);
checkEnvVariables();
app.use('/api', routes);

const APP_PORT = process.env.APP_PORT || 8080;

app.listen(APP_PORT, () => {
  console.log(`Server listening on port ${APP_PORT}`);
});
