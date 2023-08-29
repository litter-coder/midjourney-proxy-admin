import { deleteAccount } from '@/services/mj/api';
import { Button, Popconfirm, notification } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import React, { useState } from 'react';

// 定义 DelButton 接受的 props 类型
interface DelButtonProps {
  record: Record<string, string>;
  onSuccess: () => void; // 新增成功回调函数
}

const DelButton: React.FC<DelButtonProps> = ({ record, onSuccess }) => {
  const [open, setOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [api, contextHolder] = notification.useNotification();

  const showPopconfirm = () => {
    setOpen(true);
  };

  const handleOk = async () => {
    setConfirmLoading(true);
    try {
      const res = await deleteAccount(record.id);
      setOpen(false);
      if (res.code == 1) {
        api.success({
          message: 'success',
          description: "账户删除成功"
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
      title="删除账户"
      description="确认删除该账户？"
      open={open}
      onConfirm={handleOk}
      okButtonProps={{ loading: confirmLoading }}
      onCancel={handleCancel}
    >
      {contextHolder}
      <Button danger icon={<DeleteOutlined />} onClick={showPopconfirm}>
      </Button>
    </Popconfirm>
  );
};

export default DelButton;
