import {
  SET_PROXY_LIST,
  SET_PROXY_LIST_LOADING,
  DELETE_PROXY,
  UPDATE_PROXY
} from "../action-type";
import { apiGetProxyList, apiDelProxy, apiUpdateProxy } from "@api";

export const setProxyList = () => async dispatch => {
  dispatch({ type: SET_PROXY_LIST_LOADING });
  apiGetProxyList().then(res => {
    dispatch({
      type: SET_PROXY_LIST,
      proxyList: res
    });
  });
};

export const delProxy = () => async dispatch => {
  apiDelProxy(name).then(ret => {
    dispatch({
      type: DELETE_PROXY,
      name: name
    });
  });
};

export const updateProxy = data => async dispatch => {
  apiUpdateProxy(data).then(ret => {
    dispatch({
      type: UPDATE_PROXY,
      data
    });
  });
};

//   export const updateCustomer = (lid, data) => async dispatch => {
//     let ret = await apiUpdateCustomer(lid, data);
//     dispatch({
//       type: UPDATE_CUSTOMER_INFO,
//       lid,
//       data
//     });
//     return ret;
//   };

//   export const delCustomer = lid => async dispatch => {
//     let ret = await apiDeleteCustomer(lid);
//     dispatch({
//       type: DELETE_CUSTOMER,
//       lid
//     });
//     return ret;
//   };
