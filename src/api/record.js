import axios from "@api/tools/axios";

export const apiGetRecordList = (params = {}) =>
  axios({
    url: "proxy/list",
    method: "get",
    params
  });
