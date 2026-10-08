import { StoreProject, ProjectStatus, StageInfo, StageStatus } from '../types';
import { parse, isAfter, isBefore, differenceInDays, startOfDay } from 'date-fns';

export function parseDate(dateStr: string | null): Date | null {
  if (!dateStr) return null;
  try {
    const parts = dateStr.split('.');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    }
    return new Date(dateStr);
  } catch {
    return null;
  }
}

export function formatDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
}

export function parseDateInput(dateStr: string): string | null {
  if (!dateStr) return null;
  try {
    const parts = dateStr.split('.');
    if (parts.length === 3) {
      const [day, month, year] = parts;
      const d = parseInt(day);
      const m = parseInt(month);
      const y = parseInt(year);
      if (d > 0 && d <= 31 && m > 0 && m <= 12 && y > 2000) {
        return dateStr;
      }
    }
    // Try ISO format
    const d = new Date(dateStr);
    if (!isNaN(d.getTime())) {
      return formatDate(d);
    }
    return null;
  } catch {
    return null;
  }
}

export function calculateStages(project: StoreProject): StageInfo[] {
  const today = startOfDay(new Date());
  
  const stages: { name: string; date: string | null }[] = [
    { name: 'Закрыт для покупателей', date: project.closureDate },
    { name: 'Демонтаж', date: project.demolitionDate },
    { name: 'Монтаж', date: project.installationDate },
    { name: 'ОСВ магазина', date: project.osvDate },
    { name: 'Техническое открытие', date: project.techOpenDate },
  ];

  let foundCurrent = false;
  
  return stages.map((stage, index) => {
    const date = parseDate(stage.date);
    let status: StageStatus;
    let isOverdue = false;
    let daysUntil: number | null = null;
    let daysOverdue: number | null = null;

    if (!date) {
      // Check if previous stages are completed
      const prevStages = stages.slice(0, index);
      const allPrevCompleted = prevStages.every(s => {
        const d = parseDate(s.date);
        return d && isBefore(d, today);
      });
      
      if (index === 0 && !foundCurrent) {
        status = 'not_started';
      } else if (allPrevCompleted && !foundCurrent) {
        status = 'not_started';
      } else {
        status = 'not_started';
      }
    } else if (isBefore(date, today)) {
      // Date has passed
      if (!foundCurrent) {
        // Check if next stage exists and is in the future
        const nextStage = stages[index + 1];
        const nextDate = nextStage ? parseDate(nextStage.date) : null;
        
        if (nextDate && isAfter(nextDate, today)) {
          status = 'completed';
        } else if (!nextDate && index === stages.length - 1) {
          // Last stage, date passed
          status = 'completed';
        } else if (!nextDate) {
          status = 'completed';
        } else {
          status = 'completed';
        }
      } else {
        status = 'not_started';
      }
    } else if (date.getTime() === today.getTime()) {
      // Today
      if (!foundCurrent) {
        status = 'current';
        foundCurrent = true;
        daysUntil = 0;
      } else {
        status = 'planned';
        daysUntil = differenceInDays(date, today);
      }
    } else {
      // Future date
      if (!foundCurrent) {
        status = 'current';
        foundCurrent = true;
        daysUntil = differenceInDays(date, today);
      } else {
        status = 'planned';
        daysUntil = differenceInDays(date, today);
      }
    }

    // Check overdue
    if (date && isBefore(date, today) && status !== 'completed') {
      isOverdue = true;
      daysOverdue = differenceInDays(today, date);
      status = 'overdue';
    }

    return {
      name: stage.name,
      date: stage.date,
      status,
      isOverdue,
      daysUntil,
      daysOverdue,
    };
  });
}

