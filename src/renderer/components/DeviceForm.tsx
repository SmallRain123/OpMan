import React, { useState } from 'react';
import { Form, Input, Button, Modal, Select, message } from 'antd';
import { SaveOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { saveDevice } from '../store/deviceSlice';

const { Option } = Select;

interface DeviceFormProps {
  visible: boolean;
  onClose: () => void;
  device?: any;
}

const DeviceForm = ({ visible, onClose, device }: DeviceFormProps) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const isEdit = !!device;

  useEffect(() => {
    if (device) {
      form.setFieldsValue(device);
    } else {
      form.resetFields();
    }
  }, [device, form]);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      await dispatch(saveDevice(values)).unwrap();
      message.success(isEdit ? 'Device updated successfully' : 'Device added successfully');
      onClose();
    } catch (err: any) {
      message.error(err.message || 'Failed to save device');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={isEdit ? 'Edit Device' : 'Add New Device'}
      visible={visible}
      onCancel={onClose}
      footer={[
        <Button key="cancel" onClick={onClose}>
          Cancel
        </Button>,
        <Button key="save" type="primary" loading={loading} onClick={handleSubmit} icon={<SaveOutlined />}>
          Save
        </Button>
      ]}
    >
      <Form
        form={form}
        name="device-form"
        labelCol={{ span: 6 }}
        wrapperCol={{ span: 16 }}
        initialValues={{
          port: 22
        }}
        autoComplete="off"
      >
        {isEdit && <Form.Item name="id" hidden>
          <Input />
        </Form.Item>}
        
        <Form.Item
          label="Name"
          name="name"
          rules={[{ required: true, message: 'Please input device name!' }]}
        >
          <Input />
        </Form.Item>
        
        <Form.Item
          label="Host"
          name="host"
          rules={[{ required: true, message: 'Please input host!' }]}
        >
          <Input />
        </Form.Item>
        
        <Form.Item
          label="Port"
          name="port"
          rules={[{ required: true, message: 'Please input port!' }]}
        >
          <Input type="number" />
        </Form.Item>
        
        <Form.Item
          label="Username"
          name="username"
          rules={[{ required: true, message: 'Please input username!' }]}
        >
          <Input />
        </Form.Item>
        
        <Form.Item
          label="Password"
          name="password"
          rules={[{ required: !isEdit, message: 'Please input password!' }]}
        >
          <Input.Password />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default DeviceForm;
    