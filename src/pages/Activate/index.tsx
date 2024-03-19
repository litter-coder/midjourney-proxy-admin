import { PageContainer } from '@ant-design/pro-components';
import {
  Card, Result, Input, Button, Steps, Typography, Flex, Space, message
} from 'antd';
import React, { useState, useEffect } from 'react';
import { FilePdfOutlined, ExperimentOutlined } from '@ant-design/icons';
import { getMachineCode, activateByCode } from '@/services/mj/api';
import { useIntl } from '@umijs/max';

const { Paragraph } = Typography;

const Activate: React.FC = () => {
  const [active, setActive] = useState(sessionStorage.getItem('mj-active') === 'true');
  const [step, setStep] = useState(0);
  const [machineCode, setMachineCode] = useState('');
  const [code, setCode] = useState('');
  const [submitLoading, setsubmitLoading] = useState(false);
  const intl = useIntl();

  useEffect(() => {
    if (!active) {
      getMachineCode().then((res) => {
        setMachineCode(res);
      });
    }
  });

  const getPanel = () => {
    if (active) {
      return <Result
        status="success"
        title={intl.formatMessage({ id: 'pages.activate.actived' })}
        subTitle={intl.formatMessage({ id: 'pages.activate.activedTip' })}
        extra={[
          <Button type="primary" key="draw" onClick={() => location.hash = '#/draw-test'}
            icon={<ExperimentOutlined />}
          >{intl.formatMessage({ id: 'pages.activate.drawTest' })}</Button>,
          <Button key="api-doc" onClick={() => location.href = '/doc'}
            icon={<FilePdfOutlined />}
          >{intl.formatMessage({ id: 'pages.activate.apiDoc' })}</Button>,
        ]}
      />
    }
    return <><Result
      status="warning"
      title={intl.formatMessage({ id: 'pages.activate.unactiveTip' })}
    /><Steps
        size="small"
        current={step}
        items={[
          { title: intl.formatMessage({ id: 'pages.activate.copyCode' }) },
          { title: intl.formatMessage({ id: 'pages.activate.getActivationCode' }) },
          { title: intl.formatMessage({ id: 'pages.activate.activate' }) },
        ]}
      />
      <Card style={{ marginTop: '20px' }}>
        {getStepPanel()}
      </Card>
    </>
  };

  const getStepPanel = () => {
    if (step == 0) {
      return <Flex vertical>
        <Paragraph copyable strong>{machineCode}</Paragraph>
        <span>{intl.formatMessage({ id: 'pages.activate.copyThen' }) } <Button type="primary" onClick={() => setStep(1)}>{intl.formatMessage({ id: 'pages.activate.next' }) }</Button></span>
      </Flex>;
    } else if (step == 1) {
      return <Flex vertical>
        <span style={{ marginBottom: '20px', fontSize: '15px', fontWeight: '500' }}>{intl.formatMessage({ id: 'pages.activate.sendCodeAndGet' }) }</span>
        <Space>
          <Button onClick={() => setStep(0)}>{intl.formatMessage({ id: 'pages.activate.previous' }) }</Button>
          <Button type="primary" onClick={() => setStep(2)}>{intl.formatMessage({ id: 'pages.activate.next' }) }</Button>
        </Space>
      </Flex>;
    } else {
      return <Flex vertical>
        <Space>
          <Button onClick={() => setStep(1)}>{intl.formatMessage({ id: 'pages.activate.previous' }) }</Button>
        </Space>
        <Space.Compact style={{ width: '100%', marginTop: '20px' }}>
          <Input placeholder={intl.formatMessage({ id: 'pages.activate.inputCode' }) } value={code} onChange={handleCodeChange} onPressEnter={submit} />
          <Button type="primary" onClick={submit} loading={submitLoading}>{intl.formatMessage({ id: 'pages.activate.activeService' })}</Button>
        </Space.Compact>
      </Flex>;
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };

  const submit = async () => {
    if (!code) {
      message.error(intl.formatMessage({ id: 'pages.activate.inputCode' }));
      return;
    }
    setsubmitLoading(true);
    const res = await activateByCode(code);
    setsubmitLoading(false);
    if (res.startsWith('success')) {
      setActive(true);
      setCode('');
      sessionStorage.setItem('mj-active', 'true');
    } else {
      message.error(res);
    }
  };

  return (
    <PageContainer>
      <Card>
        {getPanel()}
      </Card>
    </PageContainer>
  );
};

export default Activate;
