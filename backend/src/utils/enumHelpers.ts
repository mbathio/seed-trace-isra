// backend/src/utils/enumHelpers.ts - NOUVEAU FICHIER
import {
  Role,
  CropType,
  LotStatus,
  ParcelStatus,
  ProductionStatus,
  TestResult,
  MultiplierStatus,
  CertificationLevel,
  ContractStatus,
  SeedLevel,
  ActivityType,
  IssueType,
  IssueSeverity,
  ReportType,
} from "@prisma/client";

// Types pour les valeurs UI
export type UIRole =
  | "admin"
  | "manager"
  | "inspector"
  | "multiplier"
  | "guest"
  | "technician"
  | "researcher";
export type UICropType =
  | "rice"
  | "maize"
  | "peanut"
  | "sorghum"
  | "cowpea"
  | "millet"
  | "wheat";
export type UILotStatus =
  | "pending"
  | "certified"
  | "rejected"
  | "in-stock"
  | "sold"
  | "active"
  | "distributed";
export type UITestResult = "pass" | "fail";
export type UIParcelStatus = "available" | "in-use" | "resting";
export type UIProductionStatus =
  | "planned"
  | "in-progress"
  | "completed"
  | "cancelled";
export type UIMultiplierStatus = "active" | "inactive";
export type UICertificationLevel = "beginner" | "intermediate" | "expert";
export type UIContractStatus = "draft" | "active" | "completed" | "cancelled";
export type UIActivityType =
  | "soil-preparation"
  | "sowing"
  | "fertilization"
  | "irrigation"
  | "weeding"
  | "pest-control"
  | "harvest"
  | "other";
export type UIIssueType =
  | "disease"
  | "pest"
  | "weather"
  | "management"
  | "other";
export type UIIssueSeverity = "low" | "medium" | "high";
export type UIReportType =
  | "production"
  | "quality"
  | "inventory"
  | "multiplier-performance"
  | "custom";

// Classe helper pour les transformations
export class EnumTransformer {
  // Transformation des rôles
  static transformRole(
    value: string | Role,
    direction: "toDb" | "toUi"
  ): Role | UIRole | undefined {
    const roleMap = {
      toDb: {
        admin: Role.ADMIN,
        manager: Role.MANAGER,
        inspector: Role.INSPECTOR,
        multiplier: Role.MULTIPLIER,
        guest: Role.GUEST,
        technician: Role.TECHNICIAN,
        researcher: Role.RESEARCHER,
      } as const,
      toUi: {
        [Role.ADMIN]: "admin",
        [Role.MANAGER]: "manager",
        [Role.INSPECTOR]: "inspector",
        [Role.MULTIPLIER]: "multiplier",
        [Role.GUEST]: "guest",
        [Role.TECHNICIAN]: "technician",
        [Role.RESEARCHER]: "researcher",
      } as const,
    };

    if (direction === "toDb") {
      return roleMap.toDb[value as UIRole];
    } else {
      return roleMap.toUi[value as Role];
    }
  }

  // Transformation des types de cultures
  static transformCropType(
    value: string | CropType,
    direction: "toDb" | "toUi"
  ): CropType | UICropType | undefined {
    const cropTypeMap = {
      toDb: {
        rice: CropType.RICE,
        maize: CropType.MAIZE,
        peanut: CropType.PEANUT,
        sorghum: CropType.SORGHUM,
        cowpea: CropType.COWPEA,
        millet: CropType.MILLET,
        wheat: CropType.WHEAT,
      } as const,
      toUi: {
        [CropType.RICE]: "rice",
        [CropType.MAIZE]: "maize",
        [CropType.PEANUT]: "peanut",
        [CropType.SORGHUM]: "sorghum",
        [CropType.COWPEA]: "cowpea",
        [CropType.MILLET]: "millet",
        [CropType.WHEAT]: "wheat",
      } as const,
    };

    if (direction === "toDb") {
      return cropTypeMap.toDb[value as UICropType];
    } else {
      return cropTypeMap.toUi[value as CropType];
    }
  }

  // Transformation des statuts de lots
  static transformLotStatus(
    value: string | LotStatus,
    direction: "toDb" | "toUi"
  ): LotStatus | UILotStatus | undefined {
    const statusMap = {
      toDb: {
        pending: LotStatus.PENDING,
        certified: LotStatus.CERTIFIED,
        rejected: LotStatus.REJECTED,
        "in-stock": LotStatus.IN_STOCK,
        sold: LotStatus.SOLD,
        active: LotStatus.ACTIVE,
        distributed: LotStatus.DISTRIBUTED,
      } as const,
      toUi: {
        [LotStatus.PENDING]: "pending",
        [LotStatus.CERTIFIED]: "certified",
        [LotStatus.REJECTED]: "rejected",
        [LotStatus.IN_STOCK]: "in-stock",
        [LotStatus.SOLD]: "sold",
        [LotStatus.ACTIVE]: "active",
        [LotStatus.DISTRIBUTED]: "distributed",
      } as const,
    };

    if (direction === "toDb") {
      return statusMap.toDb[value as UILotStatus];
    } else {
      return statusMap.toUi[value as LotStatus];
    }
  }

