export const PLAN_LIMITS = {
  free: {
    maxClients: 5,
    maxProjects: 3,
    maxTasksPerMonth: 20,
    canInvite: false,
    canUseAI: false,
    maxExportsPerMonth: 2,
    maxWorkspaces: 4,
  },
  pro: {
    maxClients: Infinity,
    maxProjects: Infinity,
    maxTasksPerMonth: Infinity,
    canInvite: true,
    canUseAI: true,
    maxExportsPerMonth: Infinity,
    maxWorkspaces: Infinity,
  }
};


/**
 * Verifica si el usuario puede agregar un cliente según su plan y cantidad actual de clientes.
 * @param {string} plan - Nombre del plan ("free" | "pro").
 * @param {number} currentClients - Cantidad actual de clientes.
 * @returns {boolean}
 */
export function canAddClient(plan: keyof typeof PLAN_LIMITS, currentClients: number): boolean {
  const max = PLAN_LIMITS[plan]?.maxClients ?? 0;
  return currentClients < max;
}

/**
 * Devuelve un mensaje sobre el límite de clientes según el plan.
 * @param {string} plan - Nombre del plan ("free" | "pro").
 * @returns {string}
 */
export function getClientLimitMessage(plan: keyof typeof PLAN_LIMITS): string {
  const max = PLAN_LIMITS[plan]?.maxClients;
  if (max === Infinity) return "Puedes agregar clientes ilimitados con tu plan actual.";
  return `Puedes agregar hasta ${max} clientes con tu plan actual.`;
}

/**
 * Verifica si el usuario puede crear un workspace según su plan y cantidad actual de workspaces.
 * @param {number} currentWorkspaces - Cantidad actual de workspaces.
 * @param {string} plan - Nombre del plan ("free" | "pro").
 * @returns {boolean}
 */
export function canCreateWorkspace(currentWorkspaces: number, plan: keyof typeof PLAN_LIMITS): boolean {
  const max = PLAN_LIMITS[plan]?.maxWorkspaces ?? 0;
  return currentWorkspaces < max;
}

/**
 * Devuelve un mensaje sobre el límite de workspaces según el plan.
 * @param {string} plan - Nombre del plan ("free" | "pro").
 * @returns {string}
 */
export function getWorkspaceLimitMessage(plan: keyof typeof PLAN_LIMITS): string {
  const max = PLAN_LIMITS[plan]?.maxWorkspaces;
  if (max === Infinity) return "Puedes crear workspaces ilimitados con tu plan actual.";
  return `Puedes crear hasta ${max} workspaces con tu plan actual.`;
}
