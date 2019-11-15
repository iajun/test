import React, { useState } from "react";
import {
  Modal,
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

const EditCustomer = ({ customer, form, onCancel, onEditCus }) => {
  const { getFieldDecorator, validateFieldsAndScroll } = form;

  const [submitLoading, setSubmitLoading] = useState(false);
  console.log("edit render");

  const typeTilte = type => (
    <span>
      类型
      {type === "internal" && (
        <Tooltip title="内部：主要是开发调试等内部使用的">
          <Icon
            style={{ marginLeft: "5px", fontSize: 12 }}
            type="question-circle"
          />
        </Tooltip>
      )}
    </span>
  );

  const onSubmit = () => {
    validateFieldsAndScroll((err, data) => {
      if (err) return;
      if (!(data.mobile_verify = data.mobile_verify[0])) {
        data.mobile_verify = "off";
      }

      if (!(data.priority = data.priority[0])) {
        data.priority = "normal";
      }
      let reqData = diffObj(data, customer);
      if (JSON.stringify(reqData) === "{}") {
        return message.warning("请先修改后提交");
      }
      setSubmitLoading(true);
      onEditCus(customer.customer_id, reqData).then(ret => {
        setSubmitLoading(false);

        if (ret) {
          onCancel();
        }
      });
    });
  };

  return (
    <Modal
      title={`修改： ${customer.name}`}
      visible={true}
      onCancel={onCancel}
      onOk={onSubmit}
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
        <Item label="邮箱" {...formItemLayout}>
          {getFieldDecorator("email", {
            rules: [
              {
                required: false,
                message: "请输入客户邮箱"
              },
              {
                type: "email",
                message: "请输入正确的邮箱格式"
              }
            ],
            initialValue: customer.email
          })(
            <Input prefix={<Icon type="mail" />} placeholder="请输入客户邮箱" />
          )}
        </Item>
        <Item label="状态" {...formItemLayout}>
          {getFieldDecorator("status", {
            initialValue: customer.status
          })(
            <Select>
              <Select.Option value="test">测试</Select.Option>
              <Select.Option value="experience">体验</Select.Option>
              <Select.Option value="sign">签约</Select.Option>
              <Select.Option value="close">关闭</Select.Option>
              <Select.Option value="delay">商务中</Select.Option>
            </Select>
          )}
        </Item>
        <Item label={typeTilte(customer.type)} {...formItemLayout}>
          {getFieldDecorator("type", {
            rules: [
              {
                required: false
              }
            ],
            initialValue: customer.type
          })(
            <Select>
              <Select.Option value="enterprise">客户</Select.Option>
              <Select.Option value="internal">内部</Select.Option>
            </Select>
          )}
        </Item>
        <Item label="负责人" {...formItemLayout}>
          {getFieldDecorator("support", {
            initialValue: customer.support
          })(<Input prefix={<Icon type="user" />} />)}
        </Item>
        <Item label="备注" {...formItemLayout}>
          {getFieldDecorator("mark", {
            initialValue: customer.mark
          })(<Input prefix={<Icon type="book" />} />)}
        </Item>
        <Item label="星标客户" {...formItemLayout}>
          {getFieldDecorator("priority", {
            initialValue: [customer.priority]
          })(
            <Checkbox.Group>
              <Checkbox value="high">
                （若勾选，此客户的报警会得到重点关注）
              </Checkbox>
            </Checkbox.Group>
          )}
        </Item>
        <Item label="手机登录" {...formItemLayout}>
          {getFieldDecorator("mobile_verify", {
            initialValue: [customer.mobile_verify]
          })(
            <Checkbox.Group>
              <Checkbox value="on">
                （客户机 ATD 登录时是否需要手机验证）
              </Checkbox>
            </Checkbox.Group>
          )}
        </Item>
      </Form>
    </Modal>
  );
};

export default Form.create()(EditCustomer);
