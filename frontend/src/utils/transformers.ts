// frontend/src/utils/transformers.ts - VERSION CORRIGÉE COMPLÈTE
export class DataTransformer {
  // Mappings bidirectionnels pour les statuts de lots
  private static readonly LOT_STATUS_DB_TO_UI: Record<string, string> = {
    PENDING: "pending",
    CERTIFIED: "certified",
    REJECTED: "rejected",
    IN_STOCK: "in-stock",
    SOLD: "sold",
    ACTIVE: "active",
    DISTRIBUTED: "distributed",
  };

  private static readonly LOT_STATUS_UI_TO_DB: Record<string, string> = {
    pending: "PENDING",
    certified: "CERTIFIED",
    rejected: "REJECTED",
    "in-stock": "IN_STOCK",
    sold: "SOLD",
    active: "ACTIVE",
    distributed: "DISTRIBUTED",
  };

  // Mappings pour les rôles
  private static readonly ROLE_DB_TO_UI: Record<string, string> = {
    ADMIN: "admin",
    MANAGER: "manager",
    INSPECTOR: "inspector",
    MULTIPLIER: "multiplier",
    GUEST: "guest",
    TECHNICIAN: "technician",
    RESEARCHER: "researcher",
  };

  private static readonly ROLE_UI_TO_DB: Record<string, string> = {
    admin: "ADMIN",
    manager: "MANAGER",
    inspector: "INSPECTOR",
    multiplier: "MULTIPLIER",
    guest: "GUEST",
    technician: "TECHNICIAN",
    researcher: "RESEARCHER",
  };

  // Mappings pour les types de culture
  private static readonly CROP_TYPE_DB_TO_UI: Record<string, string> = {
    RICE: "rice",
    MAIZE: "maize",
    PEANUT: "peanut",
    SORGHUM: "sorghum",
    COWPEA: "cowpea",
    MILLET: "millet",
  };

  private static readonly CROP_TYPE_UI_TO_DB: Record<string, string> = {
    rice: "RICE",
    maize: "MAIZE",
    peanut: "PEANUT",
    sorghum: "SORGHUM",
    cowpea: "COWPEA",
    millet: "MILLET",
  };

  // Méthodes de transformation
  static transformLotStatusDBToUI(status: string): string {
    return (
      this.LOT_STATUS_DB_TO_UI[status] ||
      status.toLowerCase().replace(/_/g, "-")
    );
  }

  static transformLotStatusUIToDB(status: string): string {
    return (
      this.LOT_STATUS_UI_TO_DB[status] ||
      status.toUpperCase().replace(/-/g, "_")
    );
  }

  static transformRoleDBToUI(role: string): string {
    return this.ROLE_DB_TO_UI[role] || role.toLowerCase();
  }

  static transformRoleUIToDB(role: string): string {
    return this.ROLE_UI_TO_DB[role] || role.toUpperCase();
  }

  static transformCropTypeDBToUI(cropType: string): string {
    return this.CROP_TYPE_DB_TO_UI[cropType] || cropType.toLowerCase();
  }

  static transformCropTypeUIToDB(cropType: string): string {
    return this.CROP_TYPE_UI_TO_DB[cropType] || cropType.toUpperCase();
  }

  // Transformation complète des entités
  static transformSeedLot(lot: any): any {
    if (!lot) return null;

    return {
      ...lot,
      status: this.transformLotStatusDBToUI(lot.status),
      variety: lot.variety
        ? {
            ...lot.variety,
            cropType: this.transformCropTypeDBToUI(lot.variety.cropType),
          }
        : undefined,
      multiplier: lot.multiplier
        ? this.transformMultiplier(lot.multiplier)
        : undefined,
      productionDate:
        lot.productionDate?.split?.("T")?.[0] || lot.productionDate,
      expiryDate: lot.expiryDate?.split?.("T")?.[0] || lot.expiryDate,
    };
  }

  static transformSeedLotForAPI(lot: any): any {
    if (!lot) return null;

    return {
      ...lot,
      status: lot.status
        ? this.transformLotStatusUIToDB(lot.status)
        : undefined,
    };
  }

  static transformVariety(variety: any): any {
    if (!variety) return null;

    return {
      ...variety,
      cropType: this.transformCropTypeDBToUI(variety.cropType),
    };
  }

  static transformVarietyForAPI(variety: any): any {
    if (!variety) return null;

    return {
      ...variety,
      cropType: variety.cropType
        ? this.transformCropTypeUIToDB(variety.cropType)
        : undefined,
    };
  }

  static transformMultiplier(multiplier: any): any {
    if (!multiplier) return null;

    return {
      ...multiplier,
      status: multiplier.status?.toLowerCase() || multiplier.status,
      certificationLevel:
        multiplier.certificationLevel?.toLowerCase() ||
        multiplier.certificationLevel,
      specialization:
        multiplier.specialization?.map?.((spec: string) =>
          this.transformCropTypeDBToUI(spec)
        ) || [],
    };
  }

  static transformMultiplierForAPI(multiplier: any): any {
    if (!multiplier) return null;

    return {
      ...multiplier,
      status: multiplier.status?.toUpperCase(),
      certificationLevel: multiplier.certificationLevel?.toUpperCase(),
      specialization: multiplier.specialization?.map?.((spec: string) =>
        this.transformCropTypeUIToDB(spec)
      ),
    };
  }

  static transformQualityControl(qc: any): any {
    if (!qc) return null;

    return {
      ...qc,
      result: qc.result?.toLowerCase() || qc.result,
      seedLot: qc.seedLot ? this.transformSeedLot(qc.seedLot) : undefined,
      controlDate: qc.controlDate?.split?.("T")?.[0] || qc.controlDate,
    };
  }

  static transformUser(user: any): any {
    if (!user) return null;

    return {
      ...user,
      role: this.transformRoleDBToUI(user.role),
    };
  }

  // Validation des transformations
  static validateTransformation(original: any, transformed: any): boolean {
    try {
      if (!original && !transformed) return true;
      if (!original || !transformed) return false;

      const criticalFields = ["id", "name", "code"];
      for (const field of criticalFields) {
        if (original[field] && original[field] !== transformed[field]) {
          console.warn(`Transformation warning: ${field} changed`);
        }
      }
      return true;
    } catch {
      return false;
    }
  }
}