export function calculateProjectStatus(project: StoreProject): ProjectStatus {
  if (project.isDeleted) return 'Удален';
  if (project.manualStatus) return project.manualStatus;

  const today = startOfDay(new Date());
  const stages = calculateStages(project);

  // Check if any stage is overdue
  const hasOverdue = stages.some(s => s.isOverdue);
  if (hasOverdue) return 'Просрочено';

  // Check if all stages are completed
  const allCompleted = stages.every(s => s.status === 'completed');
  if (allCompleted && project.techOpenDate) return 'Завершено';

  // Find current stage
  const currentStage = stages.find(s => s.status === 'current');
  if (currentStage) {
    switch (currentStage.name) {
      case 'Закрыт для покупателей': return 'Закрыт для покупателей';
      case 'Демонтаж': return 'Демонтаж';
      case 'Монтаж': return 'Монтаж';
      case 'ОСВ магазина': return 'ОСВ магазина';
      case 'Техническое открытие': return 'Техническое открытие';
    }
  }

  // Check if first planned stage
  const firstPlanned = stages.find(s => s.status === 'planned' || s.status === 'not_started');
  if (firstPlanned && !currentStage) {
    // Check if there are any dates at all
    const hasAnyDate = project.closureDate || project.demolitionDate;
    if (hasAnyDate) {
      const closureDate = parseDate(project.closureDate);
      if (closureDate && isAfter(closureDate, today)) {
        return 'Запланирован';
      }
    }
    return 'Запланирован';
  }

  return 'Запланирован';
}

export function getNextStageDate(project: StoreProject): { name: string; date: Date; daysUntil: number } | null {
  const today = startOfDay(new Date());
  const dates: { name: string; date: Date }[] = [];

  if (project.closureDate) {
    const d = parseDate(project.closureDate);
    if (d && !isBefore(d, today)) dates.push({ name: 'Закрытие', date: d });
  }
  if (project.demolitionDate) {
    const d = parseDate(project.demolitionDate);
    if (d && !isBefore(d, today)) dates.push({ name: 'Демонтаж', date: d });
  }
  if (project.installationDate) {
    const d = parseDate(project.installationDate);
    if (d && !isBefore(d, today)) dates.push({ name: 'Монтаж', date: d });
  }
  if (project.osvDate) {
    const d = parseDate(project.osvDate);
    if (d && !isBefore(d, today)) dates.push({ name: 'ОСВ', date: d });
  }
  if (project.techOpenDate) {
    const d = parseDate(project.techOpenDate);
    if (d && !isBefore(d, today)) dates.push({ name: 'Тех. открытие', date: d });
  }

  if (dates.length === 0) return null;

  dates.sort((a, b) => a.date.getTime() - b.date.getTime());
  const next = dates[0];
  return {
    name: next.name,
    date: next.date,
    daysUntil: differenceInDays(next.date, today),
  };
}

export function getOverdueInfo(project: StoreProject): { stage: string; days: number } | null {
  const today = startOfDay(new Date());
  const stages = calculateStages(project);
  
  for (const stage of stages) {
    if (stage.isOverdue && stage.daysOverdue !== null) {
      return { stage: stage.name, days: stage.daysOverdue };
    }
  }
  return null;
}

export function getNearestEvent(project: StoreProject): { stage: string; date: Date; daysUntil: number } | null {
  const today = startOfDay(new Date());
  const events: { stage: string; date: Date }[] = [];

  const addEvent = (name: string, dateStr: string | null) => {
    if (!dateStr) return;
    const d = parseDate(dateStr);
    if (d) events.push({ stage: name, date: d });
  };

  addEvent('Закрытие', project.closureDate);
  addEvent('Демонтаж', project.demolitionDate);
  addEvent('Монтаж', project.installationDate);
  addEvent('ОСВ', project.osvDate);
  addEvent('Тех. открытие', project.techOpenDate);

  // Sort by date and find nearest future event
  events.sort((a, b) => a.date.getTime() - b.date.getTime());
  
  for (const event of events) {
    const daysUntil = differenceInDays(event.date, today);
    if (daysUntil >= 0) {
      return { stage: event.stage, date: event.date, daysUntil };
    }
  }
  return null;
}
