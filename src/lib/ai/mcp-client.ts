import "server-only";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { tool, jsonSchema, type Tool } from "ai";
import { createClassroomMcpServer } from "../../../mcp/classroom/server";

type JsonSchemaInput = Parameters<typeof jsonSchema>[0];

function extractText(content: Array<{ type: string; text?: string }>): string {
  return content
    .filter((part) => part.type === "text")
    .map((part) => part.text ?? "")
    .join("\n");
}

export async function getClassroomTools(): Promise<Record<string, Tool>> {
  const server = createClassroomMcpServer();
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();

  const client = new Client({
    name: "nexus-classroom-client",
    version: "1.0.0",
  });

  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);

  const { tools: mcpTools } = await client.listTools();

  const tools: Record<string, Tool> = {};

  for (const mcpTool of mcpTools) {
    tools[mcpTool.name] = tool({
      description: mcpTool.description,
      inputSchema: jsonSchema(mcpTool.inputSchema as JsonSchemaInput),
      execute: async (args) => {
        const result = await client.callTool({
          name: mcpTool.name,
          arguments: (args ?? {}) as Record<string, unknown>,
        });

        const text = extractText(result.content as Array<{ type: string; text?: string }>);

        if (result.isError) {
          throw new Error(text || "Classroom tool call failed.");
        }

        try {
          return JSON.parse(text);
        } catch {
          return text;
        }
      },
    });
  }

  return tools;
}
