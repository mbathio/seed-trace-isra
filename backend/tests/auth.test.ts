// backend/tests/auth.test.ts
import request from "supertest";
import app from "../src/app";
import { prisma, createTestUser } from "./setup";
import { EncryptionService } from "../src/utils/encryption";
import { describe, it, expect, beforeEach } from "@jest/globals";

describe("Auth Endpoints", () => {
  describe("POST /api/auth/login", () => {
    beforeEach(async () => {
      // Créer un utilisateur de test avec mot de passe hashé
      const hashedPassword = await EncryptionService.hashPassword("12345");
      await createTestUser({
        email: "adiop@isra.sn",
        password: hashedPassword,
        role: "RESEARCHER",
        name: "Amadou Diop",
      });
    });

    it("should login with valid credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "adiop@isra.sn",
        password: "123456",
      });

      // Debug : afficher la réponse en cas d'erreur
      if (res.status !== 200) {
        console.log("Response status:", res.status);
        console.log("Response body:", JSON.stringify(res.body, null, 2));
      }

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("tokens");
      expect(res.body.data.tokens).toHaveProperty("accessToken");
      expect(res.body.data.tokens).toHaveProperty("refreshToken");
      expect(res.body.data).toHaveProperty("user");
      expect(res.body.data.user.email).toBe("adiop@isra.sn");
    });

    it("should handle validation errors", async () => {
      // Test avec email invalide
      const res = await request(app).post("/api/auth/login").send({
        email: "invalid-email",
        password: "12345",
      });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
      expect(res.body.errors).toBeDefined();
    });

    it("should reject invalid credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "wrong@email.com",
        password: "wrongpassword",
      });

      // Debug : afficher la réponse
      if (res.status !== 401) {
        console.log("Response status:", res.status);
        console.log("Response body:", JSON.stringify(res.body, null, 2));
      }

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should reject wrong password", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "adiop@isra.sn",
        password: "wrongpassword",
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should reject inactive user", async () => {
      // Désactiver l'utilisateur
      await prisma.user.update({
        where: { email: "adiop@isra.sn" },
        data: { isActive: false },
      });

      const res = await request(app).post("/api/auth/login").send({
        email: "adiop@isra.sn",
        password: "12345",
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("GET /api/auth/me", () => {
    let authToken: string;

    beforeEach(async () => {
      // Créer un utilisateur et obtenir un token
      const hashedPassword = await EncryptionService.hashPassword("12345");
      const user = await createTestUser({
        email: "test@isra.sn",
        password: hashedPassword,
        role: "TECHNICIAN",
        name: "Test User",
      });

      const tokens = EncryptionService.generateTokens({
        userId: user.id,
        email: user.email,
        role: user.role,
      });

      authToken = tokens.accessToken;
    });

    it("should return current user with valid token", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("email", "test@isra.sn");
      expect(res.body.data).toHaveProperty("role", "TECHNICIAN");
    });

    it("should reject request without token", async () => {
      const res = await request(app).get("/api/auth/me");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should reject request with invalid token", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid-token");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
