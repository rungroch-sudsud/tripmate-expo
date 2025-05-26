import axios from 'axios';


const axiosInstance=axios.create(
     {baseURL:'http://143.198.83.179:8080'}
)


export default {axiosInstance}
