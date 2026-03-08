import { supabase } from '@/integrations/supabase/client';
import { ActionItem } from '../types/actionPlan';

// ======= ACTION ITEMS =======

function toDbRow(item: ActionItem) {
  return {
    id: item.id,
    challenge_category: item.challengeCategory,
    area_of_improvement: item.areaOfImprovement,
    stream_owner: item.streamOwner,
    priority: item.priority,
    planned_actions: item.plannedActions,
    summary: item.summary,
    dashboard_owner: item.dashboardOwner,
    task_supporters: item.taskSupporters,
    ecd: item.ecd,
    update_status: item.update,
    remarks: item.remarks,
  };
}

function fromDbRow(row: any): ActionItem {
  return {
    id: row.id,
    challengeCategory: row.challenge_category || '',
    areaOfImprovement: row.area_of_improvement || '',
    streamOwner: row.stream_owner || '',
    priority: row.priority || '',
    plannedActions: row.planned_actions || '',
    summary: row.summary || '',
    dashboardOwner: row.dashboard_owner || '',
    taskSupporters: row.task_supporters || '',
    ecd: row.ecd || '',
    update: row.update_status || '',
    remarks: row.remarks || '',
  };
}

export async function dbLoadAllTasks(): Promise<ActionItem[]> {
  const { data, error } = await supabase
    .from('action_items')
    .select('*')
    .order('id', { ascending: true });
  if (error) { console.error('dbLoadAllTasks error:', error); return []; }
  return (data || []).map(fromDbRow);
}

export async function dbSaveAllTasks(items: ActionItem[]): Promise<void> {
  // Delete all then insert fresh
  const { error: delErr } = await supabase.from('action_items').delete().gte('id', 0);
  if (delErr) console.error('dbSaveAllTasks delete error:', delErr);
  if (items.length === 0) return;
  const rows = items.map(toDbRow);
  const { error } = await supabase.from('action_items').insert(rows);
  if (error) console.error('dbSaveAllTasks insert error:', error);
}

export async function dbUpdateTask(id: number, updates: Partial<ActionItem>): Promise<void> {
  const mapped: Record<string, any> = {};
  if (updates.challengeCategory !== undefined) mapped.challenge_category = updates.challengeCategory;
  if (updates.areaOfImprovement !== undefined) mapped.area_of_improvement = updates.areaOfImprovement;
  if (updates.streamOwner !== undefined) mapped.stream_owner = updates.streamOwner;
  if (updates.priority !== undefined) mapped.priority = updates.priority;
  if (updates.plannedActions !== undefined) mapped.planned_actions = updates.plannedActions;
  if (updates.summary !== undefined) mapped.summary = updates.summary;
  if (updates.dashboardOwner !== undefined) mapped.dashboard_owner = updates.dashboardOwner;
  if (updates.taskSupporters !== undefined) mapped.task_supporters = updates.taskSupporters;
  if (updates.ecd !== undefined) mapped.ecd = updates.ecd;
  if (updates.update !== undefined) mapped.update_status = updates.update;
  if (updates.remarks !== undefined) mapped.remarks = updates.remarks;
  const { error } = await supabase.from('action_items').update(mapped).eq('id', id);
  if (error) console.error('dbUpdateTask error:', error);
}

export async function dbAddTask(task: ActionItem): Promise<void> {
  const { error } = await supabase.from('action_items').insert(toDbRow(task));
  if (error) console.error('dbAddTask error:', error);
}

export async function dbDeleteTask(id: number): Promise<void> {
  const { error } = await supabase.from('action_items').delete().eq('id', id);
  if (error) console.error('dbDeleteTask error:', error);
}

// ======= SETTINGS (key-value) =======

export async function dbLoadSetting<T>(key: string): Promise<T | null> {
  const { data, error } = await supabase
    .from('app_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle();
  if (error) { console.error('dbLoadSetting error:', key, error); return null; }
  return data ? (data.value as T) : null;
}

export async function dbSaveSetting(key: string, value: unknown): Promise<void> {
  const { error } = await supabase
    .from('app_settings')
    .upsert({ key, value: value as any }, { onConflict: 'key' });
  if (error) console.error('dbSaveSetting error:', key, error);
}

// ======= PHOTOS =======

export async function dbLoadAllPhotos(): Promise<Record<string, string>> {
  const { data, error } = await supabase.from('owner_photos').select('*');
  if (error) { console.error('dbLoadAllPhotos error:', error); return {}; }
  const result: Record<string, string> = {};
  for (const row of data || []) {
    result[row.photo_key] = row.data_url;
  }
  return result;
}

export async function dbSavePhoto(photoKey: string, dataUrl: string): Promise<void> {
  const { error } = await supabase
    .from('owner_photos')
    .upsert({ photo_key: photoKey, data_url: dataUrl }, { onConflict: 'photo_key' });
  if (error) console.error('dbSavePhoto error:', error);
}

export async function dbSavePhotos(photos: Record<string, string>): Promise<void> {
  const rows = Object.entries(photos).map(([photo_key, data_url]) => ({ photo_key, data_url }));
  if (rows.length === 0) return;
  const { error } = await supabase
    .from('owner_photos')
    .upsert(rows, { onConflict: 'photo_key' });
  if (error) console.error('dbSavePhotos error:', error);
}
