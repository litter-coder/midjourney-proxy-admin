import { PageContainer } from '@ant-design/pro-components';
import {
  Card, Space, Select, Input, Button, Radio, Avatar,
  Spin, notification, Tag, Progress, Modal, Flex, Upload, message
} from 'antd';
import { Image as AntdImage } from 'antd';
import type { RadioChangeEvent } from 'antd';
import React, { useEffect, useState, useRef } from 'react';
import { UploadOutlined, ClearOutlined } from '@ant-design/icons';
import type { RcFile, UploadProps, UploadFile } from 'antd/es/upload/interface';
import Markdown from 'react-markdown';
import styles from './index.less';
import { submitTask, cancelTask, queryTask, queryTaskByIds } from '@/services/mj/api';

const { TextArea } = Input;
const { Meta } = Card;

const Draw: React.FC = () => {
  const [api, contextHolder] = notification.useNotification();
  const [tasks, setTasks] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(false);

  const [action, setAction] = useState('imagine');
  const [botType, setBotType] = useState('MID_JOURNEY');
  const [prompt, setPrompt] = useState('');
  const [dimensions, setDimensions] = useState('SQUARE');
  const [images, setImages] = useState<UploadFile[]>([]);

  const [loadingButton, setLoadingButton] = useState('');
  const [submitLoading, setsubmitLoading] = useState(false);
  const [waitTaskIds] = useState(new Set<string>());

  const [modalVisible, setModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState<string>('');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [customTaskId, setCustomTaskId] = useState<string>('');
  const [modalImage, setModalImage] = useState<string>('');
  const [modalImageHeight, setModalImageHeight] = useState<number>(0);
  const [modalRemix, setModalRemix] = useState(false);
  const [loadingModal, setLoadingModal] = useState(false);

  const cbSaver = useRef<any[]>([]);

  const customState = 'midjourney-proxy-admin';
  const imagePrefix = sessionStorage.getItem('mj-image-prefix') || '';
  let syncRunningTasksFuture: any;

  useEffect(() => {
    fetchData({
      state: customState,
      pageNumber: 0,
      pageSize: 3,
      statusSet: ['NOT_START', 'SUBMITTED', 'IN_PROGRESS', 'FAILURE', 'SUCCESS'],
      sort: 'submitTime,desc'
    });
    if (syncRunningTasksFuture != null) clearInterval(syncRunningTasksFuture);
    syncRunningTasksFuture = setInterval(() => {
      if (waitTaskIds.size == 0) return;
      syncRunningTasks();
    }, 2000);
  }, []);

  const syncRunningTasks = async () => {
    const taskIds = Array.from(waitTaskIds);
    let tmpTaskIds = new Set(taskIds);
    const res = await queryTaskByIds(taskIds);
    const array = res.content;
    let hasChange = false;
    const targetTasks = [...cbSaver.current];
    for (const item of array) {
      tmpTaskIds.delete(item.id);
      if (item.status === 'FAILURE' || item.status === 'SUCCESS' || item.status === 'CANCEL') {
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
    for (const needRemoveId of tmpTaskIds) {
      waitTaskIds.delete(needRemoveId);
    }
    if (hasChange) {
      cbSaver.current = targetTasks;
      setTasks(targetTasks);
      scrollToBottom();
    }
  };

  const isSameTask = (old: any, task: any) => {
    return old.status === task.status && old.progress === task.progress && old.imageUrl === task.imageUrl;
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      const pannel = document.getElementById('task-panel');
      if (!pannel) return;
      pannel.scrollTo(0, pannel.scrollHeight);
    }, 20);
  };

  const fetchData = async (params: any) => {
    setDataLoading(true);
    const res = await queryTask(params);
    const array = res.content.reverse();
    for (const item of array) {
      if (item.status !== 'FAILURE' && item.status !== 'SUCCESS' && item.action !== 'CANCEL') {
        waitTaskIds.add(item.id);
      }
    }
    cbSaver.current = array;
    setTasks(array);
    setDataLoading(false);
    scrollToBottom();
  };

  const handleActionChange = (value: string) => {
    setAction(value);
    setPrompt('');
    setImages([]);
  };

  const handleBotTypeChange = ({ target: { value } }: RadioChangeEvent) => {
    setBotType(value);
  };

  const handleDimensionsChange = ({ target: { value } }: RadioChangeEvent) => {
    setDimensions(value);
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
  };

  const handleCustomPromptChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setCustomPrompt(e.target.value);
  };

  const readFileAsBase64 = async (file: any) => {
    return await new Promise((resolve) => {
      let fileReader = new FileReader();
      fileReader.onload = (e) => resolve(fileReader.result);
      fileReader.readAsDataURL(file);
    });
  };

  const submit = async () => {
    if (action === 'show') {
      if (!prompt) {
        message.error('任务ID不能为空!');
        return;
      }
      waitTaskIds.add(prompt);
      setPrompt('');
    } else if (action === 'imagine') {
      if (!prompt) {
        message.error('prompt不能为空!');
        return;
      }
      setsubmitLoading(true);
      const base64Array = [];
      for (const item of images) {
        const base64 = await readFileAsBase64(item.originFileObj);
        base64Array.push(base64);
      }
      submitTask(action, { botType: botType, prompt: prompt, base64Array: base64Array, state: customState }).then((res) => {
        setsubmitLoading(false);
        const success = submitResultCheck(res);
        if (success) {
          waitTaskIds.add(res.result);
          setPrompt('');
          setImages([]);
        }
      });
    } else if (action === 'blend') {
      if (images.length < 2) {
        message.error('blend至少需要两张图片!');
        return;
      }
      setsubmitLoading(true);
      const base64Array = [];
      for (const item of images) {
        const base64 = await readFileAsBase64(item.originFileObj);
        base64Array.push(base64);
      }
      submitTask(action, { botType: botType, base64Array: base64Array, dimensions: dimensions, state: customState }).then((res) => {
        setsubmitLoading(false);
        const success = submitResultCheck(res);
        if (success) {
          waitTaskIds.add(res.result);
          setImages([]);
        }
      });
    } else if (action === 'describe') {
      if (images.length < 1) {
        message.error('图片不能为空!');
        return;
      }
      setsubmitLoading(true);
      const base64 = await readFileAsBase64(images[0].originFileObj);
      submitTask(action, { botType: botType, base64: base64, state: customState }).then((res) => {
        setsubmitLoading(false);
        const success = submitResultCheck(res);
        if (success) {
          waitTaskIds.add(res.result);
          setImages([]);
        }
      });
    } else if (action === 'shorten') {
      if (!prompt) {
        message.error('prompt不能为空!');
        return;
      }
      setsubmitLoading(true);
      submitTask(action, { botType: botType, prompt: prompt, state: customState }).then((res) => {
        setsubmitLoading(false);
        const success = submitResultCheck(res);
        if (success) {
          waitTaskIds.add(res.result);
          setPrompt('');
        }
      });
    } else {
      message.error('当前页暂不支持该指令!');
    }
  };

  const submitResultCheck = (res: any) => {
    if (res.code == 22 || res.code == 1) {
      if (res.code == 22) {
        api.warning({
          message: 'warn',
          description: res.description
        });
      } else {
        message.success('提交任务成功，请稍等...');
      }
      return true;
    } else {
      api.error({
        message: 'error',
        description: res.description
      });
      return false;
    }
  };

  const actionTask = (task: any, button: any) => {
    const customId = button.customId;
    const taskId = task.id;
    const label = button.emoji + ' ' + button.label;
    setLoadingButton(taskId + ":" + customId);
    submitTask('action', { taskId: taskId, customId: customId, state: customState }).then((res) => {
      setLoadingButton('');
      if (res.code == 22) {
        api.warning({
          message: 'warn',
          description: res.description
        });
        button.style = 3;
        waitTaskIds.add(res.result);
      } else if (res.code == 21) {
        button.style = 3;
        setModalTitle(res.result + ' ' + label);
        setCustomTaskId(res.result);
        setCustomPrompt(res.properties['finalPrompt']);
        setModalRemix(res.properties['remix'] || false);
        if (customId.startsWith('MJ::Inpaint:')) {
          const imgUrl = imagePrefix + task.imageUrl;
          let img = new Image();
          img.src = imgUrl;
          img.onload = function () {
            setModalImageHeight(Math.floor(550 / img.width * img.height));
            setModalImage(imgUrl);
            setModalVisible(true);
            setTimeout(() => {
              initCanvas();
            }, 300);
          };
        } else {
          setModalImage('');
          setModalVisible(true);
        }
        setModalVisible(true);
      } else if (res.code == 1) {
        button.style = 3;
        waitTaskIds.add(res.result);
        message.success('动作执行成功，请稍等...');
      } else {
        api.error({
          message: 'error',
          description: res.description
        });
      }
    });
  };

  let draw = false;
  let startX = 0;
  let startY = 0;

  const initCanvas = () => {
    const canvas: any = document.getElementById("canvas");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const rect = canvas.getBoundingClientRect();
    const rectLeft = Math.floor(rect.left);
    const rectTop = Math.floor(rect.top);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "blue";
    canvas.onmousedown = (e: any) => {
      startX = e.clientX;
      startY = e.clientY;
      draw = true;
    };
    canvas.onmousemove = (e: any) => {
      if (draw === true) {
        ctx.fillRect(startX - rectLeft, startY - rectTop, e.clientX - startX, e.clientY - startY);
      }
    };
    canvas.onmouseup = () => {
      draw = false;
    };
  };

  const cancelModal = () => {
    cancelTask(customTaskId);
    setModalVisible(false);
  };

  const submitModal = async () => {
    let params;
    setLoadingModal(true);
    if (modalImage) {
      const canvas: any = document.getElementById("canvas");
      const newImg = new Image();
      newImg.src = canvas.toDataURL("image/png");
      const base64 = await getMaskBase64(newImg);
      params = { maskBase64: base64, taskId: customTaskId, prompt: customPrompt };
    } else {
      params = { taskId: customTaskId, prompt: customPrompt };
    }
    submitTask('modal', params).then((res) => {
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
        message.success('提交成功，请稍等...');
      } else {
        api.error({
          message: 'error',
          description: res.description
        });
      }
    });
  };

  const getMaskBase64 = async (img: any) => {
    return await new Promise((resolve) => {
      img.onload = function () {
        let width = img.width, height = img.height;
        const canvas: any = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);
        var imageData = ctx.getImageData(0, 0, width, height);
        var data = imageData.data;
        for (var i = 0; i < data.length; i += 4) {
          if (data[i] !== 0 || data[i + 1] !== 0 || data[i + 2] !== 0) {
            data[i] = parseInt('0xff');
            data[i + 1] = parseInt('0xff');
            data[i + 2] = parseInt('0xff');
          } else {
            data[i] = 0;
            data[i + 1] = 0;
            data[i + 2] = 0;
            data[i + 3] = 255;
          }
        }
        ctx.putImageData(imageData, 0, 0);
        const base64: string = canvas.toDataURL('png');
        resolve(base64);
      };
    });
  };

  const taskCardList = () => {
    return tasks.map((task: any) => {
      return <Card bordered={false} key={task.id}
        bodyStyle={{ backgroundColor: '#eaeaea', marginBottom: '10px' }}>
        <Meta
          avatar={<Avatar src={task.properties['botType'] == 'NIJI_JOURNEY' ? './niji.webp' : './midjourney.webp'} />}
          title={<><span>{task.properties['botType'] == 'NIJI_JOURNEY' ? 'niji・journey' : 'Midjourney'}</span><span className={styles.cardTitleTime}>{task.displays['submitTime']}</span></>}
          description={task.description}
        />
        <Flex vertical style={{ 'marginTop': '10px', paddingLeft: '48px' }}>
          {getTaskCard(task)}
          <Space wrap style={{ marginTop: '7px' }}>
            {actionButtons(task)}
          </Space>
        </Flex>
      </Card>
    });
  };

  const getTaskCard = (task: any) => {
    if (task.action == 'DESCRIBE') {
      return <>{getTaskStatus(task)} {getTaskMarkdownInfo(task)} {getTaskImage(task.imageUrl, 120)}</>;
    } else if (task.action == 'SHORTEN') {
      return <>{getTaskStatus(task)} {getTaskMarkdownInfo(task)}</>;
    } else {
      return <>{getTaskStatus(task)}{getTaskImage(task.imageUrl, 250)}</>;
    }
  }

  const getTaskMarkdownInfo = (task: any) => {
    if (!task.properties['finalPrompt']) {
      return <></>;
    }
    const finalPrompt = task.properties['finalPrompt'];
    return <Markdown>{finalPrompt.replace(/(?<!\n)\n/g, "\n\n")}</Markdown>;
  };

  const getTaskStatus = (task: any) => {
    if (task.status == 'FAILURE') {
      return <span className={styles.taskErrorTip}>{task.failReason}</span>
    } else if (task.status == 'SUCCESS') {
      return <></>;
    } else if (task.status == 'IN_PROGRESS') {
      return getProgress(task.progress);
    } else {
      let color = task.status == 'SUBMITTED' ? 'lime' : (task.status == 'MODAL' ? 'warning' : 'purple');
      return <span><Tag color={color}>{task.displays['status']}</Tag></span>
    }
  };

  const getTaskImage = (imageUrl: string, width: number) => {
    if (!imageUrl) return <></>;
    return <AntdImage
      width={width}
      src={imagePrefix + imageUrl}
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
    return <div style={{ width: 250 }}><Progress percent={percent} status='normal' /></div>
  };

  const actionButtons = (task: any) => {
    return task.buttons.map((button: any) => {
      return <Button ghost key={task.id + ':' + button.customId}
        style={{ backgroundColor: button.style == 3 ? '#258146' : 'rgb(131 133 142)' }}
        onClick={() => { actionTask(task, button) }}
        loading={loadingButton == task.id + ':' + button.customId}
      >{button.emoji} {button.label}</Button>;
    });
  };

  const actionArea = () => {
    if (action == 'show') {
      return <Space.Compact style={{ width: '100%' }}>
        <Input placeholder='输入任务ID, 调出未展示的任务' value={prompt} onChange={handlePromptChange} onPressEnter={submit} />
        <Button type="primary" onClick={submit} loading={submitLoading}>提交任务</Button>
      </Space.Compact>
    } else if (action == 'imagine') {
      return <Flex vertical>
        <Upload {...props}>
          <Button icon={<UploadOutlined />}>上传垫图</Button>
        </Upload>
        <Space.Compact style={{ width: '100%', marginTop: '10px' }}>
          <Input placeholder='Prompt' value={prompt} onChange={handlePromptChange} onPressEnter={submit} />
          <Button type="primary" onClick={submit} loading={submitLoading}>提交任务</Button>
        </Space.Compact>
      </Flex>
    } else if (action == 'blend') {
      return <Flex vertical>
        <Upload {...props}>
          <Button icon={<UploadOutlined />}>上传图片</Button>
        </Upload>
        <Space style={{ width: '100%', marginTop: '10px' }}>
          <Radio.Group
            value={dimensions}
            onChange={handleDimensionsChange}
            options={[
              { value: 'PORTRAIT', label: '肖像(2:3)' },
              { value: 'SQUARE', label: '正方形(1:1)' },
              { value: 'LANDSCAPE', label: '景观(3:2)' },
            ]}
            optionType="button"
          />
          <Button type="primary" onClick={submit} loading={submitLoading}>提交任务</Button>
        </Space>
      </Flex>
    } else if (action == 'describe') {
      return <Flex vertical>
        <Upload {...props}>
          <Button icon={<UploadOutlined />}>上传图片</Button>
        </Upload>
        <Button style={{ marginTop: '10px' }} type="primary" onClick={submit} loading={submitLoading}>提交任务</Button>
      </Flex>
    } else if (action == 'shorten') {
      return <Space.Compact style={{ width: '100%', marginTop: '10px' }}>
        <Input placeholder='Prompt' value={prompt} onChange={handlePromptChange} onPressEnter={submit} />
        <Button type="primary" onClick={submit} loading={submitLoading}>提交任务</Button>
      </Space.Compact>
    }
    return <></>;
  };

  const clearCanvas = () => {
    const canvas: any = document.getElementById("canvas");
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "blue";
  };

  const confirmModal = () => {
    if (!modalImage) {
      return <TextArea rows={3} value={customPrompt} onChange={handleCustomPromptChange} />;
    }
    if (modalRemix) {
      return <Flex vertical>
        <Button style={{ marginBottom: '10px' }} icon={<ClearOutlined />} onClick={clearCanvas}>清除选中</Button>
        <canvas style={{ backgroundImage: `url('${modalImage}')`, backgroundSize: '100% 100%' }}
          id="canvas" width="550" height={modalImageHeight}></canvas>
        <TextArea style={{ marginTop: '10px' }} rows={2} value={customPrompt} onChange={handleCustomPromptChange} />
      </Flex>
    }
    return <Flex vertical>
      <Button style={{ marginBottom: '10px' }} icon={<ClearOutlined />} onClick={clearCanvas}>清除选中</Button>
      <canvas style={{ backgroundImage: `url('${modalImage}')`, backgroundSize: '100% 100%' }}
        id="canvas" width="550" height={modalImageHeight}></canvas>
    </Flex>
  };

  function customRequest(option: any) {
    option.onSuccess();
  }

  const beforeUpload = (file: RcFile) => {
    const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
    if (!isJpgOrPng) {
      message.error('只能上传JPG或PNG文件!');
    }
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('图片大小需小于2MB!');
    }
    return isJpgOrPng && isLt2M;
  };

  const props: UploadProps = {
    customRequest: customRequest,
    beforeUpload: beforeUpload,
    fileList: images,
    maxCount: action == 'blend' || action == 'imagine' ? 5 : 1,
    onChange(info) {
      setImages(info.fileList);
    },
  };

  return (
    <PageContainer>
      {contextHolder}
      <Card style={{ marginBottom: '15px', overflow: 'auto', height: '70vh' }} loading={dataLoading} id='task-panel'>
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
        {actionArea()}
      </Card>
      <Modal
        title={modalTitle}
        open={modalVisible}
        onCancel={cancelModal}
        onOk={submitModal}
        confirmLoading={loadingModal}
        width={600}
      >
        {confirmModal()}
      </Modal>
    </PageContainer>
  );
};

export default Draw;
