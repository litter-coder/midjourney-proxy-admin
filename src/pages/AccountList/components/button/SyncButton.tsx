import { refreshAccount } from '@/services/mj/api';
import { Button, Popconfirm, notification } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import React, { useState } from 'react';
import { useIntl } from '@umijs/max';

interface SyncButtonProps {
  record: Record<string, string>;
  onSuccess: () => void;
}

const SyncButton: React.FC<SyncButtonProps> = ({ record, onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();
  const intl = useIntl();

  const showPopconfirm = () => {
    setOpen(true);
  };

  const handleOk = async () => {
    setConfirmLoading(true);
    try {
      const res = await refreshAccount(record.id);
      setOpen(false);
      if (res.code == 1) {
        api.success({
          message: 'success',
          description: intl.formatMessage({ id: 'pages.account.syncSuccess' })
        });
        onSuccess();
      } else {
        api.error({
          message: 'error',
          description: res.description
        });
        onSuccess();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setConfirmLoading(false);
    }
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Popconfirm
      title={intl.formatMessage({ id: 'pages.account.sync' })}
      description={intl.formatMessage({ id: 'pages.account.syncTitle' })}
      open={open}
      onConfirm={handleOk}
      okButtonProps={{ loading: confirmLoading }}
      onCancel={handleCancel}
    >
      {contextHolder}
      <Button icon={<SyncOutlined />} onClick={showPopconfirm}>
      {intl.formatMessage({ id: 'pages.account.sync' })}
      </Button>
    </Popconfirm>
  );
};

export default SyncButton;
