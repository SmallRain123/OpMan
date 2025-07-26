import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDevices, deleteDevice } from '../store/deviceSlice';
import { Table, Button, Space, message } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

const DeviceListPage = () => {
  const dispatch = useDispatch();
  const devices = useSelector((state: any) => state.devices.devices);
  const loading = useSelector((state: any) => state.devices.loading);
  const error = useSelector((state: any) => state.devices.error);

  useEffect(() => {
    dispatch(fetchDevices());
  }, [dispatch]);

  const handleDelete = async (deviceId: string) => {
    try {
      await dispatch(deleteDevice(deviceId)).unwrap();
      message.success('Device deleted successfully');
    } catch (err: any) {
      message.error(err.message || 'Failed to delete device');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name'
    },
    {
      title: 'Host',
      dataIndex: 'host',
      key: 'host'
    },
    {
      title: 'Port',
      dataIndex: 'port',
      key: 'port'
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username'
    },
    {
      title: 'Last Connected',
      dataIndex: 'lastConnected',
      key: 'lastConnected',
      render: (text: string | null) => text || 'Never'
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record: any) => (
        <Space size="middle">
          <Button type="primary" icon={<EditOutlined />} size="small">
            Edit
          </Button>
          <Button type="danger" icon={<DeleteOutlined />} size="small" onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </Space>
      )
    }
  ];

  return (
    <div className="device-list-page">
      <h1>OpenWrt Devices</h1>
      {error && <div className="error-message">{error}</div>}
      <Button type="primary" style={{ marginBottom: 16 }}>
        Add Device
      </Button>
      <Table dataSource={devices} columns={columns} loading={loading} rowKey="id" />
    </div>
  );
};

export default DeviceListPage;
    