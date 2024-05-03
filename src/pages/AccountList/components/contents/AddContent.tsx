import { Card, Col, Form, FormInstance, Input, InputNumber, Switch, Row } from 'antd';
import { useEffect } from 'react';
const { TextArea } = Input;
import { useIntl } from '@umijs/max';

const AddContent = ({
  form,
  onSubmit,
}: {
  form: FormInstance;
  onSubmit: (values: any) => void;
}) => {
  const intl = useIntl();
  // 使用 useEffect 来在组件挂载时设置表单的初始值
  useEffect(() => {
    form.setFieldsValue({
      userAgent:
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36',
      coreSize: 3,
      queueSize: 10,
      timeoutMinutes: 5,
    });
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
          <Card type="inner" title={intl.formatMessage({ id: 'pages.account.info' })}>
            <Form.Item
              label={intl.formatMessage({ id: 'pages.account.guildId' })}
              name="guildId"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label={intl.formatMessage({ id: 'pages.account.channelId' })}
              name="channelId"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label={intl.formatMessage({ id: 'pages.account.userToken' })}
              name="userToken"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              label={intl.formatMessage({ id: 'pages.account.mjChannelId' })}
              name="mjBotChannelId"
            >
              <Input />
            </Form.Item>
            <Form.Item
              label={intl.formatMessage({ id: 'pages.account.nijiChannelId' })}
              name="nijiBotChannelId"
            >
              <Input />
            </Form.Item>
            <Form.Item label="User Agent" name="userAgent">
              <Input />
            </Form.Item>
            <Form.Item label={intl.formatMessage({ id: 'pages.account.remixAutoSubmit' })} name="remixAutoSubmit" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Card>
        </Col>
        <Col span={12}>
          <Card type="inner" title={intl.formatMessage({ id: 'pages.account.otherInfo' })}>
            <Form.Item label={intl.formatMessage({ id: 'pages.account.coreSize' })} name="coreSize">
              <InputNumber min={1} />
            </Form.Item>
            <Form.Item label={intl.formatMessage({ id: 'pages.account.queueSize' })} name="queueSize">
              <InputNumber min={1} />
            </Form.Item>
            <Form.Item label={intl.formatMessage({ id: 'pages.account.timeoutMinutes' })} name="timeoutMinutes">
              <InputNumber min={1} suffix={intl.formatMessage({ id: 'pages.minutes' })} />
            </Form.Item>
            <Form.Item label={intl.formatMessage({ id: 'pages.account.remark' })} name="remark">
              <TextArea rows={3} />
            </Form.Item>
          </Card>
        </Col>
      </Row>
    </Form>
  );
};

export default AddContent;
