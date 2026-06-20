export type EventPayloads = {
  TASK_CREATED: { task: any };
  TASK_UPDATED: { task: any };
  TASK_DELETED: { taskId: string };
  TASK_COMPLETED: { task: any };
  
  CALENDAR_EVENT_CREATED: { event: any };
  CALENDAR_EVENT_UPDATED: { event: any };
  CALENDAR_EVENT_DELETED: { eventId: string };

  HABIT_CREATED: { habit: any };
  HABIT_COMPLETED: { habit: any; completion: any; streakCount: number };

  JOURNAL_ENTRY_CREATED: { entry: any };
  
  NOTE_CREATED: { note: any };
  NOTE_UPDATED: { note: any };

  AI_ORCHESTRATION_COMPLETED: { userId: string; input: string; output: string };
};

export type EventType = keyof EventPayloads;

export interface EventListener<T extends EventType> {
  handle(payload: EventPayloads[T]): Promise<void> | void;
}
