import './config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { mw } from 'request-ip';
import morgan from 'morgan';
import { IS_PRODUCTION, LOCALES, PORT } from '@common/constants';
import { authRouter } from '@auth/routes';
import { csrfRouter } from '@csrf/routes';
import { doubleCsrfProtection } from '@csrf/middlewares';
import { permissionsRouter } from '@permissions/routes';
import { mailListener } from '@mail';
import { errorHandler } from '@common/middlewares';
import { I18n } from 'i18n';
import path, { join } from 'path';
import { SwaggerGenerator } from '@common/swagger';
import { stationRouter } from '@stations';

BigInt.prototype['toJSON'] = function () {
  return this.toString();
};

const bootstrap = async () => {
  const app = express();

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  // app.use(helmet());
  // app.use(helmet.hidePoweredBy());
  if (IS_PRODUCTION) {
    app.use(doubleCsrfProtection);
  }

  const i18n = new I18n({
    locales: LOCALES,
    defaultLocale: LOCALES[0],
    objectNotation: true,
    updateFiles: false,
    directory: join(process.cwd(), 'locales'),
    queryParameter: 'lang',
    header: 'x-lang',
  });
  app.use(i18n.init);

  // app.use(mw());
  // app.use(morgan('combined'));

  app.use('/api/auth', authRouter);
  app.use('/api/csrf', csrfRouter);
  app.use('/api/permissions', permissionsRouter);
  app.use('/api/stations', stationRouter);

  app.get('/', (req, res) => {
    const filePath = path.join(process.cwd(), 'static', 'index.html');
    res.sendFile(filePath);
  });

  app.get('/favourite', (req, res) => {
    const filePath = path.join(process.cwd(), 'static', 'favourite.html');
    res.sendFile(filePath);
  });

  app.get('/login', (req, res) => {
    const filePath = path.join(process.cwd(), 'static', 'login.html');
    res.sendFile(filePath);
  });

  app.use('/static', express.static(join(process.cwd(), 'static')));

  app.use(errorHandler);

  app.listen(PORT, () => {
    mailListener.initialize();
    console.log(`Server started on PORT: ${PORT}`);
  });

  const swagger = new SwaggerGenerator(app, {
    title: 'Voltyze',
    version: '1.0.0',
  });

  swagger.serveDocs('/api/docs');
};

bootstrap()
  .then(() => console.log('App initialized'))
  .catch((e) => console.error(e));
