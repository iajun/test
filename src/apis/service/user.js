import axios from "@api/axios";

export const apiGetUser = () =>
  axios({
    url: "user/info",
    method: "get"
  });
