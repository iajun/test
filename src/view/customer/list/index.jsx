import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import {
  apiGetCustomerList,
  apiUpdateCustomer,
  apiUpdateCustomerLicense,
  apiDeleteCustomer,
  apiAddCustomer
} from "@api/index";
import CustomerTable from "./table";

const CustomerList = () => {
  const customerData = useSelector(state => state.customer);
  return (
    <div>
      <CustomerTable data={customerData.data} />
    </div>
  );
};

export default CustomerList;
