import { Card, Descriptions, Tag, Tooltip, Progress, Image, Spin } from 'antd';

const TaskContent = ({ record }: { record: Record<string, any> }) => {

  const getStatusTag = (text: string) => {
    let color = 'default';
    if (text == 'NOT_START') {
      color = 'default';
    } else if (text == 'SUBMITTED') {
      color = 'lime';
    } else if (text == 'MODAL') {
      color = 'warning';
    } else if (text == 'IN_PROGRESS') {
      color = 'processing';
    } else if (text == 'FAILURE') {
      color = 'error';
    } else if (text == 'SUCCESS') {
      color = 'success';
    }
    return <Tag color={color}>{record['displays']['status']}</Tag>
  };

  const getProgress = (text: string) => {
    let percent = 0;
    if (text && text.indexOf('%') > 0) {
      percent = parseInt(text.substring(0, text.indexOf('%')));
    }
    let status = 'normal';
    if (record['status'] == 'SUCCESS') {
      status = 'success';
    } else if (record['status'] == 'FAILURE') {
      status = 'exception';
    }
    return <div style={{ width: 200 }}><Progress percent={percent} status={status} /></div>
  };

  const getTooltip = (text: string) => {
    if (!text || text.length < 20) return text;
    return <Tooltip title={text}>{(text.substring(0, 30) + "...")}</Tooltip>
  };

  const getImage = (url: string) => {
    if (!url) return url;
    return <Image
      width={200}
      src={url}
      placeholder={
        <Spin tip="Loading" size="large"></Spin>
      }
    />
  };

  const getModalTag = (enable: boolean) => {
    if (enable == null || !enable) return;
    return <Tag color="green">是</Tag>;
  };

  return (
    <>
      <Card type="inner" title="基本信息" style={{ margin: '10px' }}>
        <Descriptions column={2}>
          <Descriptions.Item label="任务ID">{record.id}</Descriptions.Item>
          <Descriptions.Item label="任务类型">{record['displays']['action']}</Descriptions.Item>
          <Descriptions.Item label="任务状态">{getStatusTag(record.status)}</Descriptions.Item>
          <Descriptions.Item label="任务进度">{getProgress(record.progress)}</Descriptions.Item>
          <Descriptions.Item label="提示词">{getTooltip(record.prompt)}</Descriptions.Item>
          <Descriptions.Item label="提示词-英文">{getTooltip(record.promptEn)}</Descriptions.Item>
          <Descriptions.Item label="任务描述">{getTooltip(record.description)}</Descriptions.Item>
          <Descriptions.Item label="提交时间">{record['displays']['submitTime']}</Descriptions.Item>
          <Descriptions.Item label="开始执行时间">{record['displays']['startTime']}</Descriptions.Item>
          <Descriptions.Item label="结束时间">{record['displays']['finishTime']}</Descriptions.Item>
          <Descriptions.Item label="失败原因">{getTooltip(record.failReason)}</Descriptions.Item>
          <Descriptions.Item label="自定义参数">{getTooltip(record.state)}</Descriptions.Item>
          <Descriptions.Item label="生成图片">{getImage(record.imageUrl)}</Descriptions.Item>
        </Descriptions>
      </Card>
      <Card type="inner" title="扩展信息" style={{ margin: '10px' }}>
        <Descriptions column={2}>
          <Descriptions.Item label="实例ID">{record['properties']['discordInstanceId']}</Descriptions.Item>
          <Descriptions.Item label="消息ID">{record['properties']['messageId']}</Descriptions.Item>
          <Descriptions.Item label="最终提示词">{getTooltip(record['properties']['finalPrompt'])}</Descriptions.Item>
          <Descriptions.Item label="通知地址">{record['properties']['notifyHook']}</Descriptions.Item>
          <Descriptions.Item label="动作ID">{record['properties']['customId']}</Descriptions.Item>
          <Descriptions.Item label="Moadl确认">{getModalTag(record['properties']['needModel'])}</Descriptions.Item>
          <Descriptions.Item label="图片seed">{record['properties']['imageSeed']}</Descriptions.Item>
        </Descriptions>
      </Card>
    </>
  );
};

export default TaskContent;
