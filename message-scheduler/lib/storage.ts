import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data.json');

export interface Schedule {
  id: string;
  name: string;
  subject: string;
  body: string;
  recipients: string[];
  enabled: boolean;
  recurrence: {
    type: 'once' | 'daily' | 'weekly' | 'monthly';
    time: string; // HH:mm format
    daysOfWeek?: number[]; // 0-6 for weekly
    dayOfMonth?: number; // 1-31 for monthly
    startDate?: string; // ISO date for one-time
  };
  lastSent?: string; // ISO timestamp
  createdAt: string;
}

export interface DataStore {
  schedules: Schedule[];
  settings: {
    gmailCredentials?: any;
  };
}

function getDefaultData(): DataStore {
  return {
    schedules: [],
    settings: {},
  };
}

export function readData(): DataStore {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      const defaultData = getDefaultData();
      fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2));
      return defaultData;
    }
    const content = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error reading data file:', error);
    return getDefaultData();
  }
}

export function writeData(data: DataStore): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing data file:', error);
    throw error;
  }
}

export function addSchedule(schedule: Omit<Schedule, 'id' | 'createdAt'>): Schedule {
  const data = readData();
  const newSchedule: Schedule = {
    ...schedule,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  };
  data.schedules.push(newSchedule);
  writeData(data);
  return newSchedule;
}

export function updateSchedule(id: string, updates: Partial<Schedule>): Schedule | null {
  const data = readData();
  const index = data.schedules.findIndex((s) => s.id === id);
  if (index === -1) return null;

  data.schedules[index] = { ...data.schedules[index], ...updates };
  writeData(data);
  return data.schedules[index];
}

export function deleteSchedule(id: string): boolean {
  const data = readData();
  const index = data.schedules.findIndex((s) => s.id === id);
  if (index === -1) return false;

  data.schedules.splice(index, 1);
  writeData(data);
  return true;
}

export function getSchedules(): Schedule[] {
  const data = readData();
  return data.schedules;
}
