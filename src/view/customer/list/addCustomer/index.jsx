import React, { useState } from "react";
import { Modal, Form, Input, Icon, Select, Checkbox, Button } from "antd";

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

const AddCustomer = ({ onAddCus, onCancel, form, user }) => {
  const [submitLoading, setSubmitLoading] = useState(false);
  const { getFieldDecorator, validateFieldsAndScroll } = form;

  const onSubmit = () => {
    validateFieldsAndScroll(async (err, data) => {
      if (err) return;
      data.mark || delete data.mark;
      data.mobile_verify = data.mobile_verify ? data.mobile_verify[0] : "off";
      data.priority = data.priority ? data.priority[0] : "normal";
      setSubmitLoading(true);

      try {
        await onAddCus(data);
      } catch (err) {
      } finally {
        onCancel();
        setSubmitLoading(false);
      }
    });
  };

  return (
    <Modal
      title={`添加客户`}
      visible={true}
      onCancel={onCancel}
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
        <Item label="客户名" {...formItemLayout}>
          {getFieldDecorator("name", {
            rules: [
              {
                required: true,
                message: "请输入客户名"
              }
            ]
          })(
            <Input prefix={<Icon type="mail" />} placeholder="请输入客户邮箱" />
          )}
        </Item>
        <Item label="客户邮箱" {...formItemLayout}>
          {getFieldDecorator("email", {
            rules: [
              {
                required: true,
                message: "请输入客户邮箱"
              },
              {
                type: "email",
                message: "请输入正确的邮箱格式"
              }
            ]
          })(
            <Input prefix={<Icon type="mail" />} placeholder="请输入客户邮箱" />
          )}
        </Item>
        <Item label="负责人" {...formItemLayout}>
          {getFieldDecorator("support", {
            initialValue: user.name
          })(<Input prefix={<Icon type="user" />} />)}
        </Item>
        <Item label="状态" {...formItemLayout}>
          {getFieldDecorator("status", {
            initialValue: "test",
            rules: [
              {
                required: true
              }
            ]
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
        <Item label="类型" {...formItemLayout}>
          {getFieldDecorator("type", {
            rules: [
              {
                required: true
              }
            ],
            initialValue: "enterprise"
          })(
            <Select>
              <Select.Option value="enterprise">客户</Select.Option>
              <Select.Option value="internal">内部</Select.Option>
            </Select>
          )}
        </Item>
        <Item label="备注" {...formItemLayout}>
          {getFieldDecorator("mark", {})(
            <Input prefix={<Icon type="book" />} />
          )}
        </Item>
        <Item label="星标客户" {...formItemLayout}>
          {getFieldDecorator("priority", {})(
            <Checkbox.Group>
              <Checkbox value="high">
                （若勾选，此客户的报警会得到重点关注）
              </Checkbox>
            </Checkbox.Group>
          )}
        </Item>
        <Item label="手机登录" {...formItemLayout}>
          {getFieldDecorator("mobile_verify", {})(
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

export default Form.create()(AddCustomer);
