import axios from "axios";
import Cookie from "universal-cookie";
import { message } from "antd";

const cookie = new Cookie();

const instance = axios.create({
  // baseURL: "https://admin.juhe.baishancloud.com/v1/dashboard",
  baseURL: "http://admin.t.com/v1/dashboard",
  timeout: 10000
});

instance.interceptors.request.use(function(config) {
  const access_token = cookie.get("access_token");
  if (access_token === void 0) {
    message.error("您的登录信息已失效，请重新登录");
    return (location.pathname = "/login");
  } else {
    config.headers["Authorization"] = `access_token ${access_token}`;
  }
  return config;
});

const _axios = (config = {}, opts = {}) =>
  instance(config)
    .then(res => {
      opts.info && message.info(opts.info);
      return res.data;
    })
    .catch(err => {
      if (err.response && err.response.data && err.response.data.code) {
        const { code, message: _msg } = err.response.data;
        if ([401002, 401003, 401004].includes(code)) {
          location.pathname = "/login";
        }
        message.error(_msg);
      } else {
        message.error("网络错误，请稍后再试");
      }
    });
export default _axios;
