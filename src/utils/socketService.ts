import { io, Socket } from "socket.io-client";
import { Dispatch } from "@reduxjs/toolkit";
import { toast } from "react-hot-toast";
import { addSearchedLead, addContactedLead, fetchNotifications } from "../store/slices/leadSlice";
interface UserDetails {
  id: number;
  name: string;
  email: string;
  mobile: string;
}
interface SearchedLead {
  id: number;
  property_id: number;
  user_id: number;
  name: string;
  mobile: string;
  email: string;
  searched_on_date: string;
  searched_on_time: string;
  interested_status: string;
  property_user_id: number;
  searched_filter_desc: string;
  shedule_date: string;
  shedule_time: string;
  view_status: string;
  property_for: string;
  property_name: string;
  owner_user_id: number;
  owner_name: string;
  owner_mobile: string;
  owner_type: string;
  owner_email: string;
  owner_photo: string;
}
interface ContactedLead {
  id: number;
  user_id: number;
  unique_property_id: number;
  created_date: string;
  userDetails: UserDetails;
  property_name: string;
  sub_type: string;
  property_for: string;
  property_type: string;
  property_in: string;
  state_id: number;
  city_id: number;
  location_id: number;
  property_cost: number;
  bedrooms: number;
  bathroom: number;
  facing: string;
  car_parking: number;
  bike_parking: number;
  description: string;
  image: string;
  google_address: string;
}
const SOCKET_URL = "https://api.meetowner.in";
let socket: Socket | null = null;
export const initSocket = (dispatch: Dispatch, isAuthenticated: boolean) => {
  if (socket || !isAuthenticated) return socket;
  socket = io(SOCKET_URL, {
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    autoConnect: true,
    transports: ["websocket"],
    auth: {
      token: localStorage.getItem("token") || "",
    },
  });
  socket.on("connect", () => {
    toast.success("Connected to real-time updates", {
      position: "top-right",
      duration: 2000,
    });
  });
  socket.on("connect_error", (error) => {
    console.log("error: ", error);
  });
  socket.on("disconnect", (reason) => {
    if (reason !== "io client disconnect") {
      toast.warn("Disconnected from real-time updates", {
        position: "top-right",
        duration: 3000,
      });
    }
  });
  socket.on("freshSearchedLeads", (data: SearchedLead[]) => {
    if (!Array.isArray(data)) {
      console.error("Invalid searched leads data:", data);
      return;
    }
    dispatch(addSearchedLead(data));
    dispatch(fetchNotifications());
    if (data.length > 0) {
      toast.success(
        `New searched lead: ${data[0].name} for ${data[0].property_name}`,
        {
          position: "top-right",
          duration: 4000,
          style: { maxWidth: "500px" },
        }
      );
    }
  });
  socket.on("freshContactedLeads", (data: ContactedLead[]) => {
    if (!Array.isArray(data)) {
      console.error("Invalid contacted leads data:", data);
      return;
    }
    dispatch(addContactedLead(data));
    dispatch(fetchNotifications());
    if (data.length > 0) {
      toast.success(
        `New contacted lead: ${data[0].userDetails.name} for ${data[0].property_name}`,
        {
          position: "top-right",
          duration: 4000,
          style: { maxWidth: "500px" },
        }
      );
    }
  });
  return socket;
};
export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
   
  }
};
export const getSocket = () => socket;