import DelButton from '@/pages/AccountList/components/button/DelButton';
import SyncButton from '@/pages/AccountList/components/button/SyncButton';
import AddContent from '@/pages/AccountList/components/contents/AddContent';
import MoreContent from '@/pages/AccountList/components/contents/MoreContent';
import ReconnectContent from '@/pages/AccountList/components/contents/ReconnectContent';
import UpdateContent from '@/pages/AccountList/components/contents/UpdateContent';
import { createAccount, queryAccount, updateAndReconnect, update } from '@/services/mj/api';
import { ToolOutlined, UserAddOutlined, EditOutlined } from '@ant-design/icons';
import { ActionType, PageContainer, ProTable } from '@ant-design/pro-components';
import { useIntl } from '@umijs/max';
import {
  Button,
  Card,
  Form,
  Modal,
  notification,
  Space,
  Tag,
  Tooltip,
} from 'antd';
import { ColumnType } from 'antd/lib/table';
import React, { useState, useRef } from 'react';

const AccountList: React.FC = () => {
  // 初始化 dataSource 状态为空数组
  const [modalVisible, setModalVisible] = useState(false);
  const [modalReadonly, setModalReadonly] = useState(false);
  const [modalContent, setModalContent] = useState(<></>);
  const [title, setTitle] = useState<string>('');
  const [modalWidth, setModalWidth] = useState(1000);
  const [form] = Form.useForm();
  const [api, contextHolder] = notification.useNotification();
  const [modalSubmitLoading, setModalSubmitLoading] = useState(false);
  const ref = useRef<ActionType>();
  const intl = useIntl();

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
    setModalReadonly(false);
  };

  const modalFooter = (
    <>
      <Button key="back" onClick={hideModal}>
        {intl.formatMessage({ id: 'pages.cancel' })}
      </Button>
      <Button
        key="submit"
        type="primary"
        loading={modalSubmitLoading}
        onClick={() => form.submit()}
      >
        {intl.formatMessage({ id: 'pages.submit' })}
      </Button>
    </>
  );

  // 定义一个 triggerRefresh 函数，使其增加 refresh 的值，从而触发重新渲染
  const triggerRefreshAccount = () => {
    ref.current.reload();
  };

  const handleAdd = async (values: Record<string, string>) => {
    setModalSubmitLoading(true);
    const res = await createAccount(values);
    if (res.code == 1) {
      api.success({
        message: 'success',
        description: res.description,
      });
      hideModal();
      triggerRefreshAccount();
    } else {
      api.error({
        message: 'error',
        description: res.description,
      });
      triggerRefreshAccount();
    }
    setModalSubmitLoading(false);
  };

  const handleReconnect = async (values: Record<string, string>) => {
    setModalSubmitLoading(true);
    const res = await updateAndReconnect(values.id, values);
    if (res.code == 1) {
      api.success({
        message: 'success',
        description: res.description,
      });
    } else {
      api.error({
        message: 'error',
        description: res.description,
      });
    }
    hideModal();
    triggerRefreshAccount();
    setModalSubmitLoading(false);
  };

  const handleUpdate = async (values: Record<string, string>) => {
    setModalSubmitLoading(true);
    const res = await update(values.id, values);
    if (res.code == 1) {
      api.success({
        message: 'success',
        description: res.description,
      });
    } else {
      api.error({
        message: 'error',
        description: res.description,
      });
    }
    hideModal();
    triggerRefreshAccount();
    setModalSubmitLoading(false);
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 200,
      align: 'center',
      render: (text: string, record: Record<string, any>) => (
        <a
          onClick={() => {
            setModalReadonly(true);
            openModal(
              intl.formatMessage({ id: 'pages.account.info' }) + ' - ' + record.name,
              <MoreContent record={record} onSuccess={triggerRefreshAccount} />,
              1100,
            );
          }}
        >
          {text}
        </a>
      ),
    } as ColumnType<Record<string, any>>,
    {
      title: intl.formatMessage({ id: 'pages.account.channelId' }),
      dataIndex: 'channelId',
      align: 'center',
      width: 200,
    } as ColumnType<Record<string, any>>,
    {
      title: intl.formatMessage({ id: 'pages.account.username' }),
      dataIndex: 'name',
      width: 120,
      ellipsis: true,
    } as ColumnType<Record<string, any>>,
    {
      title: intl.formatMessage({ id: 'pages.account.status' }),
      dataIndex: 'enable',
      width: 100,
      align: 'center',
      request: async () => [
        {
          label: intl.formatMessage({ id: 'pages.enable' }),
          value: 'true',
        },
        {
          label: intl.formatMessage({ id: 'pages.disable' }),
          value: 'false',
        },
      ],
      render: (enable: boolean) => {
        let color = enable ? 'green' : 'volcano';
        let text = enable ? intl.formatMessage({ id: 'pages.enable' }) : intl.formatMessage({ id: 'pages.disable' });
        return <Tag color={color}>{text}</Tag>;
      },
    } as ColumnType<Record<string, any>>,
    {
      title: intl.formatMessage({ id: 'pages.account.fastTimeRemaining' }),
      dataIndex: 'fastTimeRemaining',
      ellipsis: true,
      width: 200,
      hideInSearch: true,
    } as ColumnType<Record<string, any>>,
    {
      title: intl.formatMessage({ id: 'pages.account.subscribePlan' }),
      dataIndex: 'subscribePlan',
      width: 120,
      align: 'center',
      request: async () => [
        {
          label: 'Basic',
          value: 'BASIC',
        },
        {
          label: 'Standard',
          value: 'STANDARD',
        },
        {
          label: 'Pro',
          value: 'PRO',
        },
        {
          label: 'Mega',
          value: 'MEGA',
        },
      ],
      render: (text: string, record: Record<string, any>) => record['displays']['subscribePlan'],
    } as ColumnType<Record<string, any>>,
    {
      title: intl.formatMessage({ id: 'pages.account.renewDate' }),
      dataIndex: 'renewDate',
      align: 'center',
      width: 150,
      hideInSearch: true,
      render: (text, record) => record['displays']['renewDate'],
    } as ColumnType<Record<string, any>>,
    {
      title: intl.formatMessage({ id: 'pages.account.mjMode' }),
      dataIndex: 'mode',
      width: 120,
      align: 'center',
      hideInSearch: true,
      render: (text: string, record: Record<string, any>) => record['displays']['mode'],
    } as ColumnType<Record<string, any>>,
    {
      title: intl.formatMessage({ id: 'pages.account.nijiMode' }),
      dataIndex: 'nijiMode',
      width: 120,
      align: 'center',
      hideInSearch: true,
      render: (text: string, record: Record<string, any>) => record['displays']['nijiMode'],
    } as ColumnType<Record<string, any>>,
    {
      title: intl.formatMessage({ id: 'pages.account.remark' }),
      dataIndex: 'remark',
      ellipsis: true,
      width: 150,
    } as ColumnType<Record<string, any>>,
    {
      title: intl.formatMessage({ id: 'pages.account.disabledReason' }),
      dataIndex: 'disabledReason',
      ellipsis: true,
      width: 150,
      hideInSearch: true,
      renderText: (text: string, record: Record<string, any>) => record['properties']['disabledReason'],
    } as ColumnType<Record<string, any>>,
    {
      title: intl.formatMessage({ id: 'pages.operation' }),
      dataIndex: 'operation',
      width: 200,
      key: 'operation',
      fixed: 'right',
      hideInSearch: true,
      render: (value: any, record: Record<string, string>) => {
        return (
          <Space>
            <SyncButton record={record} onSuccess={triggerRefreshAccount} />
            <Tooltip title={intl.formatMessage({ id: 'pages.account.updateAndReconnect' })}>
              <Button
                key="EditAndReconnect"
                type={'primary'}
                icon={<ToolOutlined />}
                onClick={() =>
                  openModal(
                    intl.formatMessage({ id: 'pages.account.updateAndReconnect' }),
                    <ReconnectContent form={form} record={record} onSubmit={handleReconnect} />,
                    1000,
                  )
                }
              />
            </Tooltip>
            <Button
                key="Update"
                icon={<EditOutlined />}
                onClick={() =>
                  openModal(
                    intl.formatMessage({ id: 'pages.account.update' }),
                    <UpdateContent form={form} record={record} onSubmit={handleUpdate} />,
                    1000,
                  )
                }
              />
            <DelButton record={record} onSuccess={triggerRefreshAccount} />
          </Space>
        );
      },
    } as ColumnType<Record<string, any>>,
  ];

  return (
    <PageContainer>
      {contextHolder}
      <Card>
        <ProTable
          scroll={{ x: 1000 }}
          actionRef={ref}
          search={{ defaultCollapsed: false }}
          rowKey="id"
          columns={columns}
          pagination={{
            pageSize: 10,
            showQuickJumper: false,
            showSizeChanger: false,
          }}
          request={async (params) => {
            const res = await queryAccount({ ...params, pageNumber: params.current - 1 });
            return {
              data: res.content,
              total: res.totalElements,
              success: true,
            };
          }}
          toolbar={{
            actions: [
              <Button
                key="primary"
                type={'primary'}
                icon={<UserAddOutlined />}
                onClick={() => {
                  openModal(intl.formatMessage({ id: 'pages.account.add' }), <AddContent form={form} onSubmit={handleAdd} />, 1000);
                }}
              >
                {intl.formatMessage({ id: 'pages.add' })}
              </Button>,
            ]
          }}
        />
      </Card>
      <Modal
        title={title}
        open={modalVisible}
        onCancel={hideModal}
        footer={modalReadonly ? null : modalFooter}
        width={modalWidth}
      >
        {modalContent}
      </Modal>
    </PageContainer>
  );
};

export default AccountList;
