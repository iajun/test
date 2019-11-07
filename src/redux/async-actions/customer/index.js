import { SET_CUSTOMER_LIST } from "./action-type";
import { apiGetCustomerList } from "@api/service";

export const setCustomerList = () => dispatch =>
  apiGetCustomerList().then(res => {
    dispatch({
      type: SET_CUSTOMER_LIST,
      payload: res
    });
  });
