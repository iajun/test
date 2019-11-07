import axios from "@api/axios";

export const apiGetCustomerList = () =>
  axios({
    url: "customer/list",
    method: "get"
  });
