import { combineReducers } from "redux";
import { SET_CUSTOMER_LIST, SET_USER } from "./action-type";

const initialCustomer = { data: [], module: {} };
const initialUser = {};

function customer(state = initialCustomer, action) {
  switch (action.type) {
    case SET_CUSTOMER_LIST:
      return action.payload;
    default:
      return state;
  }
}

function user(state = initialUser, action) {
  switch (action.type) {
    case SET_USER:
      return action.payload;
    default:
      return state;
  }
}

export default combineReducers({ customer, user });
