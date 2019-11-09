/*
 * @Author: Sharp
 * @LastEditors: Please set LastEditors
 * @LastEditTime: 2019-10-24 11:18:29
 */
import Cookies from "universal-cookie";
import "whatwg-fetch";
import domain from "./domain";

const cookies = new Cookies();
const request = (url, method, data = {}, fetchObj = {}, headers = {}, type) => {
  const keys = Object.keys(data);
  const params =
    keys.length !== 0
      ? `?${keys.map(key => `${key}=${data[key]}`).join("&")}`
      : "";
  const fullUrl = `${domain}/v1${url}`;
  const body = type && type == "file" ? fetchObj : JSON.stringify(fetchObj);

  if (cookies && cookies.get("access_token")) {
    headers["Authorization"] = `access_token ${cookies.get("access_token")}`;
  }

  if (method == "get") {
    return fetch(`${fullUrl}${params}`, {
      method,
      credentials: "omit", // omit 忽略cookies，same-origin 同源带cookies， include可跨域带cookies
      mode: "cors",
      headers
    })
      .then(response => response.json())
      .then(responseJson => {
        if (!!responseJson) {
          if (
            (responseJson.code && responseJson.code == "401002") ||
            responseJson.code == "401003" ||
            responseJson.code == "401004"
          ) {
            localStorage.removeItem("userinfo");
            cookies.remove("access_token");
            // location.hash = "/login";
          }
        }
        return responseJson;
      })
      .catch(error => {
        console.error(error);
      });
  } else if (method == "export") {
    window.open(
      `${fullUrl}${params}` +
        (keys.length !== 0
          ? `&access_token=${cookies.get("access_token")}`
          : `?access_token=${cookies.get("access_token")}`)
    );
  } else {
    return fetch(`${fullUrl}${params}`, {
      method,
      credentials: "omit", // omit 忽略cookies，same-origin 同源带cookies， include可跨域带cookies
      mode: "cors",
      headers,
      body
    })
      .then(response => response.json())
      .then(responseJson => {
        if (!!responseJson) {
          if (
            (responseJson &&
              responseJson.code &&
              responseJson.code == "401002") ||
            responseJson.code == "401003" ||
            responseJson.code == "401004"
          ) {
            localStorage.removeItem("userinfo");
            cookies.remove("access_token");
            // location.hash = "/login";
          }
        }
        return responseJson;
      })
      .catch(error => {
        console.error(error);
      });
  }
};

export default request;
