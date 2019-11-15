import axios from "@api/tools/axios";

export const apiGetProxyList = () =>
  axios({
    url: "proxy/list",
    method: "get"
  });

export const apiGetProxyLoginURL = (cid, params) =>
  axios({
    url: `proxy/${cid}/url`,
    method: "get",
    params
  });

export const apiAddProxy = data =>
  axios({
    url: `proxy`,
    method: "post",
    data
  });

export const apiUpdateProxy = data =>
  axios(
    {
      url: `proxy`,
      method: "put",
      data
    },
    {
      info: "修改代理信息成功"
    }
  );

export const apiDelProxy = name =>
  axios(
    {
      url: `proxy/${name}`,
      method: "delete"
    },
    {
      info: "删除代理成功"
    }
  );

// export const apiUpdateCustomer = (lid, data) =>
//   axios(
//     {
//       url: `customer/${lid}/info`,
//       method: "put",
//       data
//     },
//     { info: "修改客户信息成功" }
//   );

// export const apiUpdateCustomerLicense = (lid, data) =>
//   axios(
//     {
//       url: `customer/${lid}/license`,
//       method: "put",
//       data
//     },
//     { info: "更新License成功" }
//   );

// export const apiDeleteCustomer = lid =>
//   axios(
//     {
//       url: `customer/${lid}/info`,
//       method: "delete"
//     },
//     { info: "删除客户成功" }
//   );

// export const apiAddCustomer = data =>
//   axios(
//     {
//       url: "customer/info",
//       method: "post",
//       data
//     },
//     { info: "添加客户成功" }
//   );
