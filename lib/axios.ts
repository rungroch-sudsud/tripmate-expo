import axios from 'axios'
import {requirements} from '../app/requirement'

const axiosInstance=axios.create({
    baseURL:`${requirements.baseURL}`
});


export {axiosInstance}