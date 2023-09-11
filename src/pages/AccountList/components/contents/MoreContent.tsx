import { Card, Descriptions, Tag, Tooltip, Select, Space, Button, notification } from 'antd';
import moment from 'moment';
import React, { useState } from 'react';
import { accountChangeVersion, accountAction } from '@/services/mj/api';

const { Option } = Select;

interface MoreContentProps {
  record: Record<string, any>;
  onSuccess: () => void;
}

const MoreContent: React.FC<MoreContentProps> = ({ record, onSuccess }) => {
  const [api, contextHolder] = notification.useNotification();
  const [version, setVersion] = useState<string>(record.version);
  const [buttons, setButtons] = useState<Array<any>>(record.buttons);
  const [loading, setLoading] = useState(false);
  const [loadingButton, setLoadingButton] = useState('');

  const getStatusTag = (enable: boolean, enableText: string, disableText: string) => {
    let color = enable ? 'green' : 'volcano';
    let text = enable ? enableText : disableText;
    return <Tag color={color}>{text}</Tag>;
  };

  const changeDate = (date: string) => {
    return moment(date).format('YYYY-MM-DD HH:mm');
  };

  const versionSelectorOptions = () => {
    return record.versionSelector?.options.map((option: any) => {
      return <Option key={option.value} value={option.value}>{option.emoji} {option.label}</Option>;
    });
  };

  const accountButtons = () => {
    return buttons.map((button: any) => {
      return <Button ghost key={button.customId}
        style={{ backgroundColor: button.style == 3 ? '#258146' : 'rgb(131 133 142)' }}
        onClick={() => { action(button.customId) }}
        loading={loadingButton == button.customId}
      >{button.emoji} {button.label}</Button>;
    });
  };

  const versionChange = async (value: string) => {
    setVersion(value);
    setLoading(true);
    const res = await accountChangeVersion(record.id, value);
    if (res.code == 1) {
      setLoading(false);
      api.success({
        message: 'success',
        description: "mj版本切换成功"
      });
    } else {
      setVersion(record.version);
      setLoading(false);
      api.error({
        message: 'error',
        description: res.description
      });
    }
  };

  const action = async (customId: string) => {
    setLoadingButton(customId);
    const res = await accountAction(record.id, customId);
    setLoadingButton('');
    if (res.code == 1) {
      setButtons(res.result.buttons);
    } else {
      api.error({
        message: 'error',
        description: res.description
      });
    }
  };

  return (
    <>
      {contextHolder}
      <Card type="inner" title="账号信息" style={{ margin: '10px' }}>
        <Descriptions column={3}>
          <Descriptions.Item label="服务器ID">{record.guildId}</Descriptions.Item>
          <Descriptions.Item label="频道ID">{record.channelId}</Descriptions.Item>
          <Descriptions.Item label="MJ私信ID">{record.mjBotChannelId}</Descriptions.Item>
          <Descriptions.Item label="用户Token">
            <Tooltip title={record.userToken}>
              {(record.userToken && record.userToken.substring(0, 20) + '...') || '未提供'}
            </Tooltip>
          </Descriptions.Item>
          <Descriptions.Item label="用户UserAgent">
            <Tooltip title={record.userAgent}>
              {(record.userAgent && record.userAgent.substring(0, 20) + '...') || '未提供'}
            </Tooltip>
          </Descriptions.Item>
          <Descriptions.Item label="remix自动提交">
            {getStatusTag(record.remixAutoSubmit, '是', '否')}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card type="inner" title="基本信息" style={{ margin: '10px' }}>
        <Descriptions column={3}>
          <Descriptions.Item label="状态">
            {getStatusTag(record.enable, '启用', '未启用')}
          </Descriptions.Item>
          <Descriptions.Item label="mj版本">{version}</Descriptions.Item>
          <Descriptions.Item label="账号模式">{record['displays']['mode']}</Descriptions.Item>
          <Descriptions.Item label="订阅计划">
            {record['displays']['subscribePlan']}
          </Descriptions.Item>
          <Descriptions.Item label="计费方式">{record['displays']['billedWay']}</Descriptions.Item>
          <Descriptions.Item label="续订时间">{changeDate(record.renewDate)}</Descriptions.Item>
          <Descriptions.Item label="快速时间剩余">{record.fastTimeRemaining}</Descriptions.Item>
          <Descriptions.Item label="relax用量">{record.relaxedUsage}</Descriptions.Item>
          <Descriptions.Item label="总用量">{record.lifetimeUsage}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card type="inner" title="其他信息" style={{ margin: '10px' }}>
        <Descriptions column={3}>
          <Descriptions.Item label="并发数">{record.coreSize}</Descriptions.Item>
          <Descriptions.Item label="等待队列">{record.queueSize}</Descriptions.Item>
          <Descriptions.Item label="任务超时时间">{record.timeoutMinutes} 分钟</Descriptions.Item>
          <Descriptions.Item label="创建时间">{changeDate(record.dateCreated)}</Descriptions.Item>
          <Descriptions.Item label="备注说明">{record.remark}</Descriptions.Item>
        </Descriptions>
      </Card>

      <Card type="inner" title="账号设置" style={{ margin: '10px' }}>
        <Select
          style={{ width: '35%' }}
          placeholder={record.versionSelector?.placeholder}
          value={version}
          onChange={versionChange}
          loading={loading}
        >
          {versionSelectorOptions()}
        </Select>
        <Space wrap style={{ marginTop: '10px' }}>
          {accountButtons()}
        </Space>
      </Card>
    </>
  );
};

export default MoreContent;
