import { Job } from "bull";
import axios from 'axios'

const cronJobProcess = async (job: Job) => {
  console.log(job.data)
  // return axios.get('localhost:2024/loan/v1/product-meta?newIdx=1&limit=10');
  // return{
  //   message: 'welcome'
  // }
}

export default cronJobProcess;