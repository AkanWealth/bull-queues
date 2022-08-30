import axios from "axios";
import { Job } from "bull";

const productProcess = async (job: Job) =>{
  console.log('hello',job)
  return {
    message: 'test for product'
  }
//   const getProduct = await axios.get('localhost:2024/loan/v1/product-meta?newIdx=1&limit=10', job);
//  return getProduct;
}
export default productProcess