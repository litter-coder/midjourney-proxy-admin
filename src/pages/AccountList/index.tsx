import MoreContent from '@/pages/AccountList/components/contents/MoreContent';
import ReconnectContent from '@/pages/AccountList/components/contents/ReconnectContent';
import AddContent from '@/pages/AccountList/components/contents/AddContent';
import DelButton from '@/pages/AccountList/components/button/DelButton';
import SyncButton from '@/pages/AccountList/components/button/SyncButton';
import { createAccount, queryAccount, updateAndReconnect } from '@/services/mj/api';
import { ReloadOutlined, UserAddOutlined, ToolOutlined } from '@ant-design/icons';
import { ColumnType } from 'antd/lib/table';
import { PageContainer } from '@ant-design/pro-components';
import { Modal, Button, Card, Col, Form, Pagination, Row, Space, Table, Tag, Tooltip, notification } from 'antd';
import React, { useEffect, useState } from 'react';
import styles from './index.less';

const AccountList: React.FC = () => {
  // 初始化 dataSource 状态为空数组
  const [dataSource, setDataSource] = useState([]);
  const [pagination, setPagination] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [modalContent, setModalContent] = useState(<></>);
  const [title, setTitle] = useState<string>('');
  const [modalWidth, setModalWidth] = useState(1000);
  const [refresh, setRefresh] = useState(0);
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();
  const [modalSubmitLoading, setModalSubmitLoading] = useState(false);

  const openModal = (title: string, content: any, modalWidth: number) => {
    form.resetFields();
    setTitle(title);
    setModalContent(content);
    setModalWidth(modalWidth);
    setModalVisible(true);
  };

  const hideModal = () => {
    setModalContent(<></>);
    setModalVisible(false);
  };

  const modalFooter = <>
    <Button key="back" onClick={hideModal}>
      取消
    </Button>
    <Button key="submit" type="primary" loading={modalSubmitLoading} onClick={() => form.submit()}>
      提交
    </Button>
  </>;

  // 定义一个 triggerRefresh 函数，使其增加 refresh 的值，从而触发重新渲染
  const triggerRefreshAccount = () => {
    setRefresh(refresh + 1);
  };

  const fetchData = async (params: any) => {
    const res = await queryAccount(params);
    setPagination({ total: res.totalElements, size: res.size, current: res.number + 1 });
    setDataSource(res.content);
  };

  const pageChange = async (page: number, pageSize: number) => {
    fetchData({ pageNumber: page - 1, pageSize: pageSize });
  };

  const handleAdd = async (values: Record<string, string>) => {
    setModalSubmitLoading(true);
    const res = await createAccount(values);
    if (res.code == 1) {
      api.success({
        message: 'success',
        description: res.description
      });
      hideModal();
      triggerRefreshAccount();
    } else {
      api.error({
        message: 'error',
        description: res.description
      });
    }
    setModalSubmitLoading(false);
  };

  const handleReconnect = async (values: Record<string, string>) => {
    setModalSubmitLoading(true);
    const res = await updateAndReconnect(values.id, values);
    if (res.code == 1) {
      api.success({
        message: 'success',
        description: res.description
      });
    } else {
      api.error({
        message: 'error',
        description: res.description
      });
    }
    triggerRefreshAccount();
    hideModal();
    setModalSubmitLoading(false);
  };

  useEffect(() => {
    fetchData({});
  }, [refresh]);

  const columns = [
    {
      title: '账号名',
      dataIndex: 'name',
      render: (text: string, record: Record<string, any>) => (
        <a onClick={() => openModal('账户信息 - ' + record.name, <MoreContent record={record} />, 1000)}>
          {text}
        </a>
      ),
    } as ColumnType<Record<string, any>>,
    {
      title: '状态',
      dataIndex: 'enable',
      width: 100,
      align: 'center',
      render: (enable: boolean) => {
        let color = enable ? 'green' : 'volcano';
        let text = enable ? '启用' : '未启用';
        return <Tag color={color}>{text}</Tag>;
      },
    } as ColumnType<Record<string, any>>,
    {
      title: 'Remix',
      dataIndex: 'remix',
      width: 100,
      align: 'center',
      render: (remix: boolean) => {
        let color = remix ? 'green' : 'volcano';
        let text = remix ? '开启' : '关闭';
        return <Tag color={color}>{text}</Tag>;
      },
    } as ColumnType<Record<string, any>>,
    {
      title: '模式',
      dataIndex: 'mode',
      width: 120,
      align: 'center',
      render: (text: string, record: Record<string, any>) => record['displays']['mode'],
    } as ColumnType<Record<string, any>>,
    {
      title: '快速时间剩余',
      dataIndex: 'fastTimeRemaining',
    } as ColumnType<Record<string, any>>,
    {
      title: '续订时间',
      dataIndex: 'renewDate',
      align: 'center',
      render: (text, record) => record['displays']['renewDate'],
    } as ColumnType<Record<string, any>>,
    {
      title: '操作',
      dataIndex: 'operation',
      key: 'operation',
      render: (value: any, record: Record<string, string>) => {
        return (
          <Space>
            <SyncButton record={record} onSuccess={triggerRefreshAccount} />
            <Tooltip title="更新账户并重连">
              <Button
                key="EditAndReconnect"
                type={'primary'}
                icon={<ToolOutlined />}
                onClick={() =>
                  openModal(
                    '更新账户并重连',
                    <ReconnectContent form={form} record={record} onSubmit={handleReconnect} />,
                    1000,
                  )
                }
              />
            </Tooltip>
            <DelButton record={record} onSuccess={triggerRefreshAccount} />
          </Space>
        );
      },
    } as ColumnType<Record<string, any>>,
  ];

  const beforeLayout = () => {
    return (
      <Row>
        {contextHolder}
        <Col xs={24} sm={12}>
        </Col>
        <Col xs={24} sm={12} className={styles.tableToolbar}>
          <Space>
            <Button
              type={'primary'}
              icon={<UserAddOutlined />}
              onClick={() => {
                openModal(
                  '新增账户',
                  <AddContent form={form} onSubmit={handleAdd} />,
                  1000,
                );
              }}
            >
              添加
            </Button>
            <Button onClick={triggerRefreshAccount} icon={<ReloadOutlined />}>
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
        {beforeLayout()}
        <Table
          rowKey="id"
          dataSource={dataSource}
          columns={columns}
          pagination={false}
        />
        {afterLayout()}
      </Card>
      <Modal
        title={title}
        open={modalVisible}
        onCancel={hideModal}
        footer={modalFooter}
        width={modalWidth}
      >
        {modalContent}
      </Modal>
    </PageContainer>
  );
};

export default AccountList;
