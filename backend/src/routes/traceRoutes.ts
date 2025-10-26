import { Router, Request, Response } from "express";
import { SeedLotService } from "../services/SeedLotService";

const router = Router();

router.get(
  "/:id",
  async (req: Request, res: Response): Promise<Response | void> => {
    try {
      const { id } = req.params;
      const lot = await SeedLotService.getSeedLotById(id, true);

      if (!lot) {
        return res.status(404).send(`
        <html lang="fr">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Lot introuvable - ISRA</title>
            <style>
              body { font-family: 'Segoe UI', Arial, sans-serif; background: #f8f9fa; color: #333; text-align: center; padding: 2rem; }
              .card { background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); max-width: 500px; margin: 2rem auto; padding: 2rem; }
              h1 { color: #d32f2f; }
            </style>
          </head>
          <body>
            <div class="card">
              <h1>Lot introuvable</h1>
              <p>Aucun lot trouvé pour l'identifiant <b>${id}</b>.</p>
              <p><a href="/">Retour</a></p>
            </div>
          </body>
        </html>
      `);
      }

      const dateProd = new Date(lot.productionDate).toLocaleDateString("fr-FR");

      return res.send(`
      <html lang="fr">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Traçabilité Lot ${lot.id} - ISRA</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; background: linear-gradient(180deg, #e8f5e9, #ffffff); color: #333; margin: 0; padding: 1.5rem; }
            .card { max-width: 700px; margin: 2rem auto; background: white; border-radius: 20px; padding: 2rem; box-shadow: 0 6px 16px rgba(0,0,0,0.08); }
            .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #e0f2f1; padding-bottom: 1rem; margin-bottom: 1.5rem; }
            .header h1 { color: #2e7d32; margin: 0; font-size: 1.8rem; }
            .badge { background: #2e7d32; color: white; border-radius: 8px; padding: 0.25rem 0.6rem; font-size: 0.8rem; }
            .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; }
            .item { background: #f9fbe7; border-radius: 10px; padding: 0.8rem 1rem; font-size: 0.95rem; box-shadow: inset 0 0 3px rgba(0,0,0,0.05); }
            .item b { color: #1b5e20; }
            footer { text-align: center; color: #777; margin-top: 2rem; font-size: 0.85rem; }
            img { height: 50px; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="header">
              <h1>${lot.id}</h1>
              <img src="https://isra.sn/wp-content/uploads/2020/07/logo-isra.png" alt="ISRA" />
            </div>

            <p>
              <span class="badge">${lot.level}</span> — 
              <b>${lot.status}</b>
            </p>

            <div class="grid">
              <div class="item"><b>Variété :</b> ${
                lot.variety?.name || "—"
              }</div>
              <div class="item"><b>Quantité :</b> ${lot.quantity} kg</div>
              <div class="item"><b>Date de production :</b> ${dateProd}</div>
              <div class="item"><b>Multiplicateur :</b> ${
                lot.multiplier?.name || "—"
              }</div>
              <div class="item"><b>Parcelle :</b> ${
                lot.parcel?.code || "—"
              }</div>
              <div class="item"><b>Notes :</b> ${lot.notes || "Aucune"}</div>
            </div>

            <footer>
              Institut Sénégalais de Recherches Agricoles (ISRA) — CRA Saint-Louis
            </footer>
          </div>
        </body>
      </html>
    `);
    } catch (error) {
      console.error("Erreur route trace:", error);
      return res.status(500).send(`
      <html><body style="font-family:Arial;text-align:center;padding:2rem;">
        <h2 style="color:#d32f2f;">Erreur interne</h2>
        <p>Impossible d'afficher les informations du lot.</p>
      </body></html>
    `);
    }
  }
);

export default router;
