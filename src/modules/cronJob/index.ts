import { productToQueue } from '../cronJob/queues/Loans/productQueues'

const initializedJobs = async () => {
  console.log('initialized ---');
  return await productToQueue({ message: 'Loan product queue' });
}

export default initializedJobs