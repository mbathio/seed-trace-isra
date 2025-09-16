// backend/src/services/GenealogyService.ts - VERSION CORRIGÉE COMPLÈTE

import { PrismaClient, Prisma } from "@prisma/client";
import { logger } from "../utils/logger";
import DataTransformer from "../utils/transformers";

const prisma = new PrismaClient();

// ✅ CORRECTION: Interface mise à jour avec parentLotId optionnel
export interface GenealogyNode {
  id: string;
  level: string;
  variety: {
    id: number;
    name: string;
    code: string;
  };
  quantity: number;
  productionDate: Date;
  status: string; // ✅ Format UI (transformé)
  multiplier?: {
    id: number;
    name: string;
  };
  parentLotId?: string | null; // ✅ CORRECTION: Accepter null
  children: GenealogyNode[];
  _depth?: number;
  _path?: string[];
}

export interface GenealogyRelation {
  parentId: string;
  childId: string;
  quantity: number;
  transferDate: Date;
  notes?: string;
}

export class GenealogyService {
  /**
   * ✅ CORRECTION: Récupère l'arbre généalogique complet avec transformation
   */
  static async getGenealogyTree(
    lotId: string,
    maxDepth: number = 10
  ): Promise<GenealogyNode | null> {
    try {
      logger.info(`Getting genealogy tree for lot: ${lotId}`);

      const buildTree = async (
        currentLotId: string,
        depth: number = 0,
        path: string[] = []
      ): Promise<GenealogyNode | null> => {
        if (depth > maxDepth) {
          logger.warn(
            `Maximum depth ${maxDepth} reached for lot ${currentLotId}`
          );
          return null;
        }

        if (path.includes(currentLotId)) {
          logger.warn(`Circular reference detected for lot ${currentLotId}`);
          return null;
        }

        const lot = await prisma.seedLot.findUnique({
          where: { id: currentLotId },
          include: {
            variety: {
              select: { id: true, name: true, code: true },
            },
            multiplier: {
              select: { id: true, name: true },
            },
            childLots: {
              include: {
                variety: {
                  select: { id: true, name: true, code: true },
                },
              },
            },
          },
        });

        if (!lot) {
          logger.error(`Lot not found: ${currentLotId}`);
          return null;
        }

        const currentPath = [...path, currentLotId];

        // Construire récursivement les enfants
        const children: GenealogyNode[] = [];
        for (const childLot of lot.childLots) {
          const childNode = await buildTree(
            childLot.id,
            depth + 1,
            currentPath
          );
          if (childNode) {
            children.push(childNode);
          }
        }

        // ✅ CORRECTION: Transformer le statut pour UI
        const transformedStatus =
          DataTransformer.transformLotStatusDBToUI(lot.status) || lot.status;

        return {
          id: lot.id,
          level: lot.level,
          variety: {
            id: lot.variety.id,
            name: lot.variety.name,
            code: lot.variety.code,
          },
          quantity: lot.quantity,
          productionDate: lot.productionDate,
          status: transformedStatus, // ✅ Status transformé pour UI
          multiplier: lot.multiplier
            ? {
                id: lot.multiplier.id,
                name: lot.multiplier.name,
              }
            : undefined,
          parentLotId: lot.parentLotId, // ✅ CORRECTION: Gérer null
          children,
          _depth: depth,
          _path: currentPath,
        };
      };

      const tree = await buildTree(lotId);
      return tree;
    } catch (error) {
      logger.error("Error building genealogy tree:", error);
      throw error;
    }
  }

  /**
   * ✅ CORRECTION: Récupère tous les ancêtres avec transformation
   */
  static async getAncestors(lotId: string): Promise<any[]> {
    try {
      const ancestors: any[] = [];
      let currentLotId: string | null = lotId;
      const visitedLots = new Set<string>();

      while (currentLotId) {
        if (visitedLots.has(currentLotId)) {
          logger.warn(
            `Circular reference detected in ancestors for lot ${currentLotId}`
          );
          break;
        }
        visitedLots.add(currentLotId);

        const lot: Prisma.SeedLotGetPayload<{
          include: {
            childLots: true;
            variety: true;
            multiplier: true;
            parentLot: {
              include: { variety: true };
            };
          };
        }> | null = await prisma.seedLot.findUnique({
          where: { id: currentLotId },
          include: {
            childLots: true,
            variety: true,
            multiplier: true,
            parentLot: {
              include: { variety: true },
            },
          },
        });

        if (!lot) break;

        // ✅ CORRECTION: Transformer avant d'ajouter
        const transformedLot = {
          id: lot.id,
          level: lot.level,
          variety: lot.variety,
          quantity: lot.quantity,
          productionDate: lot.productionDate,
          status:
            DataTransformer.transformLotStatusDBToUI(lot.status) || lot.status,
          multiplier: lot.multiplier,
          parentLotId: lot.parentLotId,
        };

        ancestors.push(transformedLot);
        currentLotId = lot.parentLotId;
      }

      return ancestors.reverse();
    } catch (error) {
      logger.error("Error getting ancestors:", error);
      throw error;
    }
  }

