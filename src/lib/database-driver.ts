import pg from 'pg'
import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless'
import WebSocket, { type ClientOptions } from 'ws'
import { HttpsProxyAgent } from 'https-proxy-agent'
import type { postgresAdapter } from '@payloadcms/db-postgres'
type PayloadPg = NonNullable<Parameters<typeof postgresAdapter>[0]['pg']>

// The normal Vercel runtime uses node-postgres and the pooled Neon endpoint.
// Restricted development workspaces may opt into Neon's pg-compatible WebSocket
// driver over HTTPS, preserving real Postgres transactions and persistence.
export function databaseDriver(): PayloadPg | undefined {
  if (process.env.NEXA_NEON_WEBSOCKET !== 'true') return undefined
  const proxy = process.env.HTTPS_PROXY ?? process.env.HTTP_PROXY
  if (proxy) {
    const agent = new HttpsProxyAgent(proxy)
    neonConfig.webSocketConstructor = class extends WebSocket {
      constructor(address: string, protocols?: string | string[], options?: ClientOptions) {
        super(address, protocols, { ...options, agent })
      }
    }
  } else neonConfig.webSocketConstructor = WebSocket
  // Neon's Pool implements the node-postgres runtime contract. Their TypeScript
  // event overloads differ, so the documented adapter pg override needs a cast.
  return { ...pg, Pool: NeonPool } as unknown as PayloadPg
}
