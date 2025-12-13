import { handlers } from "@/lib/auth"

// Removido edge runtime para melhor compatibilidade com middleware
// export const runtime = 'edge'

export const { GET, POST } = handlers
