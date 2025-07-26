import { useEffect, useState } from 'react';
import { ipcRenderer } from 'electron';

interface SystemInfo {
  cpu: {
    model: string;
    usage: number;
  };
  memory: {
    total: number;
    free: number;
    used: number;
    percentage: number;
  };
  disk: {
    total: number;
    free: number;
    used: number;
    percentage: number;
  };
  loadAverage: number[];
}

const useSystemInfo = (deviceId: string) => {
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fetchSystemInfo = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 执行命令获取系统信息
      const result = await ipcRenderer.invoke('ssh-execute', deviceId, `
        # 获取CPU信息
        CPU_MODEL=$(cat /proc/cpuinfo | grep 'model name' | head -1 | cut -d ':' -f2 | tr -d ' ')
        CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2 + $4}')
        
        # 获取内存信息
        MEM_TOTAL=$(free -m | awk 'NR==2{print $2}')
        MEM_FREE=$(free -m | awk 'NR==2{print $4}')
        MEM_USED=$(free -m | awk 'NR==2{print $3}')
        MEM_PERCENT=$((MEM_USED * 100 / MEM_TOTAL))
        
        # 获取磁盘信息
        DISK_TOTAL=$(df -h / | awk 'NR==2{print $2}')
        DISK_USED=$(df -h / | awk 'NR==2{print $3}')
        DISK_FREE=$(df -h / | awk 'NR==2{print $4}')
        DISK_PERCENT=$(df -h / | awk 'NR==2{print $5}' | tr -d '%')
        
        # 获取负载信息
        LOAD=$(cat /proc/loadavg | awk '{print $1, $2, $3}')
        
        # 输出JSON格式
        echo "{
          \"cpu\": {
            \"model\": \"$CPU_MODEL\",
            \"usage\": $CPU_USAGE
          },
          \"memory\": {
            \"total\": $MEM_TOTAL,
            \"free\": $MEM_FREE,
            \"used\": $MEM_USED,
            \"percentage\": $MEM_PERCENT
          },
          \"disk\": {
            \"total\": \"$DISK_TOTAL\",
            \"free\": \"$DISK_FREE\",
            \"used\": \"$DISK_USED\",
            \"percentage\": $DISK_PERCENT
          },
          \"loadAverage\": [$(echo $LOAD | tr ' ' ',')]
        }"
      `);
      
      if (result.success) {
        setSystemInfo(JSON.parse(result.stdout.trim()));
      } else {
        setError(result.stderr || 'Failed to fetch system info');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch system info');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    if (deviceId) {
      fetchSystemInfo();
      
      // 设置定时刷新
      const interval = setInterval(fetchSystemInfo, 5000);
      
      return () => clearInterval(interval);
    }
  }, [deviceId]);
  
  return { systemInfo, loading, error };
};

export default useSystemInfo;
    