import { SET_USER } from "./action-type";
import { apiGetUser } from "@api/service";

export const setUser = () => dispatch =>
  apiGetUser().then(res => {
    dispatch({
      type: SET_USER,
      payload: res
    });
  });
