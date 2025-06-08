// Transforme les données entre le format API et le format UI
export class DataTransformer {
  // Transformer les statuts de la DB vers le frontend
  static transformStatusFromDB(status: string): string {
    return status.toLowerCase().replace("_", "-");
  }

  // Transformer les statuts du frontend vers la DB
  static transformStatusToDB(status: string): string {
    return status.toUpperCase().replace("-", "_");
  }

  // Transformer un rôle de la DB vers le frontend
  static transformRoleFromDB(role: string): string {
    return role.toLowerCase();
  }

  // Transformer un rôle du frontend vers la DB
  static transformRoleToDB(role: string): string {
    return role.toUpperCase();
  }

  // Transformer les données de lot de semences
  static transformSeedLot(lot: any): any {
    return {
      ...lot,
      status: this.transformStatusFromDB(lot.status),
      variety: lot.variety
        ? {
            ...lot.variety,
            cropType: lot.variety.cropType.toLowerCase(),
          }
        : undefined,
      multiplier: lot.multiplier
        ? {
            ...lot.multiplier,
            status: this.transformStatusFromDB(lot.multiplier.status),
            certificationLevel: lot.multiplier.certificationLevel.toLowerCase(),
          }
        : undefined,
    };
  }

  // Transformer les données avant envoi à l'API
  static transformSeedLotForAPI(lot: any): any {
    return {
      ...lot,
      status: lot.status ? this.transformStatusToDB(lot.status) : undefined,
    };
  }
}