  /**
   * ✅ CORRECTION: Récupère tous les descendants avec transformation
   */
  static async getDescendants(lotId: string): Promise<any[]> {
    try {
      const descendants: any[] = [];
      const queue: string[] = [lotId];
      const visitedLots = new Set<string>();

      while (queue.length > 0) {
        const currentLotId = queue.shift()!;

        if (visitedLots.has(currentLotId)) continue;
        visitedLots.add(currentLotId);

        const childLots = await prisma.seedLot.findMany({
          where: { parentLotId: currentLotId },
          include: {
            variety: true,
            multiplier: true,
          },
        });

        for (const child of childLots) {
          // ✅ CORRECTION: Transformer avant d'ajouter
          const transformedChild = {
            id: child.id,
            level: child.level,
            variety: child.variety,
            quantity: child.quantity,
            productionDate: child.productionDate,
            status:
              DataTransformer.transformLotStatusDBToUI(child.status) ||
              child.status,
            multiplier: child.multiplier,
            parentLotId: child.parentLotId,
          };

          descendants.push(transformedChild);
          queue.push(child.id);
        }
      }

      return descendants;
    } catch (error) {
      logger.error("Error getting descendants:", error);
      throw error;
    }
  }

  /**
   * ✅ CORRECTION: Relations directes avec transformation
   */
  static async getDirectRelations(lotId: string) {
    try {
      const lot = await prisma.seedLot.findUnique({
        where: { id: lotId },
        include: {
          variety: true,
          multiplier: true,
          parentLot: {
            include: {
              variety: true,
              multiplier: true,
            },
          },
          childLots: {
            include: {
              variety: true,
              multiplier: true,
            },
          },
        },
      });

      if (!lot) {
        throw new Error(`Lot not found: ${lotId}`);
      }

      // ✅ CORRECTION: Fonction helper pour transformer un lot
      const transformLot = (seedLot: any) => ({
        id: seedLot.id,
        level: seedLot.level,
        variety: seedLot.variety,
        quantity: seedLot.quantity,
        productionDate: seedLot.productionDate,
        status:
          DataTransformer.transformLotStatusDBToUI(seedLot.status) ||
          seedLot.status,
        multiplier: seedLot.multiplier,
        parentLotId: seedLot.parentLotId,
      });

      return {
        current: transformLot(lot),
        parent: lot.parentLot ? transformLot(lot.parentLot) : null,
        children: lot.childLots.map(transformLot),
      };
    } catch (error) {
      logger.error("Error getting direct relations:", error);
      throw error;
    }
  }

  /**
   * ✅ CORRECTION: Crée une relation parent-enfant avec validation
   */
  static async createRelation(
    parentId: string,
    childId: string,
    data?: {
      quantity?: number;
      notes?: string;
    }
  ) {
    try {
      // Vérifier que les deux lots existent
      const [parent, child] = await Promise.all([
        prisma.seedLot.findUnique({ where: { id: parentId } }),
        prisma.seedLot.findUnique({ where: { id: childId } }),
      ]);

      if (!parent) throw new Error(`Parent lot not found: ${parentId}`);
      if (!child) throw new Error(`Child lot not found: ${childId}`);

      if (child.parentLotId) {
        throw new Error(
          `Child lot ${childId} already has a parent: ${child.parentLotId}`
        );
      }

      // Vérifier la hiérarchie des niveaux
      const levelHierarchy = ["GO", "G1", "G2", "G3", "G4", "R1", "R2"];
      const parentIndex = levelHierarchy.indexOf(parent.level);
      const childIndex = levelHierarchy.indexOf(child.level);

      if (parentIndex >= childIndex) {
        throw new Error(
          `Invalid hierarchy: ${parent.level} cannot be parent of ${child.level}`
        );
      }

      // Vérifier qu'on ne crée pas de cycle
      const ancestors = await this.getAncestors(parentId);
      if (ancestors.some((a) => a.id === childId)) {
        throw new Error(`Creating this relation would create a cycle`);
      }

      // Mettre à jour le lot enfant
      const updatedChild = await prisma.seedLot.update({
        where: { id: childId },
        data: {
          parentLotId: parentId,
          notes: data?.notes
            ? `${child.notes || ""}\n${data.notes}`.trim()
            : child.notes,
        },
        include: {
          variety: true,
          multiplier: true,
          parentLot: {
            include: { variety: true },
          },
        },
      });

      // Si une quantité est spécifiée, mettre à jour la quantité du parent
      if (data?.quantity && data.quantity > 0) {
        await prisma.seedLot.update({
          where: { id: parentId },
          data: {
            quantity: parent.quantity - data.quantity,
          },
        });
      }

      logger.info(`Created relation: ${parentId} -> ${childId}`);

      // ✅ CORRECTION: Transformer avant de retourner
      return DataTransformer.transformSeedLot(updatedChild);
    } catch (error) {
      logger.error("Error creating relation:", error);
      throw error;
    }
  }

