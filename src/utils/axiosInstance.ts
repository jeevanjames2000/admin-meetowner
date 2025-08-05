
import axios from "axios";


const axiosIstance = axios.create({
    baseURL:"https://api.meetowner.in/"
})
// const axiosIstance = axios.create({
//     baseURL:"http://localhost:5000/"
// })


export default axiosIstance;

