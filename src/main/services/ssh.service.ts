import { ipcMain } from 'electron';
import { Client } from 'ssh2';

// 存储活跃的SSH连接
const sshConnections = new Map<string, Client>();

// 建立SSH连接
ipcMain.handle('ssh-connect', async (event, deviceId, host, port, username, password) => {
  return new Promise((resolve, reject) => {
    const conn = new Client();
    
    conn.on('ready', () => {
      sshConnections.set(deviceId, conn);
      resolve({ success: true, message: 'Connected' });
    }).on('error', (err) => {
      reject({ success: false, message: err.message });
    }).connect({
      host,
      port,
      username,
      password
    });
  });
});

// 执行SSH命令
ipcMain.handle('ssh-execute', async (event, deviceId, command) => {
  return new Promise((resolve, reject) => {
    const conn = sshConnections.get(deviceId);
    
    if (!conn) {
      return reject({ success: false, message: 'Not connected' });
    }
    
    conn.exec(command, (err, stream) => {
      if (err) return reject({ success: false, message: err.message });
      
      let stdout = '';
      let stderr = '';
      
      stream.on('data', (data: Buffer) => {
        stdout += data.toString();
      }).on('close', (code: number) => {
        resolve({ success: true, code, stdout, stderr });
      }).stderr.on('data', (data: Buffer) => {
        stderr += data.toString();
      });
    });
  });
});

// 关闭SSH连接
ipcMain.handle('ssh-disconnect', async (event, deviceId) => {
  try {
    const conn = sshConnections.get(deviceId);
    if (conn) {
      conn.end();
      sshConnections.delete(deviceId);
    }
    return { success: true };
  } catch (err) {
    return { success: false, message: (err as Error).message };
  }
});
    