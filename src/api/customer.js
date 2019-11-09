import axios from "@api/tools/axios";

export const apiGetCustomerList = () =>
  axios({
    url: "customer/list",
    method: "get"
  });

export const apiUpdateCustomer = (lid, data) =>
  axios({
    url: `customer/${lid}/info`,
    method: "put",
    data
  });

export const apiUpdateCustomerLicense = (lid, data) =>
  axios({
    url: `customer/${lid}/license`,
    method: "put",
    data
  });

export const apiDeleteCustomer = lid =>
  axios({
    url: `customer/${lid}/info`,
    method: "delete"
  });

export const apiAddCustomer = data =>
  axios({
    url: "customer/info",
    method: "post",
    data
  });
