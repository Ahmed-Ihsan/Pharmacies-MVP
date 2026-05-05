import { useState, useEffect } from 'react';

interface ActivityLogEntry {
  id: string;
  action: string;
  entity: string;
  entityId: number;
  userId: string;
  timestamp: Date;
  details?: any;
}

export function useActivityLog() {
  const [logs, setLogs] = useState<ActivityLogEntry[]>([]);

  const logActivity = (action: string, entity: string, entityId: number, details?: any) => {
    const entry: ActivityLogEntry = {
      id: Date.now().toString(),
      action,
      entity,
      entityId,
      userId: 'current-user',
      timestamp: new Date(),
      details,
    };

    setLogs((prev) => [entry, ...prev]);

    // Save to localStorage for persistence
    const savedLogs = localStorage.getItem('activityLogs');
    const allLogs = savedLogs ? JSON.parse(savedLogs) : [];
    allLogs.unshift(entry);
    localStorage.setItem('activityLogs', JSON.stringify(allLogs.slice(0, 100)));
  };

  const getLogsForEntity = (entity: string, entityId: number) => {
    return logs.filter(
      (log) => log.entity === entity && log.entityId === entityId
    );
  };

  const clearLogs = () => {
    setLogs([]);
    localStorage.removeItem('activityLogs');
  };

  useEffect(() => {
    const savedLogs = localStorage.getItem('activityLogs');
    if (savedLogs) {
      const parsed = JSON.parse(savedLogs);
      setLogs(parsed.map((log: any) => ({ ...log, timestamp: new Date(log.timestamp) })));
    }
  }, []);

  return { logs, logActivity, getLogsForEntity, clearLogs };
}
