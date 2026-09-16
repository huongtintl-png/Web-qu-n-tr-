import {
  Student,
  ClassConfig,
  AttendanceRecord,
  ConductRecord,
  FinanceTransaction,
  ClassFeeCampaign,
  ContactMessage,
} from './types';
import {
  initialClassConfig,
  initialStudents,
  initialAttendanceRecords,
  initialConductRecords,
  initialTransactions,
  initialFeeCampaign,
  initialContactMessages,
} from './mockData';

const KEYS = {
  CONFIG: 'gvcn_config_v1',
  STUDENTS: 'gvcn_students_v1',
  ATTENDANCE: 'gvcn_attendance_v1',
  CONDUCT: 'gvcn_conduct_v1',
  TRANSACTIONS: 'gvcn_transactions_v1',
  FEE_CAMPAIGN: 'gvcn_fee_campaign_v1',
  CONTACT: 'gvcn_contact_v1',
};

export const getStoredConfig = (): ClassConfig => {
  try {
    const data = localStorage.getItem(KEYS.CONFIG);
    return data ? JSON.parse(data) : initialClassConfig;
  } catch {
    return initialClassConfig;
  }
};

export const saveStoredConfig = (config: ClassConfig) => {
  try {
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save config to localStorage', e);
  }
};

export const getStoredStudents = (): Student[] => {
  try {
    const data = localStorage.getItem(KEYS.STUDENTS);
    return data ? JSON.parse(data) : initialStudents;
  } catch {
    return initialStudents;
  }
};

export const saveStoredStudents = (students: Student[]) => {
  try {
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(students));
  } catch (e) {
    console.error('Failed to save students to localStorage', e);
  }
};

export const getStoredAttendance = (): AttendanceRecord[] => {
  try {
    const data = localStorage.getItem(KEYS.ATTENDANCE);
    return data ? JSON.parse(data) : initialAttendanceRecords;
  } catch {
    return initialAttendanceRecords;
  }
};

export const saveStoredAttendance = (records: AttendanceRecord[]) => {
  try {
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save attendance', e);
  }
};

export const getStoredConduct = (): ConductRecord[] => {
  try {
    const data = localStorage.getItem(KEYS.CONDUCT);
    return data ? JSON.parse(data) : initialConductRecords;
  } catch {
    return initialConductRecords;
  }
};

export const saveStoredConduct = (records: ConductRecord[]) => {
  try {
    localStorage.setItem(KEYS.CONDUCT, JSON.stringify(records));
  } catch (e) {
    console.error('Failed to save conduct', e);
  }
};

export const getStoredTransactions = (): FinanceTransaction[] => {
  try {
    const data = localStorage.getItem(KEYS.TRANSACTIONS);
    return data ? JSON.parse(data) : initialTransactions;
  } catch {
    return initialTransactions;
  }
};

export const saveStoredTransactions = (transactions: FinanceTransaction[]) => {
  try {
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(transactions));
  } catch (e) {
    console.error('Failed to save transactions', e);
  }
};

export const getStoredFeeCampaign = (): ClassFeeCampaign => {
  try {
    const data = localStorage.getItem(KEYS.FEE_CAMPAIGN);
    return data ? JSON.parse(data) : initialFeeCampaign;
  } catch {
    return initialFeeCampaign;
  }
};

export const saveStoredFeeCampaign = (campaign: ClassFeeCampaign) => {
  try {
    localStorage.setItem(KEYS.FEE_CAMPAIGN, JSON.stringify(campaign));
  } catch (e) {
    console.error('Failed to save fee campaign', e);
  }
};

export const getStoredContact = (): ContactMessage[] => {
  try {
    const data = localStorage.getItem(KEYS.CONTACT);
    return data ? JSON.parse(data) : initialContactMessages;
  } catch {
    return initialContactMessages;
  }
};

export const saveStoredContact = (messages: ContactMessage[]) => {
  try {
    localStorage.setItem(KEYS.CONTACT, JSON.stringify(messages));
  } catch (e) {
    console.error('Failed to save contact messages', e);
  }
};

export const resetAllToDefault = () => {
  try {
    localStorage.setItem(KEYS.CONFIG, JSON.stringify(initialClassConfig));
    localStorage.setItem(KEYS.STUDENTS, JSON.stringify(initialStudents));
    localStorage.setItem(KEYS.ATTENDANCE, JSON.stringify(initialAttendanceRecords));
    localStorage.setItem(KEYS.CONDUCT, JSON.stringify(initialConductRecords));
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(initialTransactions));
    localStorage.setItem(KEYS.FEE_CAMPAIGN, JSON.stringify(initialFeeCampaign));
    localStorage.setItem(KEYS.CONTACT, JSON.stringify(initialContactMessages));
  } catch (e) {
    console.error('Failed to reset storage', e);
  }
};

export const exportAllData = () => {
  return {
    config: getStoredConfig(),
    students: getStoredStudents(),
    attendance: getStoredAttendance(),
    conduct: getStoredConduct(),
    transactions: getStoredTransactions(),
    feeCampaign: getStoredFeeCampaign(),
    contact: getStoredContact(),
    exportedAt: new Date().toISOString(),
  };
};
