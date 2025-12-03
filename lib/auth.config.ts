import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import type { NextAuthConfig } from "next-auth"

// Configuração do NextAuth v5 com sessão de 7 dias
const config: NextAuthConfig = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('[Auth] Credenciais não fornecidas')
          return null
        }

        try {
          const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001'
          console.log('[Auth] Tentando autenticar com backend:', backendUrl)

          const response = await fetch(`${backendUrl}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          })

          console.log('[Auth] Resposta do backend:', response.status)

          if (!response.ok) {
            const errorText = await response.text()
            console.error('[Auth] Erro na resposta:', errorText)
            return null
          }

          const data = await response.json()
          console.log('[Auth] Login bem-sucedido para:', data.user?.email)

          // Retornar dados do usuário
          return {
            id: data.user.id,
            email: data.user.email,
            name: data.user.name,
            role: data.user.role || 'user',
            image: data.user.image || null,
            accessToken: data.access_token,
          }
        } catch (error) {
          console.error('[Auth] Erro na autenticação:', error)
          return null
        }
      }
    })
  ],
  
  // Configuração da sessão - 7 dias
  session: {
    strategy: "jwt",
    maxAge: 7 * 24 * 60 * 60, // 7 dias em segundos
    updateAge: 24 * 60 * 60, // Atualizar a cada 24 horas
  },

  // Configuração do JWT - 7 dias
  jwt: {
    maxAge: 7 * 24 * 60 * 60, // 7 dias em segundos
  },

  // Callbacks
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // Quando o usuário faz login, adicionar dados ao token
      if (user) {
        token.id = user.id
        token.email = user.email
        token.name = user.name
        token.role = user.role || 'user'
        token.image = user.image
        token.accessToken = user.accessToken
      }

      // Permitir atualização do token via update()
      if (trigger === "update" && session) {
        token.name = session.name || token.name
        token.email = session.email || token.email
        token.image = session.image || token.image
      }

      return token
    },

    async session({ session, token }) {
      // Adicionar dados do token à sessão
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.role = token.role as string
        session.user.image = token.image as string | null
        // @ts-ignore - Token de acesso para API calls
        session.accessToken = token.accessToken
      }
      return session
    },

    async signIn({ user }) {
      // Permitir login se o usuário existe
      if (user) {
        console.log('[Auth] SignIn callback - usuário:', user.email)
        return true
      }
      return false
    },

    async redirect({ url, baseUrl }) {
      // Permitir redirecionamentos para URLs do mesmo domínio
      if (url.startsWith("/")) return `${baseUrl}${url}`
      if (new URL(url).origin === baseUrl) return url
      return baseUrl
    }
  },

  // Páginas customizadas - não definir para usar modal
  pages: {},

  // Habilitar debug em desenvolvimento
  debug: process.env.NODE_ENV === 'development',

  // Trusted hosts
  trustHost: true,

  // Secret obrigatório
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret-key-for-local-testing-only',
}

export const { handlers, auth, signIn, signOut } = NextAuth(config)
