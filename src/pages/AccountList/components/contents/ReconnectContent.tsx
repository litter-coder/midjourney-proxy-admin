import { Card, Form, FormInstance, Input, Switch } from 'antd';
import { useEffect } from 'react';

const ReconnectContent = ({
  form,
  onSubmit,
  record,
}: {
  form: FormInstance;
  onSubmit: (values: any) => void;
  record: Record<string, any>;
}) => {
  // 当组件挂载或者record更新时，设置表单的初始值
  useEffect(() => {
    form.setFieldsValue(record);
  });

  return (
    <Form
      form={form}
      labelAlign="left"
      layout="horizontal"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      onFinish={onSubmit}
    >
        <Card type="inner">
      <Form.Item label="id" name="id" hidden>
        <Input />
      </Form.Item>
      <Form.Item label="用户Token" name="userToken">
        <Input />
      </Form.Item>
      <Form.Item label="用户SessionId" name="sessionId">
        <Input />
      </Form.Item>
      <Form.Item label="用户UserAgent" name="userAgent">
        <Input />
      </Form.Item>
      <Form.Item label="是否可用" name="enable" valuePropName="checked">
        <Switch />
      </Form.Item>
      </Card>
    </Form>
  );
};

export default ReconnectContent;
