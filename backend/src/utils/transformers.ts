// src/utils/transformers.ts
export class DataTransformer {
  // Transformer les données de la DB vers le frontend
  static transformUser(user: any) {
    return {
      ...user,
      role: user.role.toLowerCase(),
    };
  }

  static transformSeedLot(lot: any) {
    return {
      ...lot,
      status: lot.status.toLowerCase().replace("_", "-"),
      variety: lot.variety
        ? {
            ...lot.variety,
            cropType: lot.variety.cropType.toLowerCase(),
          }
        : undefined,
      multiplier: lot.multiplier
        ? {
            ...lot.multiplier,
            status: lot.multiplier.status.toLowerCase(),
            certificationLevel: lot.multiplier.certificationLevel.toLowerCase(),
          }
        : undefined,
      parcel: lot.parcel
        ? {
            ...lot.parcel,
            status: lot.parcel.status.toLowerCase().replace("_", "-"),
          }
        : undefined,
    };
  }

  static transformProduction(production: any) {
    return {
      ...production,
      status: production.status.toLowerCase().replace("_", "-"),
      activities: production.activities?.map((a: any) => ({
        ...a,
        type: a.type.toLowerCase(),
      })),
      issues: production.issues?.map((i: any) => ({
        ...i,
        type: i.type.toLowerCase(),
        severity: i.severity.toLowerCase(),
      })),
    };
  }

  static transformQualityControl(qc: any) {
    return {
      ...qc,
      result: qc.result.toLowerCase(),
      seedLot: qc.seedLot ? this.transformSeedLot(qc.seedLot) : undefined,
    };
  }

  // Transformer les données du frontend vers la DB
  static transformInputRole(role: string): string {
    return role.toUpperCase();
  }

  static transformInputStatus(status: string): string {
    return status.toUpperCase().replace("-", "_");
  }

  static transformInputCropType(type: string): string {
    return type.toUpperCase();
  }
}
