
import axios from "axios";



const axiosIstance = axios.create({
    baseURL:"https://api.meetowner.in/"
})

export default axiosIstance;

