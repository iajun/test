import { SET_CUSTOMER_LIST } from "../action-type";
import { apiGetCustomerList } from "@api";

export const setCustomerList = () => dispatch => {
  return apiGetCustomerList().then(res => {
    dispatch({
      type: SET_CUSTOMER_LIST,
      payload: res
    });
  });
};
