
import axios from "axios";



const axiosIstance = axios.create({
    baseURL:"http://3.111.47.214:5001"
})

export default axiosIstance;