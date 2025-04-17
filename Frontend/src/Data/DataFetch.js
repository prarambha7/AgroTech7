import axios from "axios";
import { tokenHeader } from "../Utils/tokenHeader";
import { url } from "./url";

export async function checkToken() {
  const token = localStorage.getItem("token");
  return await axios
    .get(`/api/checktoken`, tokenHeader(token))
    .then((res) => {
      return res.data;
    })
    .catch((err) => {
      return err.response.data;
    });
}

export const imageurl = `${url}`;
