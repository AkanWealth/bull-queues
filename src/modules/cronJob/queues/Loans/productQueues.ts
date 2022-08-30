import  Queue from 'bull';
import productProcess from '../../processes/Loans/product.process';


const productQueues = new Queue('product',{
  redis: {
    host: '127.0.0.1',
    port: 6379,
  }
});

productQueues.process(productProcess);

export const productToQueue = (data: any) => {
  productQueues.add(data, {
    attempts: 5,
    repeat: {
      cron: '15 3 * * *',// 3:15 AM everyday
      delay: 5000
    }
  });
};

