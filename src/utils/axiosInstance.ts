
import axios from "axios";



const axiosIstance = axios.create({
    baseURL:"https://b012-115-98-62-109.ngrok-free.app"
})

export default axiosIstance;