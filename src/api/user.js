import axios from "@api/tools/axios";

export const apiGetUser = () =>
  axios({
    url: "user/info",
    method: "get"
  });
