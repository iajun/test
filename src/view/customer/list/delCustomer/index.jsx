import React, { useState } from "react";
import { Modal, Button, Icon } from "antd";

const DelCustomer = ({ customer, onDelCus, onCancel }) => {
  const [submitLoading, setSubmitLoading] = useState(false);

  const onSubmit = () => {
    setSubmitLoading(true);
    onDelCus(customer.customer_id);
    onCancel();
  };
  return (
    <Modal
      visible={true}
      onOk={onSubmit}
      onCancel={onCancel}
      type="confirm"
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          onClick={onSubmit}
          loading={submitLoading}
        >
          确认
        </Button>
      ]}
    >
      <div>
        <Icon
          className="alert"
          type="question-circle"
          style={{ color: "red" }}
        />
        <span className="content">
          确定删除客户 <b>{customer.name}</b> 吗
        </span>
      </div>
    </Modal>
  );
};

export default DelCustomer;
