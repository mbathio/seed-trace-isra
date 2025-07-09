// backend/tests/auth.test.ts - VERSION CORRIGÉE
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
        password: "12345",
      });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("tokens");
      expect(res.body.data.tokens).toHaveProperty("accessToken");
      expect(res.body.data.tokens).toHaveProperty("refreshToken");
      expect(res.body.data).toHaveProperty("user");
      expect(res.body.data.user.email).toBe("adiop@isra.sn");
    });

    it("should reject invalid credentials", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "adiop@isra.sn",
        password: "wrongpassword",
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("should reject non-existent user", async () => {
      const res = await request(app).post("/api/auth/login").send({
        email: "nonexistent@isra.sn",
        password: "12345",
      });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const res = await request(app).post("/api/auth/register").send({
        email: "newuser@isra.sn",
        password: "securepassword123",
        name: "New User",
        role: "TECHNICIAN",
      });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("user");
      expect(res.body.data.user.email).toBe("newuser@isra.sn");
    });

    it("should reject duplicate email", async () => {
      await createTestUser({
        email: "existing@isra.sn",
        password: await EncryptionService.hashPassword("12345"),
        role: "TECHNICIAN",
      });

      const res = await request(app).post("/api/auth/register").send({
        email: "existing@isra.sn",
        password: "password123",
        name: "Duplicate User",
        role: "TECHNICIAN",
      });

      expect(res.status).toBe(400);
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

      // Le middleware de transformation convertit TECHNICIAN en technician
      // donc on doit vérifier la valeur en minuscules
      expect(res.body.data).toHaveProperty("role", "technician");
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
