import Bull from 'bull';
import cronJobProcess from '../processes/job.process';

const cronQueues = new Bull('cron-job', {
  redis: {
    host: '127.0.0.1',
    port: 6379,
  }
});

cronQueues.process(cronJobProcess);

export const cronJob = (data: any) => {
  cronQueues.add(data, {
    attempts: 1
  });
};
