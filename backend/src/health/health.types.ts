export const healthStatuses = ['ok', 'error'] as const;
export const databaseStatuses = ['connected', 'disconnected'] as const;

export type HealthStatus = (typeof healthStatuses)[number];
export type DatabaseStatus = (typeof databaseStatuses)[number];

export type HealthResponse = {
  status: HealthStatus;
  database: DatabaseStatus;
};
