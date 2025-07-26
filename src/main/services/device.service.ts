import { ipcMain } from 'electron';
import * as fs from 'fs';
import * as path from 'path';

const devicesFilePath = path.join(__dirname, '../../../devices.json');

// 读取设备列表
ipcMain.handle('get-devices', async () => {
  try {
    if (fs.existsSync(devicesFilePath)) {
      const data = fs.readFileSync(devicesFilePath, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (err) {
    console.error('Error reading devices:', err);
    return [];
  }
});

// 保存设备
ipcMain.handle('save-device', async (event, device) => {
  try {
    let devices = [];
    
    if (fs.existsSync(devicesFilePath)) {
      const data = fs.readFileSync(devicesFilePath, 'utf8');
      devices = JSON.parse(data);
    }
    
    // 如果是更新现有设备
    const deviceIndex = devices.findIndex((d: any) => d.id === device.id);
    if (deviceIndex !== -1) {
      devices[deviceIndex] = device;
    } else {
      // 新增设备
      device.id = Date.now().toString();
      devices.push(device);
    }
    
    fs.writeFileSync(devicesFilePath, JSON.stringify(devices, null, 2));
    return devices;
  } catch (err) {
    console.error('Error saving device:', err);
    throw err;
  }
});

// 删除设备
ipcMain.handle('delete-device', async (event, deviceId) => {
  try {
    if (fs.existsSync(devicesFilePath)) {
      const data = fs.readFileSync(devicesFilePath, 'utf8');
      let devices = JSON.parse(data);
      
      devices = devices.filter((d: any) => d.id !== deviceId);
      fs.writeFileSync(devicesFilePath, JSON.stringify(devices, null, 2));
      
      return devices;
    }
    return [];
  } catch (err) {
    console.error('Error deleting device:', err);
    throw err;
  }
});
    