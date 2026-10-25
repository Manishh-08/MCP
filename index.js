import { McpServer } from '@modelcontextprotocol/server';
import { StdioServerTransport } from '@modelcontextprotocol/server/stdio';
import * as z from 'zod/v4';

import { createMcpExpressApp } from '@modelcontextprotocol/express';
import { NodeStreamableHTTPServerTransport } from '@modelcontextprotocol/node';

const server = new McpServer({ name: 'MCP-server', version: '1.0.0' });

server.registerTool('add',
  {
    title: "add", description: "Adds two number",
    inputSchema: z.object({ num1: z.number(), num2: z.number() })
  },
  async (ctx) => {
    return {
      content: [{ type: 'text', text: `${ctx.num1 + ctx.num2}` }],
    }
  }
)

async function runServerOnSTDIOTrasnport() {
  const transport = new StdioServerTransport();
  server.connect(transport);
}

async function runServerOnHTTPTransport() {
  const app = new createMcpExpressApp();
  app.use('/mcp', async (req, res) => { 
    const transport = new NodeStreamableHTTPServerTransport({ sessionIdGenerator: undefined });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  })

  app.listen(3000, () => {
    console.log("MCP express server is running on port 3000")
  })
}

// runServerOnSTDIOTrasnport();

runServerOnHTTPTransport();