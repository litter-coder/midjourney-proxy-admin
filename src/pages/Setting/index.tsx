import React, {useEffect, useState} from 'react';
import {getConfig, updateConfig} from '@/services/mj/api';
import {QuestionCircleOutlined, SaveOutlined} from '@ant-design/icons';
import {PageContainer} from '@ant-design/pro-components';
import {useIntl} from '@umijs/max';
import {
  Alert,
  Button,
  Card,
  Col,
  Form,
  Input, InputNumber,
  message,
  Row,
  Select,
  Space,
  Spin,
  Tooltip,
} from 'antd';
import JsonEditor from '@/components/JsonEditor';

const Setting: React.FC = () => {
  const [form] = Form.useForm();
  const intl = useIntl();
  const [loading, setLoading] = useState(false);
  const [allConfig, setAllConfig] = useState({}); // 用于存储所有配置

  const loadData = () => {
    setLoading(true);
    getConfig().then((res) => {
      setLoading(false);
      if (res.code === 1) {
        const config = res.result;
        setAllConfig(config); // 存储所有配置
        form.setFieldsValue({
          ...config.proxyProperties,
          ...config.springProperties,
          taskStoreType: config.proxyProperties.taskStore?.type, // 展平 taskStore.type
        });
      }
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const onFinish = () => {
    form
      .validateFields()
      .then((values) => {
        const updatedProxyProperties = {
          ...allConfig.proxyProperties,
          ...values,
          taskStore: {
            ...allConfig.proxyProperties.taskStore,
            type: values.taskStoreType, // 重新组合 taskStore.type
          },
        };
        const updatedSpringProperties = {
          ...allConfig.springProperties,
          ...values,
        };
        setLoading(true);
        updateConfig({
          proxyProperties: updatedProxyProperties,
          springProperties: updatedSpringProperties,
        }).then((res) => {
          setLoading(false);
          if (res.code === 1) {
            message.success(intl.formatMessage({id: 'pages.setting.saveSuccess'}));
            loadData();
          } else {
            message.error(res.description || intl.formatMessage({id: 'pages.setting.error'}));
          }
        });
      })
      .catch(() => {
        message.error(intl.formatMessage({id: 'pages.setting.error'}));
      });
  };

  return (
    <PageContainer>
      <Form
        form={form}
        labelAlign="left"
        layout="horizontal"
        labelCol={{span: 6}}
        wrapperCol={{span: 18}}
      >
        <Spin spinning={loading}>
          <Space style={{marginBottom: '10px', display: 'flex', justifyContent: 'space-between'}}>
            <Alert
              type="info"
              style={{paddingTop: '4px', paddingBottom: '4px'}}
              description={intl.formatMessage({id: 'pages.setting.tips'})}
            />
            <Space>
              <Button loading={loading} icon={<SaveOutlined/>} type={'primary'} onClick={onFinish}>
                {intl.formatMessage({id: 'pages.setting.save'})}
              </Button>
            </Space>
          </Space>

          <Row gutter={16}>
            <Col span={12}>
              <Card
                title={intl.formatMessage({id: 'pages.settings.base'})}
                bordered={false}
              >
                <Form.Item
                  label={intl.formatMessage({id: 'pages.setting.username'})}
                  name="username"
                >
                  <Input/>
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({id: 'pages.setting.password'})}
                  name="password"
                >
                  <Input/>
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({id: 'pages.setting.apiSecret'})}
                  name="apiSecret"
                >
                  <Input/>
                </Form.Item>
                <Form.Item
                  label={
                    <span>
                      {intl.formatMessage({id: 'pages.setting.translate'})}
                      <Tooltip title={intl.formatMessage({id: 'pages.setting.translateTooltip'})}>
                        <QuestionCircleOutlined style={{marginLeft: 5}}/>
                      </Tooltip>
                    </span>
                  }
                  name="translateWay"
                >
                  <Select allowClear>
                    <Select.Option value="NULL">不翻译</Select.Option>
                    <Select.Option value="BAIDU">BAIDU</Select.Option>
                    <Select.Option value="GPT">GPT</Select.Option>
                    <Select.Option value="DEEPL">DEEPL</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  label={
                    <span>
                      {intl.formatMessage({id: 'pages.setting.translateZhWay'})}
                      <Tooltip title={intl.formatMessage({id: 'pages.setting.translateZhWayTooltip'})}>
                        <QuestionCircleOutlined style={{marginLeft: 5}}/>
                      </Tooltip>
                    </span>
                  }
                  name="translateZhWay"
                >
                  <Select allowClear>
                    <Select.Option value="NULL">不翻译</Select.Option>
                    <Select.Option value="BAIDU">BAIDU</Select.Option>
                    <Select.Option value="GPT">GPT</Select.Option>
                    <Select.Option value="GPT">DEEPL</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({id: 'pages.setting.baiduTranslate'})}
                  name="baiduTranslate"
                >
                  <JsonEditor/>
                </Form.Item>
                <Form.Item label={intl.formatMessage({id: 'pages.setting.openai'})} name="openai">
                  <JsonEditor/>
                </Form.Item>
                <Form.Item label={intl.formatMessage({id: 'pages.setting.deepl'})} name="deeplTranslate">
                  <JsonEditor/>
                </Form.Item>
                <Form.Item label={
                  <span>
                    {intl.formatMessage({id: 'pages.setting.ngDiscord'})}
                    <Tooltip title={intl.formatMessage({id: 'pages.setting.ngDiscordTooltip'})}>
                      <QuestionCircleOutlined style={{marginLeft: 5}}/>
                    </Tooltip>
                  </span>
                } name="ngDiscord">
                  <JsonEditor/>
                </Form.Item>
                <Form.Item
                  label={
                    <span>
                      {intl.formatMessage({id: 'pages.setting.adminImagePrefix'})}
                      <Tooltip title={intl.formatMessage({id: 'pages.setting.adminImagePrefixTooltip'})}>
                        <QuestionCircleOutlined style={{marginLeft: 5}}/>
                      </Tooltip>
                    </span>
                  }
                  name="adminImagePrefix"
                >
                  <Input/>
                </Form.Item>
                <Form.Item
                  label={
                    <span>
                      {intl.formatMessage({id: 'pages.setting.cdnRefreshed'})}
                      <Tooltip title={intl.formatMessage({id: 'pages.setting.cdnRefreshedTooltip'})}>
                        <QuestionCircleOutlined style={{marginLeft: 5}}/>
                      </Tooltip>
                    </span>}
                  name="cdnRefreshed"
                >
                  <Select allowClear>
                    <Select.Option value={false}>关闭</Select.Option>
                    <Select.Option value={true}>开启</Select.Option>
                  </Select>
                </Form.Item>
              </Card>
            </Col>
            <Col span={12}>
              <Card
                title={intl.formatMessage({id: 'pages.settings.core'})}
                bordered={false}
              >
                <Form.Item
                  label={intl.formatMessage({id: 'pages.setting.accountStoreType'})}
                  name="accountStoreType"
                >
                  <Select allowClear>
                    <Select.Option value="IN_MEMORY">内存</Select.Option>
                    <Select.Option value="REDIS">Redis</Select.Option>
                    <Select.Option value="MYSQL">Mysql</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({id: 'pages.setting.taskStore'})}
                  name="taskStoreType"
                >
                  <Select allowClear>
                    <Select.Option value="IN_MEMORY">内存</Select.Option>
                    <Select.Option value="REDIS">Redis</Select.Option>
                    <Select.Option value="MYSQL">Mysql</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({id: 'pages.setting.accountChooseRule'})}
                  name="accountChooseRule"
                >
                  <Select allowClear>
                    <Select.Option value="RoundRobinRule">轮询策略</Select.Option>
                    <Select.Option value="BestWaitIdleRule">最少等待空闲策略</Select.Option>
                    <Select.Option value="WeightedRandomRule">加权随机策略</Select.Option>
                  </Select>
                </Form.Item>
                <Form.Item
                  label={
                    <span>
                      {intl.formatMessage({id: 'pages.setting.accountSyncCron'})}
                      <Tooltip title={intl.formatMessage({id: 'pages.setting.accountSyncCronTooltip'})}>
                        <QuestionCircleOutlined style={{marginLeft: 5}}/>
                      </Tooltip>
                    </span>
                  }
                  name="accountSyncCron"
                >
                  <Input/>
                </Form.Item>
                <Form.Item
                  label={intl.formatMessage({id: 'pages.setting.redis'})}
                  name="redis"
                >
                  <JsonEditor/>
                </Form.Item>
                <Form.Item
                  label={
                    <span>
                      {intl.formatMessage({id: 'pages.setting.datasource'})}
                      <Tooltip title={intl.formatMessage({id: 'pages.setting.datasourceTooltip'})}>
                        <QuestionCircleOutlined style={{marginLeft: 5}}/>
                      </Tooltip>
                    </span>
                  }
                  name="datasource"
                >
                  <JsonEditor/>
                </Form.Item>
                <Form.Item
                  label={
                    <span>
                      {intl.formatMessage({id: 'pages.setting.notifyHook'})}
                      <Tooltip title={intl.formatMessage({id: 'pages.setting.notifyHookTooltip'})}>
                        <QuestionCircleOutlined style={{marginLeft: 5}}/>
                      </Tooltip>
                    </span>}
                  name="notifyHook"
                >
                  <Input/>
                </Form.Item>
                <Form.Item
                  label={
                    <span>
                      {intl.formatMessage({id: 'pages.setting.notifyPoolSize'})}
                      <Tooltip title={intl.formatMessage({id: 'pages.setting.notifyPoolSizeTooltip'})}>
                        <QuestionCircleOutlined style={{marginLeft: 5}}/>
                      </Tooltip>
                    </span>}
                  name="notifyPoolSize"
                >
                  <InputNumber/>
                </Form.Item>
              </Card>
            </Col>
          </Row>
        </Spin>
      </Form>
    </PageContainer>
  );
};

export default Setting;
