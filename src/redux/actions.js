import { SET_CUSTOMER_LIST, SET_USER } from "./action-type";
import { apiGetCustomerList, apiGetUser } from "@api/service";

export const setCustomerList = () => dispatch =>
  apiGetCustomerList().then(res => {
    dispatch({
      type: SET_CUSTOMER_LIST,
      payload: res
    });
  });

export const setUser = () => dispatch =>
  apiGetUser().then(res => {
    dispatch({
      type: SET_USER,
      payload: res
    });
  });