  /**
   * ✅ CORRECTION: Supprime une relation parent-enfant
   */
  static async removeRelation(childId: string) {
    try {
      const child = await prisma.seedLot.findUnique({
        where: { id: childId },
      });

      if (!child) {
        throw new Error(`Child lot not found: ${childId}`);
      }

      if (!child.parentLotId) {
        throw new Error(`Lot ${childId} has no parent relation`);
      }

      const updatedChild = await prisma.seedLot.update({
        where: { id: childId },
        data: {
          parentLotId: null,
        },
        include: {
          variety: true,
          multiplier: true,
        },
      });

      logger.info(`Removed parent relation from lot: ${childId}`);

      // ✅ CORRECTION: Transformer avant de retourner
      return DataTransformer.transformSeedLot(updatedChild);
    } catch (error) {
      logger.error("Error removing relation:", error);
      throw error;
    }
  }

  /**
   * ✅ CORRECTION: Met à jour une relation existante
   */
  static async updateRelation(
    childId: string,
    data: {
      newParentId?: string;
      notes?: string;
    }
  ) {
    try {
      const child = await prisma.seedLot.findUnique({
        where: { id: childId },
      });

      if (!child) {
        throw new Error(`Child lot not found: ${childId}`);
      }

      const updateData: Prisma.SeedLotUpdateInput = {};

      if (data.newParentId) {
        const newParent = await prisma.seedLot.findUnique({
          where: { id: data.newParentId },
        });

        if (!newParent) {
          throw new Error(`New parent lot not found: ${data.newParentId}`);
        }

        // Vérifier la hiérarchie
        const levelHierarchy = ["GO", "G1", "G2", "G3", "G4", "R1", "R2"];
        const parentIndex = levelHierarchy.indexOf(newParent.level);
        const childIndex = levelHierarchy.indexOf(child.level);

        if (parentIndex >= childIndex) {
          throw new Error(
            `Invalid hierarchy: ${newParent.level} cannot be parent of ${child.level}`
          );
        }

        updateData.parentLot = {
          connect: { id: data.newParentId },
        };
      }

      if (data.notes) {
        updateData.notes = data.notes;
      }

      const updatedChild = await prisma.seedLot.update({
        where: { id: childId },
        data: updateData,
        include: {
          variety: true,
          multiplier: true,
          parentLot: {
            include: { variety: true },
          },
        },
      });

      logger.info(`Updated relation for lot: ${childId}`);

      // ✅ CORRECTION: Transformer avant de retourner
      return DataTransformer.transformSeedLot(updatedChild);
    } catch (error) {
      logger.error("Error updating relation:", error);
      throw error;
    }
  }

