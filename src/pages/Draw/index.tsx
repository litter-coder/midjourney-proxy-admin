import { PageContainer } from '@ant-design/pro-components';
import {
  Card, Space, Select, Input, Button, Radio, Avatar, Image,
  Spin, notification, Row, Tag, Progress, Modal, Flex
} from 'antd';
import type { RadioChangeEvent } from 'antd';
import React, { useEffect, useState, useRef } from 'react';
import styles from './index.less';
import { submitTask, queryTask, queryTaskByIds } from '@/services/mj/api';

const { TextArea } = Input;
const { Meta } = Card;

const Draw: React.FC = () => {
  const [api, contextHolder] = notification.useNotification();
  const [tasks, setTasks] = useState<any[]>([]);
  const [action, setAction] = useState('imagine');
  const [botType, setBotType] = useState('MID_JOURNEY');
  const [prompt, setPrompt] = useState('');
  const [loadingButton, setLoadingButton] = useState('');
  const [submitLoading, setsubmitLoading] = useState(false);
  const [waitTaskIds] = useState(new Set<string>());

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [customTaskId, setCustomTaskId] = useState<string>('');
  const [loadingModal, setLoadingModal] = useState(false);

  const cbSaver = useRef<any[]>([]);

  const customState = 'midjourney-proxy-admin';
  let syncRunningTasksFuture: any;

  useEffect(() => {
    fetchData({
      state: customState,
      pageNumber: 0,
      pageSize: 3,
      sort: 'submitTime,desc'
    });
    if (syncRunningTasksFuture != null) clearInterval(syncRunningTasksFuture);
    syncRunningTasksFuture = setInterval(() => {
      if (waitTaskIds.size == 0) return;
      syncRunningTasks();
    }, 2000);
  }, []);

  const syncRunningTasks = async () => {
    const res = await queryTaskByIds(Array.from(waitTaskIds));
    const array = res.content;
    let hasChange = false;
    const targetTasks = [...cbSaver.current];
    for (const item of array) {
      if (item.status === 'FAILURE' || item.status === 'SUCCESS') {
        waitTaskIds.delete(item.id);
      }
      const task = targetTasks.find((element) => element.id === item.id);
      if (!task) {
        hasChange = true;
        targetTasks.push(item);
      } else if (!isSameTask(task, item)) {
        hasChange = true;
        targetTasks.splice(targetTasks.indexOf(task), 1, item);
      }
    }
    if (hasChange) {
      cbSaver.current = targetTasks;
      setTasks(targetTasks);
    }
  };

  const isSameTask = (task1: any, task2: any) => {
    return task1.status === task2.status && task1.progress === task2.progress && task1.imageUrl === task2.imageUrl;
  };

  const fetchData = async (params: any) => {
    const res = await queryTask(params);
    const array = res.content.reverse();
    for (const item of array) {
      if (item.status !== 'FAILURE' && item.status !== 'SUCCESS') {
        waitTaskIds.add(item.id);
      }
    }
    cbSaver.current = array;
    setTasks(array);
  };

  const handleActionChange = (value: string) => {
    setAction(value);
  };

  const handleBotTypeChange = ({ target: { value } }: RadioChangeEvent) => {
    setBotType(value);
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleCustomPromptChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCustomPrompt(e.target.value);
  };

  const submit = () => {
    if (action === 'imagine') {
      if (!prompt) {
        api.warning({
          message: 'warn',
          description: 'prompt不能为空'
        });
        return;
      }
      setsubmitLoading(true);
      submitTask(action, { botType: botType, prompt: prompt, state: customState }).then((res) => {
        setsubmitLoading(false);
        if (res.code == 22) {
          api.warning({
            message: 'warn',
            description: res.description
          });
          waitTaskIds.add(res.result);
        } else if (res.code == 1) {
          waitTaskIds.add(res.result);
        } else {
          api.error({
            message: 'error',
            description: res.description
          });
        }
      })
    } else if (action === 'show') {
      if (!prompt) {
        api.warning({
          message: 'warn',
          description: '任务ID不能为空'
        });
        return;
      }
      waitTaskIds.add(prompt);
    } else {
      api.warning({
        message: 'warn',
        description: '当前页暂不支持该指令'
      });
    }
  };

  const actionTask = (taskId: string, customId: string, label: string, task: any) => {
    if (customId.startsWith('MJ::Inpaint:')) {
      api.warning({
        message: 'warn',
        description: '当前页暂不支持局部重绘'
      });
      return;
    }
    setLoadingButton(taskId + ":" + customId);
    submitTask('action', { taskId: taskId, customId: customId, state: customState }).then((res) => {
      setLoadingButton('');
      if (res.code == 22) {
        api.warning({
          message: 'warn',
          description: res.description
        });
        waitTaskIds.add(res.result);
      } else if (res.code == 21) {
        setModalTitle(label);
        setCustomTaskId(res.result);
        setCustomPrompt(task.properties['finalPrompt']);
        setModalVisible(true);
      } else if (res.code == 1) {
        waitTaskIds.add(res.result);
      } else {
        api.error({
          message: 'error',
          description: res.description
        });
      }
    });
  };

  const submitModal = () => {
    setLoadingModal(true);
    submitTask('modal', { taskId: customTaskId, prompt: customPrompt }).then((res) => {
      setLoadingModal(false);
      if (res.code == 22) {
        api.warning({
          message: 'warn',
          description: res.description
        });
        waitTaskIds.add(res.result);
        setModalVisible(false);
      } else if (res.code == 1) {
        waitTaskIds.add(res.result);
        setModalVisible(false);
      } else {
        api.error({
          message: 'error',
          description: res.description
        });
      }
    });

  };

  const taskCardList = () => {
    return tasks.map((task: any) => {
      return <Card bordered={false} hoverable={true} key={task.id}
        bodyStyle={{ backgroundColor: 'rgba(17,20,24,.15)', marginBottom: '10px' }}>
        <Meta
          avatar={<Avatar src={task.properties['botType'] == 'NIJI_JOURNEY' ? './niji.webp' : './midjourney.webp'} />}
          title={<><span>{task.properties['botType'] == 'NIJI_JOURNEY' ? 'niji・journey' : 'Midjourney'}</span><span className={styles.cardTitleTime}>{task.displays['submitTime']}</span></>}
          description={task.description}
        />
        <Flex vertical style={{ 'marginTop': '10px' }}>
          {getTaskStatus(task)}
          {getTaskImage(task.imageUrl)}
          <Space wrap style={{ marginTop: '7px' }}>
            {actionButtons(task)}
          </Space>
        </Flex>
      </Card>
    });
  };

  const getTaskStatus = (task: any) => {
    if (task.status == 'FAILURE') {
      return <span className={styles.taskErrorTip}>{task.failReason}</span>
    } else if (task.status == 'SUCCESS') {
      return <></>;
    } else if (task.status == 'IN_PROGRESS') {
      return getProgress(task.progress);
    } else {
      let color = 'purple';
      if (task.status == 'NOT_START') {
        color = 'purple';
      } else if (task.status == 'SUBMITTED') {
        color = 'lime';
      } else if (task.status == 'MODAL') {
        color = 'warning';
      }
      return <span>当前状态 <Tag style={{ 'marginLeft': '5px' }} color={color}>{task.displays['status']}</Tag></span>
    }
  };

  const getTaskImage = (imageUrl: string) => {
    if (!imageUrl) return <></>;
    return <Image
      width={250}
      src={imageUrl}
      placeholder={
        <Spin tip="Loading" size="large"></Spin>
      }
    />
  };

  const getProgress = (text: string) => {
    let percent = 0;
    if (text && text.indexOf('%') > 0) {
      percent = parseInt(text.substring(0, text.indexOf('%')));
    }
    return <div style={{ width: 250 }}><Progress style={{ 'marginLeft': '5px' }} percent={percent} status='normal' /></div>
  };

  const actionButtons = (task: any) => {
    return task.buttons.map((button: any) => {
      return <Button ghost key={task.id + ':' + button.customId}
        style={{ backgroundColor: button.style == 3 ? '#258146' : 'rgb(131 133 142)' }}
        onClick={() => { actionTask(task.id, button.customId, button.emoji + ' ' + button.label, task) }}
        loading={loadingButton == task.id + ':' + button.customId}
      >{button.emoji} {button.label}</Button>;
    });
  };

  return (
    <PageContainer>
      {contextHolder}
      <Card style={{ marginBottom: '15px', overflow: 'auto', height: '70vh' }}>
        {taskCardList()}
      </Card>
      <Card>
        <Space style={{ marginBottom: '10px' }}>
          <Select
            value={action}
            style={{ width: 150 }}
            onChange={handleActionChange}
            options={[
              { value: 'imagine', label: '/imagine' },
              { value: 'blend', label: '/blend' },
              { value: 'describe', label: '/describe' },
              { value: 'shorten', label: '/shorten' },
              { value: 'show', label: '/show' },
            ]}
          />
          <Radio.Group
            value={botType}
            onChange={handleBotTypeChange}
            options={[
              { value: 'MID_JOURNEY', label: 'Midjourney' },
              { value: 'NIJI_JOURNEY', label: 'niji・journey' },
            ]}
            optionType="button"
          />
        </Space>
        <Space.Compact style={{ width: '100%' }}>
          <Input placeholder={action == 'show' ? '任务ID' : 'Prompt'} value={prompt} onChange={handlePromptChange} onPressEnter={submit} />
          <Button type="primary" onClick={submit} loading={submitLoading}>提交任务</Button>
        </Space.Compact>
      </Card>
      <Modal
        title={modalTitle}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={submitModal}
        confirmLoading={loadingModal}
        width={600}
      >
        <TextArea rows={3} value={customPrompt} onChange={handleCustomPromptChange} />
      </Modal>
    </PageContainer>
  );
};

export default Draw;
