import {
  SET_CUSTOMER_LIST,
  SET_CUSTOMER_LIST_LOADING,
  UPDATE_CUSTOMER_INFO,
  DELETE_CUSTOMER
} from "../action-type";
import {
  apiGetCustomerList,
  apiUpdateCustomer,
  apiDeleteCustomer,
  apiAddCustomer,
  apiUpdateCustomerLicense
} from "@api";

export const setCustomerList = () => async dispatch => {
  dispatch({ type: SET_CUSTOMER_LIST_LOADING });
  apiGetCustomerList().then(res => {
    dispatch({
      type: SET_CUSTOMER_LIST,
      payload: res,
      notClosedCustomer: res.data.filter(({ status }) => status !== "close")
    });
  });
};

export const updateCustomer = (lid, data) => async dispatch => {
  let ret = await apiUpdateCustomer(lid, data);
  dispatch({
    type: UPDATE_CUSTOMER_INFO,
    lid,
    data
  });
  return ret;
};

export const delCustomer = lid => async dispatch => {
  let ret = await apiDeleteCustomer(lid);
  dispatch({
    type: DELETE_CUSTOMER,
    lid
  });
  return ret;
};
