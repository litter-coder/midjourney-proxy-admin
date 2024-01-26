import { queryTask } from '@/services/mj/api';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import { Button, Card, Col, Pagination, Row, Space, Table, Tag, Progress, Form, Tooltip } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import React, { useEffect, useState } from 'react';
import styles from './index.less';
import TaskContent from '@/pages/Task/components/TaskContent';
import MyModal from '@/pages/components/Modal';

const List: React.FC = () => {
  // 初始化 dataSource 状态为空数组
  const [dataSource, setDataSource] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [pagination, setPagination] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState({});
  const [title, setTitle] = useState<string>('');
  const [footer, setFooter] = useState({});
  const [modalWidth, setModalWidth] = useState(1000);
  const [refresh, setRefresh] = useState(0);
  const [form] = Form.useForm();


  useEffect(() => {
    fetchData({});
  }, [refresh]);

  const triggerRefresh = () => {
    setRefresh(refresh + 1);
  };

  const fetchData = async (params: any) => {
    setDataLoading(true);
    const res = await queryTask(params);
    setPagination({ total: res.totalElements, size: res.size, current: res.number + 1 });
    setDataSource(res.content);
    setDataLoading(false);
  };

  const pageChange = async (page: number, pageSize: number) => {
    fetchData({ pageNumber: page - 1, pageSize: pageSize });
  };

  const hideModal = () => {
    setModalContent({});
    setFooter({});
    setModalVisible(false);
  };

  const openModal = (title: string, content: any, footer: any, modalWidth: number) => {
    form.resetFields();
    setTitle(title);
    setModalContent(content);
    setFooter(footer);
    setModalWidth(modalWidth);
    setModalVisible(true);
  };

  const columns = [
    {
      title: '任务ID',
      dataIndex: 'id',
      width: 200,
      align: 'center',
      fixed: 'left',
      hideInSearch: true,
      render: (text, record) => (
        <a onClick={() => openModal('任务信息', <TaskContent record={record}/>, null, 1100)}>
          {text}
        </a>
      ),
    },
    {
      title: '类型',
      dataIndex: 'action',
      width: 120,
      align: 'center',
      request: async () => [
        {
          label: 'Imagine',
          value: 'IMAGINE',
        },
        {
          label: 'Upscale',
          value: 'UPSCALE',
        },
        {
          label: 'Variation',
          value: 'VARIATION',
        },
        {
          label: 'Zoom',
          value: 'ZOOM',
        },
        {
          label: 'Pan',
          value: 'PAN',
        },
        {
          label: 'Describe',
          value: 'DESCRIBE',
        },
        {
          label: 'Blend',
          value: 'BLEND',
        },
        {
          label: 'Shorten',
          value: 'SHORTEN',
        },
        {
          label: 'SwapFace',
          value: 'SWAP_FACE',
        },
      ],
      render: (text, record) => record['displays']['action'],
    },
    {
      title: '提交时间',
      dataIndex: 'submitTime',
      width: 180,
      hideInSearch: true,
      align: 'center',
      render: (text, record) => record['displays']['submitTime'],
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 120,
      align: 'center',
      request: async () => [
        {
          label: '未启动',
          value: 'NOT_START',
        },
        {
          label: '已提交',
          value: 'SUBMITTED',
        },
        {
          label: '窗口等待',
          value: 'MODAL',
        },
        {
          label: '执行中',
          value: 'IN_PROGRESS',
        },
        {
          label: '失败',
          value: 'FAILURE',
        },
        {
          label: '成功',
          value: 'SUCCESS',
        },
        {
          label: '已取消',
          value: 'CANCEL',
        },
      ],
      render: (text, record) => {
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
        } else if (text == 'CANCEL') {
          color = 'magenta';
        }
        return <Tag color={color}>{record['displays']['status']}</Tag>;
      },
    },
    {
      title: '进度',
      dataIndex: 'progress',
      width: 130,
      align: 'center',
      showInfo: false,
      hideInSearch: true,
      render: (text, record) => {
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
        return <Progress percent={percent} status={status} size="small"/>;
      },
    },
    {
      title: '任务描述',
      dataIndex: 'description',
      ellipsis: true,
      render: (text, record) => {
        return <Tooltip title={text}>{text}</Tooltip>;
      },
    },
  ];

  const beforeLayout = () => {
    return (
      <Row>
        <Col xs={24} sm={12}>
        </Col>
        <Col xs={24} sm={12} className={styles.tableToolbar}>
          <Space>
            <Button onClick={triggerRefresh} icon={<ReloadOutlined />}>
              刷新
            </Button>
          </Space>
        </Col>
      </Row>
    );
  };
  const afterLayout = () => {
    return (
      <Row>
        <Col xs={24} sm={12}></Col>
        <Col xs={24} sm={12} className={styles.tableToolbar}>
          <Pagination onChange={pageChange} total={pagination.total} current={pagination.current} size={pagination.size} />
        </Col>
      </Row>
    );
  };

  return (
    <PageContainer>
      <Card>
        {/* {beforeLayout()} */}
        <ProTable
          columns={columns}
          scroll={{ x: 1000 }}
          pagination={{
            pageSize: 10,
            showQuickJumper: false,
            showSizeChanger:false
          }}
          rowKey="id"
          request={async (params) => {
            const res = await queryTask({...params, pageNumber: params.current - 1});
            return {
              data: res.content,
              total: res.totalElements,
              success: true,
            };
          }}
        />
        {/* {afterLayout()} */}
      </Card>
      <MyModal
        title={title}
        modalVisible={modalVisible}
        hideModal={hideModal}
        modalContent={modalContent}
        footer={footer}
        modalWidth={modalWidth}
      ></MyModal>
    </PageContainer>
  );
};

export default List;
