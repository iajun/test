import React, { useState } from "react";
import {
  Modal,
  DatePicker,
  Form,
  Input,
  Icon,
  Select,
  Tooltip,
  message,
  Checkbox,
  Button
} from "antd";
import { diffObj } from "@util/tools";
import styles from "./index.module.scss";
import moment from "moment";

const Item = Form.Item;

const formItemLayout = {
  labelCol: {
    xs: {
      span: 24
    },
    sm: {
      span: 6
    }
  },
  wrapperCol: {
    xs: {
      span: 24
    },
    sm: {
      span: 14
    }
  }
};

const EditLicense = ({
  customer,
  defaultModules,
  form,
  onCancel,
  onEditLcs
}) => {
  const { getFieldDecorator, validateFieldsAndScroll } = form;

  const [submitLoading, setSubmitLoading] = useState(false);
  console.log("lcs render");
  const moduleMap = new Map();

  const onSubmit = () => {
    validateFieldsAndScroll(async (err, data) => {
      if (err) return;
      data.license_etime = data.license_etime.format("YYYY-MM-DD 23:59:59");
      const reqData = diffObj(data, customer);
      if (JSON.stringify(reqData) === "{}") {
        message.warning("请编辑后提交");
      }
      data.license_version = data.license_version.reduce((prev, mod) => {
        return prev + +moduleMap.get(mod);
      }, 0);
      setSubmitLoading(true);
      await onEditLcs(customer.customer_id, data);
      onCancel();
    });
  };

  const etime = moment(customer.license_etime, "YYYY-MM-DD h:mm:ss");
  const initialEtime = etime.isValid() ? etime : moment();

  return (
    <Modal
      title={`更新 License： ${customer.name}`}
      visible={true}
      onCancel={onCancel}
      onOk={onSubmit}
      className={styles["modal"]}
      footer={[
        <Button key="back" onClick={onCancel}>
          取消
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={submitLoading}
          onClick={onSubmit}
        >
          确认
        </Button>
      ]}
    >
      <Form>
        <Item label="到期时间" {...formItemLayout}>
          {getFieldDecorator("license_etime", {
            initialValue: initialEtime
          })(<DatePicker />)}
        </Item>
        <Item label="类型" {...formItemLayout}>
          {getFieldDecorator("license_status", {
            initialValue: customer.license_status
          })(
            <Select style={{ width: 150 }}>
              <Select.Option value="1">试用</Select.Option>
              <Select.Option value="2">企业</Select.Option>
            </Select>
          )}
        </Item>
        <Item label="选择已购模块" {...formItemLayout}>
          {getFieldDecorator("license_version", {
            initialValue: [...new Set([...customer.module, "实时引擎"])]
          })(
            <Checkbox.Group style={{ width: "100%" }}>
              <div className={styles["module"]}>
                {Object.keys(defaultModules).map(item => {
                  moduleMap.set(item, defaultModules[item]);
                  const num = defaultModules[item];
                  const isRealTime = num == "16";
                  return (
                    <p key={item}>
                      <Checkbox value={item} disabled={isRealTime}>
                        {item}
                      </Checkbox>
                    </p>
                  );
                })}
              </div>
            </Checkbox.Group>
          )}
        </Item>
      </Form>
    </Modal>
  );
};

export default Form.create()(EditLicense);
