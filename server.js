const express = require("express");
const swaggerUi = require("swagger-ui-express");

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json());

const openapi = {
  openapi: "3.0.3",
  info: {
    title: "SpainIP APISIX mock API",
    version: "1.0.0",
    description: "A deliberately small API for testing APISIX routing, API keys and rate limits."
  },
  servers: [{ url: "/" }],
  paths: {
    "/healthz": {
      get: {
        summary: "Health check",
        responses: { "200": { description: "Healthy" } }
      }
    },
    "/v1/hello": {
      get: {
        summary: "Public hello endpoint",
        responses: {
          "200": {
            description: "A greeting",
            content: { "application/json": { schema: { $ref: "#/components/schemas/HelloResponse" } } }
          },
          "429": { description: "Rate limit exceeded" }
        }
      }
    },
    "/v1/items": {
      get: {
        summary: "Authenticated item list",
        security: [{ apiKey: [] }],
        responses: {
          "200": {
            description: "Items",
            content: { "application/json": { schema: { $ref: "#/components/schemas/ItemsResponse" } } }
          },
          "401": { description: "Missing or invalid API key" },
          "429": { description: "Rate limit exceeded" }
        }
      }
    },
    "/v1/echo": {
      post: {
        summary: "Authenticated echo endpoint",
        security: [{ apiKey: [] }],
        requestBody: {
          required: true,
          content: { "application/json": { schema: { type: "object", additionalProperties: true } } }
        },
        responses: {
          "200": { description: "Echoed payload" },
          "401": { description: "Missing or invalid API key" }
        }
      }
    }
  },
  components: {
    securitySchemes: {
      apiKey: { type: "apiKey", in: "header", name: "apikey" }
    },
    schemas: {
      HelloResponse: {
        type: "object",
        properties: {
          message: { type: "string" },
          service: { type: "string" },
          timestamp: { type: "string", format: "date-time" }
        }
      },
      ItemsResponse: {
        type: "object",
        properties: {
          items: { type: "array", items: { type: "object" } }
        }
      }
    }
  }
};

app.get("/healthz", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/v1/hello", (_req, res) => {
  res.json({
    message: "hello from the SpainIP mock API",
    service: "api-gw-test",
    timestamp: new Date().toISOString()
  });
});

app.get("/v1/items", (_req, res) => {
  res.json({
    items: [
      { id: 1, name: "alpha" },
      { id: 2, name: "bravo" },
      { id: 3, name: "charlie" }
    ]
  });
});

app.post("/v1/echo", (req, res) => {
  res.json({ received: req.body ?? null });
});

app.get("/openapi.json", (_req, res) => {
  res.json(openapi);
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi, {
  customSiteTitle: "SpainIP mock API"
}));

app.listen(port, "0.0.0.0", () => {
  console.log(`api-gw-test listening on :${port}`);
});
