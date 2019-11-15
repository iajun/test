import React, { useState, useCallback, useEffect } from "react";
import { useSelector, connect } from "react-redux";
import { delCustomer, setCustomerList } from "@redux/async-actions";

import {
  apiUpdateCustomerLicense,
  apiAddCustomer,
  apiUpdateCustomer
} from "@api";

import CustomerTable from "./table/Table";
import EditCustomer from "./editCustomer/EditCustomer";
import EditLicense from "./editLicense/EditLicense";
import DelCustomer from "./delCustomer";
import CustomerHeader from "./customerHeader";
import AddCustomer from "./addCustomer";

const CustomerList = ({ delCustomer, setCustomerList }) => {
  const customerData = useSelector(state => state.customer);
  const user = useSelector(state => state.user);

  let closedCustomerData = [];
  let notClosedCustomerData = [];

  customerData.data.forEach(customer => {
    const { status } = customer;
    status === "close"
      ? closedCustomerData.push(customer)
      : notClosedCustomerData.push(customer);
  });

  const [editCusVisible, setEditCusVisbile] = useState(false); // 编辑客户 Modal 显示与隐藏
  const [editLcsVisible, setEditLcsVisbile] = useState(false); // 编辑客户 License Modal 显示与隐藏
  const [delCusVisible, setDelCusVisible] = useState(false); // 删除客户 Modal 显示与隐藏
  const [addCusVisible, setAddCusVisible] = useState(false); // 添加 Modal 显示与隐藏
  const [customerTableData, setCustomerTableData] = useState([]); // 客户列表数据
  const [filters, setFilters] = useState(new Map()); // 列表过滤条件
  const [curCus, setCurCus] = useState({}); // 当前操作客户

  // 过滤算法集合
  const filterMethodMap = new Map([
    [
      ["ctime"],
      (customerData, timeRange, key) => {
        return customerData.filter(cus => {
          if (timeRange[0] <= cus[key] && cus[key] <= timeRange[1]) {
            return cus;
          }
        });
      }
    ],
    [
      ["license_status"],
      (customerData, val, key) => {
        return customerData.filter(cus => {
          if (cus[key] === val) {
            return cus;
          }
        });
      }
    ],
    [
      "status",
      (customerData, val, key) => {
        if (status === "close") {
          return closedCustomerData;
        } else {
          return customerData.filter(cus => {
            if (cus[key] === val) {
              return cus;
            }
          });
        }
      }
    ],
    [
      ["name"],
      (customerData, val, key) => {
        return customerData.filter(cus => {
          if (~cus[key].indexOf(val)) {
            return cus;
          }
        });
      }
    ]
  ]);

  // 挂载时初始全部列表数据
  useEffect(() => {
    setCustomerTableData(notClosedCustomerData);
  }, [customerData]);

  // 删除客户提交
  const onDelCus = useCallback(async lid => delCustomer(lid), []);

  // 添加客户提交
  const onAddCus = useCallback(async data => {
    const ret = await apiAddCustomer(data);
    setCustomerList();
    return ret;
  }, []);

  // 编辑客户提交
  const onEditCus = useCallback(async (lid, data) => {
    const ret = await apiUpdateCustomer(lid, data);
    setCustomerList();
    return ret;
  }, []);

  // 编辑客户License提交
  const onEditLcs = useCallback(async (lid, data) => {
    const ret = await apiUpdateCustomerLicense(lid, data);
    setCustomerList();
    return ret;
  }, []);

  // 增加过滤条件，过滤数据
  const onAddFilter = useCallback(
    filter => {
      const key = [...filterMethodMap].filter(v => {
        return v[0].includes(filter.key);
      })[0];

      if (key === void 0 || key[1] === void 0) {
        throw new Error("过滤类型不正确");
      }
      filters.set(filter.key, [filter.value, filter.text, key[1]]);
      onCloseFilter("");
    },
    [filters, customerTableData]
  );

  // 关闭过滤器，过滤数据
  const onCloseFilter = useCallback(
    key => {
      key === "all" ? filters.clear() : filters.delete(key);
      let tableData = notClosedCustomerData;
      if (filters.size !== 0) {
        for (const [fk, fv] of filters.entries()) {
          tableData = fv[2](tableData, fv[0], fk);
        }
      }
      setCustomerTableData(tableData);
    },
    [filters, notClosedCustomerData]
  );

  console.log("index render");
  return (
    <div>
      <CustomerHeader
        onAddCus={() => setAddCusVisible(true)}
        filters={filters}
        onCloseFilter={onCloseFilter}
      />
      <CustomerTable
        data={customerTableData}
        loading={customerData.getListLoading}
        onEditCus={() => setEditCusVisbile(true)}
        onEditLcs={() => setEditLcsVisbile(true)}
        onDelCus={() => setDelCusVisible(true)}
        onSetCurCus={cus => setCurCus(cus)}
        onAddFilter={onAddFilter}
      />
      {editCusVisible && (
        <EditCustomer
          customer={curCus}
          onEditCus={onEditCus}
          onCancel={() => setEditCusVisbile(false)}
        />
      )}
      {editLcsVisible && (
        <EditLicense
          customer={curCus}
          onCancel={() => setEditLcsVisbile(false)}
          onEditLcs={onEditLcs}
          defaultModules={customerData.module}
        />
      )}
      {delCusVisible && (
        <DelCustomer
          customer={curCus}
          onCancel={() => setDelCusVisible(false)}
          onDelCus={onDelCus}
        />
      )}
      {addCusVisible && (
        <AddCustomer
          customer={curCus}
          user={user}
          onCancel={() => setAddCusVisible(false)}
          onAddCus={onAddCus}
        />
      )}
    </div>
  );
};

export default connect(null, dispatch => ({
  delCustomer: lid => dispatch(delCustomer(lid)),
  setCustomerList: () => dispatch(setCustomerList())
}))(CustomerList);
