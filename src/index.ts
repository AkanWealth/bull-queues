import cors from 'cors';
import helmet from 'helmet';
import { config } from 'dotenv';
import compression from 'compression';
// import { Server } from 'socket.io';
import * as Sentry from '@sentry/node';
import express, { Request } from 'express';
import * as Tracing from '@sentry/tracing';
import  rateLimit from 'express-rate-limit';
import { errorHandler } from 'package-middlewares';
import Bull from 'bull';
// import cronJobProcess from '../processes/job.process';
import { createBullBoard }  from '@bull-board/api';
import { BullAdapter }  from '@bull-board/api/bullAdapter';
import { ExpressAdapter }  from '@bull-board/express';
import initializedJobs from './modules/cronJob/index'

const cronQueues = new Bull('cron-job');
const userQueues = new Bull('user-service');
// const loanQueues = new Bull('loan-service');
const loanProductQueues = new Bull('loan-product');

const serverAdapter = new ExpressAdapter();

createBullBoard({ 
  queues: [
    new BullAdapter(cronQueues),
    new BullAdapter(userQueues),
    // new BullAdapter(loanQueues),
    new BullAdapter(loanProductQueues),
  ],
  serverAdapter
})

serverAdapter.setBasePath('/cron-dashboard');

initializedJobs();

import routes from './routes';
// import db from './database/postgres/models'
// import start, { sendEvent } from './database/kafka/kafka';
config();

const app = express();
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
// const { sequelize } = db;
const { PORT, SENTRY_DSN, NODE_ENV, BASIC_URL } = process.env;

// const apiLimiter = rateLimit({
//   windowMs: 10 * 60 * 1000, // 10 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: 'Too many request from this IP, please try again after 10 minutes'
// });

// Middlewares
app.use(helmet());
app.use(compression());


if (SENTRY_DSN) {
  Sentry.init({
    dsn: SENTRY_DSN,
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Tracing.Integrations.Express({ app }),
    ],
    environment: NODE_ENV,
    tracesSampleRate: 1.0,
  });

  app.use(Sentry.Handlers.requestHandler());
  app.use(Sentry.Handlers.tracingHandler());
  app.use((req: Request, _res, next) => {
    // @ts-ignore
    if (!req.transaction) {
      // @ts-ignore
      req.transaction = Sentry.startTransaction({
        op: 'test',
        name: 'My First Test Transaction',
      });
    }
    next();
  });
}

app.use(
  cors({
    origin: (_origin, callback) => {
      callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.json({ limit: '10mb' }));
app.disable('x-powered-by');

app.use('/cron-dashboard', serverAdapter.getRouter());
// app.use('/', apiLimiter, routes);
app.use('/', routes);
// cronJob({data:'hhhh'});


// start()
//   .then(() => {
//     sendEvent();
//   })
//   .catch((e) => {
//     console.log(e);
//   });

// Error handlers
app.use(Sentry.Handlers.errorHandler());
app.use(errorHandler);

export default app;

console.log(`Environment is ${NODE_ENV}`);
app.listen(PORT, () => {
  console.log(`Server started on port: ${PORT}`);
  console.log(`Bull Dashboard started on port: ${BASIC_URL}/cron-dashboard`);
});
