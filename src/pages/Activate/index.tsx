import { PageContainer } from '@ant-design/pro-components';
import {
  Card, Result, Input, Button, Steps, Typography, Flex, Space, message
} from 'antd';
import React, { useState, useEffect } from 'react';
import { FilePdfOutlined, ExperimentOutlined } from '@ant-design/icons';
import { getMachineCode, activateByCode } from '@/services/mj/api';

const { Paragraph } = Typography;

const Activate: React.FC = () => {
  const [active, setActive] = useState(sessionStorage.getItem('mj-active') === 'true');
  const [step, setStep] = useState(0);
  const [machineCode, setMachineCode] = useState('');
  const [code, setCode] = useState('');
  const [submitLoading, setsubmitLoading] = useState(false);

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
        title="服务已激活"
        subTitle="可以正常维护账号、查看任务列表，提供midjourney api接口供外部调用；本系统的绘图测试页，提供了常用的绘图功能"
        extra={[
          <Button type="primary" key="draw" onClick={() => location.hash = '#/draw-test'}
            icon={<ExperimentOutlined />}
          >绘画测试</Button>,
          <Button key="api-doc" onClick={() => location.href = '/doc'}
            icon={<FilePdfOutlined />}
          >API文档</Button>,
        ]}
      />
    }
    return <><Result
      status="warning"
      title="尚未激活！请按照下述步骤，激活服务"
    /><Steps
        size="small"
        current={step}
        items={[
          { title: '复制机器码' },
          { title: '获取激活码' },
          { title: '激活' },
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
        <span>复制机器码后，点击 <Button type="primary" onClick={() => setStep(1)}>下一步</Button></span>
      </Flex>;
    } else if (step == 1) {
      return <Flex vertical>
        <span style={{ marginBottom: '20px', fontSize: '15px', fontWeight: '500' }}>机器码发送给管理员，获取激活码</span>
        <Space>
          <Button onClick={() => setStep(0)}>上一步</Button>
          <Button type="primary" onClick={() => setStep(2)}>下一步</Button>
        </Space>
      </Flex>;
    } else {
      return <Flex vertical>
        <Space>
          <Button onClick={() => setStep(1)}>上一步</Button>
        </Space>
        <Space.Compact style={{ width: '100%', marginTop: '20px' }}>
          <Input placeholder='请输入激活码' value={code} onChange={handleCodeChange} onPressEnter={submit} />
          <Button type="primary" onClick={submit} loading={submitLoading}>激活服务</Button>
        </Space.Compact>
      </Flex>;
    }
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };

  const submit = async () => {
    if (!code) {
      message.error('请输入激活码');
      return;
    }
    setsubmitLoading(true);
    const res = await activateByCode(code);
    setsubmitLoading(false);
    if (res.startsWith('激活成功')) {
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