  /**
   * ✅ CORRECTION: Statistiques de généalogie avec transformation
   */
  static async getGenealogyStats(lotId: string) {
    try {
      const [ancestors, descendants, directRelations] = await Promise.all([
        this.getAncestors(lotId),
        this.getDescendants(lotId),
        this.getDirectRelations(lotId),
      ]);

      const stats = {
        totalAncestors: ancestors.length - 1,
        totalDescendants: descendants.length,
        totalDirectChildren: directRelations.children.length,
        hasParent: !!directRelations.parent,
        depth: ancestors.length,
        breadth: directRelations.children.length,

        // Statistiques par niveau
        descendantsByLevel: descendants.reduce((acc, desc) => {
          acc[desc.level] = (acc[desc.level] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),

        // Quantités totales
        totalQuantityInDescendants: descendants.reduce(
          (sum, desc) => sum + desc.quantity,
          0
        ),

        // Multiplicateurs impliqués
        multipliers: Array.from(
          new Set([
            ...ancestors
              .filter((a) => a.multiplier)
              .map((a) => a.multiplier.name),
            ...descendants
              .filter((d) => d.multiplier)
              .map((d) => d.multiplier.name),
          ])
        ),
      };

      return stats;
    } catch (error) {
      logger.error("Error getting genealogy stats:", error);
      throw error;
    }
  }

  /**
   * ✅ CORRECTION: Vérification de cohérence avec transformation
   */
  static async checkGenealogyConsistency(lotId: string) {
    try {
      const issues: string[] = [];
      const tree = await this.getGenealogyTree(lotId);

      if (!tree) {
        return { isConsistent: false, issues: [`Lot ${lotId} not found`] };
      }

      // Vérifier les cycles
      const checkCycles = (
        node: GenealogyNode,
        visited: Set<string> = new Set()
      ): boolean => {
        if (visited.has(node.id)) {
          issues.push(`Cycle detected at lot ${node.id}`);
          return true;
        }
        visited.add(node.id);

        for (const child of node.children) {
          if (checkCycles(child, new Set(visited))) {
            return true;
          }
        }
        return false;
      };

      checkCycles(tree);

      // Vérifier la hiérarchie des niveaux
      const levelHierarchy = ["GO", "G1", "G2", "G3", "G4", "R1", "R2"];

      const checkHierarchy = (node: GenealogyNode) => {
        const parentIndex = levelHierarchy.indexOf(node.level);

        for (const child of node.children) {
          const childIndex = levelHierarchy.indexOf(child.level);

          if (parentIndex >= childIndex) {
            issues.push(
              `Invalid hierarchy: ${node.id} (${node.level}) -> ${child.id} (${child.level})`
            );
          }

          checkHierarchy(child);
        }
      };

      checkHierarchy(tree);

      // Vérifier les quantités
      const checkQuantities = (node: GenealogyNode) => {
        const totalChildQuantity = node.children.reduce(
          (sum, child) => sum + child.quantity,
          0
        );

        if (totalChildQuantity > node.quantity) {
          issues.push(
            `Quantity inconsistency at lot ${node.id}: children total (${totalChildQuantity}) > parent (${node.quantity})`
          );
        }

        for (const child of node.children) {
          checkQuantities(child);
        }
      };

      checkQuantities(tree);

      return {
        isConsistent: issues.length === 0,
        issues,
      };
    } catch (error) {
      logger.error("Error checking genealogy consistency:", error);
      throw error;
    }
  }

  /**
   * ✅ CORRECTION: Export de généalogie avec transformation
   */
  static async exportGenealogy(
    lotId: string,
    format: "json" | "csv" | "dot" = "json"
  ) {
    try {
      const tree = await this.getGenealogyTree(lotId);

      if (!tree) {
        throw new Error(`Lot not found: ${lotId}`);
      }

      switch (format) {
        case "json":
          return JSON.stringify(tree, null, 2);

        case "csv":
          const rows: string[] = [
            "Parent ID,Parent Level,Child ID,Child Level,Quantity,Production Date,Status",
          ];

          const addRows = (node: GenealogyNode, parentId?: string) => {
            if (parentId) {
              rows.push(
                `${parentId},${node.level},${node.id},${node.level},${node.quantity},${node.productionDate},${node.status}`
              );
            }

            for (const child of node.children) {
              addRows(child, node.id);
            }
          };

          addRows(tree);
          return rows.join("\n");

        case "dot":
          // Format Graphviz DOT pour visualisation
          const dotLines: string[] = ["digraph Genealogy {"];
          dotLines.push("  rankdir=TB;");
          dotLines.push("  node [shape=box];");

          const addNodes = (node: GenealogyNode) => {
            const label = `${node.id}\\n${node.level}\\n${node.quantity}kg`;
            const color =
              node.status === "certified"
                ? "green"
                : node.status === "rejected"
                ? "red"
                : "black";
            dotLines.push(
              `  "${node.id}" [label="${label}", color="${color}"];`
            );

            for (const child of node.children) {
              dotLines.push(`  "${node.id}" -> "${child.id}";`);
              addNodes(child);
            }
          };

          addNodes(tree);
          dotLines.push("}");
          return dotLines.join("\n");

        default:
          throw new Error(`Unsupported format: ${format}`);
      }
    } catch (error) {
      logger.error("Error exporting genealogy:", error);
      throw error;
    }
  }
}
