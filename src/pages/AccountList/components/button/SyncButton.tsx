import { refreshAccount } from '@/services/mj/api';
import { Button, Popconfirm, notification } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import React, { useState } from 'react';

interface SyncButtonProps {
  record: Record<string, string>;
  onSuccess: () => void; // 新增成功回调函数
}

const SyncButton: React.FC<SyncButtonProps> = ({ record, onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();

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
          description: "同步信息成功"
        });
        onSuccess();
      } else {
        api.error({
          message: 'error',
          description: res.description
        });
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
      title="同步信息"
      description="将主动执行/info、/settings获取并更新账户信息？"
      open={open}
      onConfirm={handleOk}
      okButtonProps={{ loading: confirmLoading }}
      onCancel={handleCancel}
    >
      {contextHolder}
      <Button icon={<SyncOutlined />} onClick={showPopconfirm}>
        同步
      </Button>
    </Popconfirm>
  );
};

export default SyncButton;
