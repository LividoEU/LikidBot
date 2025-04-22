declare module "node-cron" {
    import { ScheduleOptions } from "node:timers";
  
    export interface ScheduledTask {
      start: () => void;
      stop: () => void;
      destroy: () => void;
    }
  
    export function schedule(
      expression: string,
      func: () => void,
      options?: ScheduleOptions & { timezone?: string }
    ): ScheduledTask;
  
    export default {
      schedule: schedule
    };
  }
  