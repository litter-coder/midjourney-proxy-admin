import { Card, Alert, Row, Col, Form, FormInstance, Input, Switch, InputNumber } from 'antd';
import { useEffect } from 'react';
const { TextArea } = Input;

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
      <Row gutter={16}>
        <Col span={12}>
          <Card type="inner" title="账号信息">
            <Form.Item label="id" name="id" hidden>
              <Input />
            </Form.Item>
            <Form.Item label="服务器ID" name="guildId" rules={[{ required: true, message: '请输入服务器ID' }]}>
              <Input />
            </Form.Item>
            <Form.Item label="频道ID" name="channelId" rules={[{ required: true, message: '请输入频道ID' }]}>
              <Input />
            </Form.Item>
            <Form.Item label="用户Token" name="userToken" rules={[{ required: true, message: '请输入用户Token' }]}>
              <Input />
            </Form.Item>
            <Form.Item label="MJ私信ID" name="mjBotChannelId">
              <Input />
            </Form.Item>
            <Form.Item label="niji私信ID" name="nijiBotChannelId">
              <Input />
            </Form.Item>
            <Form.Item label="用户UserAgent" name="userAgent">
              <Input />
            </Form.Item>
            <Form.Item label="是否可用" name="enable" valuePropName="checked">
              <Switch />
            </Form.Item>
            <Form.Item label="remix自动提交" name="remixAutoSubmit" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Card>
        </Col>
        <Col span={12}>
          <Card type="inner" title="其他信息">
            <Form.Item label="并发数" name="coreSize">
              <InputNumber min={1} max={12} />
            </Form.Item>
            <Form.Item label="等待队列" name="queueSize">
              <InputNumber min={1} />
            </Form.Item>
            <Form.Item label="任务超时时间" name="timeoutMinutes">
              <InputNumber min={1} suffix="分钟" />
            </Form.Item>
            <Form.Item label="备注说明" name="remark">
              <TextArea rows={3} />
            </Form.Item>
          </Card>
        </Col>
      </Row>
      <Alert message="注意：更新账号并重连后，该账号相关未完成的任务（未启动、已提交、窗口等待、执行中）将会丢失！" type="warning" style={{ marginTop: '10px' }} />
    </Form>
  );
};

export default ReconnectContent;
