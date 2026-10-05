export const queryKeys = {
  treatments: {
    all: ["treatments"] as const,
    active: ["treatments", "active"] as const,
    detail: (id: string | number) => ["treatments", "detail", String(id)] as const,
  },
  settings: {
    current: ["settings"] as const,
  },
  reports: {
    all: ["reports"] as const,
    analytics: (filters?: Record<string, any>) => ["reports", "analytics", filters] as const,
    saved: ["reports", "saved"] as const,
    detail: (id: string | number) => ["reports", "detail", String(id)] as const,
  },
  doctors: {
    all: ["doctors"] as const,
    active: ["doctors", "active"] as const,
    detail: (id: string | number) => ["doctors", "detail", String(id)] as const,
  },
  appointments: {
    all: ["appointments"] as const,
    list: (filters?: Record<string, any>) => ["appointments", "list", filters] as const,
    detail: (id: string | number) => ["appointments", "detail", String(id)] as const,
    patient: (search: { email?: string; phone?: string; referenceNo?: string }) =>
      ["appointments", "patient", search] as const,
  },
  consultations: {
    byAppointment: (aptId: string | number) =>
      ["consultations", "appointment", String(aptId)] as const,
    detail: (id: string | number) => ["consultations", "detail", String(id)] as const,
  },
  users: {
    profile: ["users", "profile"] as const,
    patients: ["users", "patients"] as const,
  },
} as const;