  // Transformation des résultats de tests
  static transformTestResult(
    value: string | TestResult,
    direction: "toDb" | "toUi"
  ): TestResult | UITestResult | undefined {
    const resultMap = {
      toDb: {
        pass: TestResult.PASS,
        fail: TestResult.FAIL,
      } as const,
      toUi: {
        [TestResult.PASS]: "pass",
        [TestResult.FAIL]: "fail",
      } as const,
    };

    if (direction === "toDb") {
      return resultMap.toDb[value as UITestResult];
    } else {
      return resultMap.toUi[value as TestResult];
    }
  }

  // Transformation des statuts de parcelles
  static transformParcelStatus(
    value: string | ParcelStatus,
    direction: "toDb" | "toUi"
  ): ParcelStatus | UIParcelStatus | undefined {
    const statusMap = {
      toDb: {
        available: ParcelStatus.AVAILABLE,
        "in-use": ParcelStatus.IN_USE,
        resting: ParcelStatus.RESTING,
      } as const,
      toUi: {
        [ParcelStatus.AVAILABLE]: "available",
        [ParcelStatus.IN_USE]: "in-use",
        [ParcelStatus.RESTING]: "resting",
      } as const,
    };

    if (direction === "toDb") {
      return statusMap.toDb[value as UIParcelStatus];
    } else {
      return statusMap.toUi[value as ParcelStatus];
    }
  }

  // Transformation des statuts de production
  static transformProductionStatus(
    value: string | ProductionStatus,
    direction: "toDb" | "toUi"
  ): ProductionStatus | UIProductionStatus | undefined {
    const statusMap = {
      toDb: {
        planned: ProductionStatus.PLANNED,
        "in-progress": ProductionStatus.IN_PROGRESS,
        completed: ProductionStatus.COMPLETED,
        cancelled: ProductionStatus.CANCELLED,
      } as const,
      toUi: {
        [ProductionStatus.PLANNED]: "planned",
        [ProductionStatus.IN_PROGRESS]: "in-progress",
        [ProductionStatus.COMPLETED]: "completed",
        [ProductionStatus.CANCELLED]: "cancelled",
      } as const,
    };

    if (direction === "toDb") {
      return statusMap.toDb[value as UIProductionStatus];
    } else {
      return statusMap.toUi[value as ProductionStatus];
    }
  }

  // Transformation des statuts de multiplicateurs
  static transformMultiplierStatus(
    value: string | MultiplierStatus,
    direction: "toDb" | "toUi"
  ): MultiplierStatus | UIMultiplierStatus | undefined {
    const statusMap = {
      toDb: {
        active: MultiplierStatus.ACTIVE,
        inactive: MultiplierStatus.INACTIVE,
      } as const,
      toUi: {
        [MultiplierStatus.ACTIVE]: "active",
        [MultiplierStatus.INACTIVE]: "inactive",
      } as const,
    };

    if (direction === "toDb") {
      return statusMap.toDb[value as UIMultiplierStatus];
    } else {
      return statusMap.toUi[value as MultiplierStatus];
    }
  }

  // Transformation des niveaux de certification
  static transformCertificationLevel(
    value: string | CertificationLevel,
    direction: "toDb" | "toUi"
  ): CertificationLevel | UICertificationLevel | undefined {
    const levelMap = {
      toDb: {
        beginner: CertificationLevel.BEGINNER,
        intermediate: CertificationLevel.INTERMEDIATE,
        expert: CertificationLevel.EXPERT,
      } as const,
      toUi: {
        [CertificationLevel.BEGINNER]: "beginner",
        [CertificationLevel.INTERMEDIATE]: "intermediate",
        [CertificationLevel.EXPERT]: "expert",
      } as const,
    };

    if (direction === "toDb") {
      return levelMap.toDb[value as UICertificationLevel];
    } else {
      return levelMap.toUi[value as CertificationLevel];
    }
  }

  // Transformation des statuts de contrats
  static transformContractStatus(
    value: string | ContractStatus,
    direction: "toDb" | "toUi"
  ): ContractStatus | UIContractStatus | undefined {
    const statusMap = {
      toDb: {
        draft: ContractStatus.DRAFT,
        active: ContractStatus.ACTIVE,
        completed: ContractStatus.COMPLETED,
        cancelled: ContractStatus.CANCELLED,
      } as const,
      toUi: {
        [ContractStatus.DRAFT]: "draft",
        [ContractStatus.ACTIVE]: "active",
        [ContractStatus.COMPLETED]: "completed",
        [ContractStatus.CANCELLED]: "cancelled",
      } as const,
    };

    if (direction === "toDb") {
      return statusMap.toDb[value as UIContractStatus];
    } else {
      return statusMap.toUi[value as ContractStatus];
    }
  }

