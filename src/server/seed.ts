import { taskService } from "./tasks";

const verbs = ['Review', 'Write', 'Fix', 'Plan', 'Update', 'Test', 'Refactor', 'Prepare'];
const subjects = ['login page', 'monthly report', 'API docs', 'onboarding flow', 'sprint board', 'payment form', 'release notes', 'user settings'];
const details = [
  'Check the edge cases before merging.',
  'Align with the team on the next steps.',
  'Keep it short and simple.',
  'Due by the end of the week.'
];

function pick<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

function fakeTask(n: number) {
  return {
    titulo: `${pick(verbs)} ${pick(subjects)} #${n}`,
    descricao: Math.random() < 0.3 ? undefined : pick(details)
  };
};

export async function seedTasks(count = 25) {
  for (let i = 1; i <= count; i++) {
    await taskService.createTask(fakeTask(i));
  }
}