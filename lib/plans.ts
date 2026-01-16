export const PLAN_LIMITS = {
  free: {
    maxClients: 5,
    maxProjects: 3,
    maxTasksPerMonth: 20,
    canInvite: false,
    canUseAI: false,
    maxExportsPerMonth: 2,
  },
  pro: {
    maxClients: Infinity,
    maxProjects: Infinity,
    maxTasksPerMonth: Infinity,
    canInvite: true,
    canUseAI: true,
    maxExportsPerMonth: Infinity,
  }
};
