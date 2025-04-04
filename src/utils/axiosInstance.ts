
import axios from "axios";



const axiosIstance = axios.create({
    baseURL:"https://6522-115-98-50-127.ngrok-free.app"
})

export default axiosIstance;