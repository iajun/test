import axios from "@api/tools/axios";

export const apiGetCustomerList = () =>
  axios({
    url: "customer/list",
    method: "get"
  });

export const apiUpdateCustomer = (lid, data) =>
  axios(
    {
      url: `customer/${lid}/info`,
      method: "put",
      data
    },
    { info: "修改客户信息成功" }
  );

export const apiUpdateCustomerLicense = (lid, data) =>
  axios(
    {
      url: `customer/${lid}/license`,
      method: "put",
      data
    },
    { info: "更新License成功" }
  );

export const apiDeleteCustomer = lid =>
  axios(
    {
      url: `customer/${lid}/info`,
      method: "delete"
    },
    { info: "删除客户成功" }
  );

export const apiAddCustomer = data =>
  axios(
    {
      url: "customer/info",
      method: "post",
      data
    },
    { info: "添加客户成功" }
  );
