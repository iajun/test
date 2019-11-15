import { combineReducers } from "redux";
import produce from "immer";
import * as types from "./action-type";

const initialCustomer = { data: [], module: {} };
const initialUser = {};
const initialProxy = { data: [], loading: false };

function customer(state = initialCustomer, action) {
  return produce(state, draft => {
    switch (action.type) {
      case types.SET_CUSTOMER_LIST:
        draft["data"] = action.payload.data;
        draft["module"] = action.payload.module;
        draft["normal"] = action.notClosedCustomer;
        draft["getListLoading"] = false;
        break;
      case types.UPDATE_CUSTOMER_INFO:
        state.data.forEach((cus, k) => {
          if (cus.customer_id === action.lid) {
            draft["data"][k] = { ...cus, ...action.data };
          }
        });
        break;
      case types.DELETE_CUSTOMER:
        draft["data"] = state.data.filter(
          ({ customer_id }) => customer_id !== action.lid
        );
        break;
      case types.SET_CUSTOMER_LIST_LOADING:
        draft["getListLoading"] = true;
        break;
    }
  });
}

function proxy(state = initialProxy, action) {
  return produce(state, draft => {
    switch (action.type) {
      case types.SET_PROXY_LIST:
        draft["data"] = action.proxyList;
        draft["loading"] = false;
        break;
      case types.UPDATE_PROXY:
        state.data.forEach((proxy, k) => {
          if (proxy.name === action.data.name) {
            draft["data"][k] = { ...proxy, ...action.data };
          }
        });
        break;
      case types.DELETE_PROXY:
        draft["data"] = state.data.filter(({ name }) => name !== action.name);
      case types.SET_PROXY_LIST_LOADING:
        draft["loading"] = true;
        break;
    }
  });
}

function user(state = initialUser, action) {
  switch (action.type) {
    case types.SET_USER:
      return action.payload;
    default:
      return state;
  }
}

export default combineReducers({ customer, user, proxy });
