import { StoreProject, ProjectStatus, StageInfo, StageStatus } from '../types';
import { isAfter, isBefore, differenceInDays, startOfDay } from 'date-fns';

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
      status = 'not_started';
    } else if (isBefore(date, today)) {
      const nextStage = stages[index + 1];
      const nextDate = nextStage ? parseDate(nextStage.date) : null;
      
      if (!foundCurrent) {
        if (nextDate && isAfter(nextDate, today)) {
          status = 'completed';
        } else if (!nextDate && index === stages.length - 1) {
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
      if (!foundCurrent) {
        status = 'current';
        foundCurrent = true;
        daysUntil = 0;
      } else {
        status = 'planned';
        daysUntil = differenceInDays(date, today);
      }
    } else {
      if (!foundCurrent) {
        status = 'current';
        foundCurrent = true;
        daysUntil = differenceInDays(date, today);
      } else {
        status = 'planned';
        daysUntil = differenceInDays(date, today);
      }
    }

    if (date && isBefore(date, today) && status !== 'completed') {
      isOverdue = true;
      daysOverdue = differenceInDays(today, date);
      status = 'overdue';
    }

    return { name: stage.name, date: stage.date, status, isOverdue, daysUntil, daysOverdue };
  });
}

export function calculateProjectStatus(project: StoreProject): ProjectStatus {
  if (project.isDeleted) return 'Удален';
  if (project.manualStatus) return project.manualStatus;

  const today = startOfDay(new Date());
  const stages = calculateStages(project);

  const hasOverdue = stages.some(s => s.isOverdue);
  if (hasOverdue) return 'Просрочено';

  const allCompleted = stages.every(s => s.status === 'completed');
  if (allCompleted && project.techOpenDate) return 'Завершено';

  const currentStage = stages.find(s => s.status === 'current');
  if (currentStage) {
    switch (currentStage.name) {
      case 'Закрыт для покупателей': return 'Закрыт для покупателей';
      case 'Демонтаж': return 'Демонтаж';
      case 'Монтаж': return 'Монтаж';
      case 'Техническое открытие': return 'Техническое открытие';
    }
  }

  const firstPlanned = stages.find(s => s.status === 'planned' || s.status === 'not_started');
  if (firstPlanned && !currentStage) {
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

export function getNearestEvent(project: StoreProject): { name: string; date: Date; daysUntil: number } | null {
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
  if (project.techOpenDate) {
    const d = parseDate(project.techOpenDate);
    if (d && !isBefore(d, today)) dates.push({ name: 'Тех. открытие', date: d });
  }

  if (dates.length === 0) return null;
  dates.sort((a, b) => a.date.getTime() - b.date.getTime());
  const next = dates[0];
  return { name: next.name, date: next.date, daysUntil: differenceInDays(next.date, today) };
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