  // Transformation des types d'activités
  static transformActivityType(
    value: string | ActivityType,
    direction: "toDb" | "toUi"
  ): ActivityType | UIActivityType | undefined {
    const typeMap = {
      toDb: {
        "soil-preparation": ActivityType.SOIL_PREPARATION,
        sowing: ActivityType.SOWING,
        fertilization: ActivityType.FERTILIZATION,
        irrigation: ActivityType.IRRIGATION,
        weeding: ActivityType.WEEDING,
        "pest-control": ActivityType.PEST_CONTROL,
        harvest: ActivityType.HARVEST,
        other: ActivityType.OTHER,
      } as const,
      toUi: {
        [ActivityType.SOIL_PREPARATION]: "soil-preparation",
        [ActivityType.SOWING]: "sowing",
        [ActivityType.FERTILIZATION]: "fertilization",
        [ActivityType.IRRIGATION]: "irrigation",
        [ActivityType.WEEDING]: "weeding",
        [ActivityType.PEST_CONTROL]: "pest-control",
        [ActivityType.HARVEST]: "harvest",
        [ActivityType.OTHER]: "other",
      } as const,
    };

    if (direction === "toDb") {
      return typeMap.toDb[value as UIActivityType];
    } else {
      return typeMap.toUi[value as ActivityType];
    }
  }

  // Transformation des types de problèmes
  static transformIssueType(
    value: string | IssueType,
    direction: "toDb" | "toUi"
  ): IssueType | UIIssueType | undefined {
    const typeMap = {
      toDb: {
        disease: IssueType.DISEASE,
        pest: IssueType.PEST,
        weather: IssueType.WEATHER,
        management: IssueType.MANAGEMENT,
        other: IssueType.OTHER,
      } as const,
      toUi: {
        [IssueType.DISEASE]: "disease",
        [IssueType.PEST]: "pest",
        [IssueType.WEATHER]: "weather",
        [IssueType.MANAGEMENT]: "management",
        [IssueType.OTHER]: "other",
      } as const,
    };

    if (direction === "toDb") {
      return typeMap.toDb[value as UIIssueType];
    } else {
      return typeMap.toUi[value as IssueType];
    }
  }

  // Transformation de la sévérité des problèmes
  static transformIssueSeverity(
    value: string | IssueSeverity,
    direction: "toDb" | "toUi"
  ): IssueSeverity | UIIssueSeverity | undefined {
    const severityMap = {
      toDb: {
        low: IssueSeverity.LOW,
        medium: IssueSeverity.MEDIUM,
        high: IssueSeverity.HIGH,
      } as const,
      toUi: {
        [IssueSeverity.LOW]: "low",
        [IssueSeverity.MEDIUM]: "medium",
        [IssueSeverity.HIGH]: "high",
      } as const,
    };

    if (direction === "toDb") {
      return severityMap.toDb[value as UIIssueSeverity];
    } else {
      return severityMap.toUi[value as IssueSeverity];
    }
  }

  // Transformation des types de rapports
  static transformReportType(
    value: string | ReportType,
    direction: "toDb" | "toUi"
  ): ReportType | UIReportType | undefined {
    const typeMap = {
      toDb: {
        production: ReportType.PRODUCTION,
        quality: ReportType.QUALITY,
        inventory: ReportType.INVENTORY,
        "multiplier-performance": ReportType.MULTIPLIER_PERFORMANCE,
        custom: ReportType.CUSTOM,
      } as const,
      toUi: {
        [ReportType.PRODUCTION]: "production",
        [ReportType.QUALITY]: "quality",
        [ReportType.INVENTORY]: "inventory",
        [ReportType.MULTIPLIER_PERFORMANCE]: "multiplier-performance",
        [ReportType.CUSTOM]: "custom",
      } as const,
    };

    if (direction === "toDb") {
      return typeMap.toDb[value as UIReportType];
    } else {
      return typeMap.toUi[value as ReportType];
    }
  }

  // Vérifier si une valeur est un enum DB valide
  static isDbEnum(
    value: any,
    enumType:
      | "role"
      | "cropType"
      | "lotStatus"
      | "testResult"
      | "parcelStatus"
      | "productionStatus"
      | "multiplierStatus"
      | "certificationLevel"
      | "contractStatus"
      | "activityType"
      | "issueType"
      | "issueSeverity"
      | "reportType"
  ): boolean {
    switch (enumType) {
      case "role":
        return Object.values(Role).includes(value);
      case "cropType":
        return Object.values(CropType).includes(value);
      case "lotStatus":
        return Object.values(LotStatus).includes(value);
      case "testResult":
        return Object.values(TestResult).includes(value);
      case "parcelStatus":
        return Object.values(ParcelStatus).includes(value);
      case "productionStatus":
        return Object.values(ProductionStatus).includes(value);
      case "multiplierStatus":
        return Object.values(MultiplierStatus).includes(value);
      case "certificationLevel":
        return Object.values(CertificationLevel).includes(value);
      case "contractStatus":
        return Object.values(ContractStatus).includes(value);
      case "activityType":
        return Object.values(ActivityType).includes(value);
      case "issueType":
        return Object.values(IssueType).includes(value);
      case "issueSeverity":
        return Object.values(IssueSeverity).includes(value);
      case "reportType":
        return Object.values(ReportType).includes(value);
      default:
        return false;
    }
  }
}
