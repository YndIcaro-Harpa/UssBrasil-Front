import { NextRequest, NextResponse } from 'next/server'
import twoFactorAuth from '@/lib/two-factor-auth'

export const runtime = 'edge'

// Helper to get user from token
function getUserFromToken(request: NextRequest): { userId: string; email: string } | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) return null
  
  const token = authHeader.substring(7)
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return {
      userId: payload.userId || payload.sub || payload.id,
      email: payload.email || ''
    }
  } catch {
    return null
  }
}

// GET - Check 2FA status
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromToken(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const enabled = twoFactorAuth.isEnabled(user.userId)
    const backupCodesRemaining = enabled ? twoFactorAuth.getBackupCodesCount(user.userId) : 0
    
    return NextResponse.json({
      success: true,
      twoFactorEnabled: enabled,
      backupCodesRemaining
    })
  } catch (error) {
    console.error('Error checking 2FA status:', error)
    return NextResponse.json(
      { error: 'Failed to check 2FA status' },
      { status: 500 }
    )
  }
}

// POST - Enable/Setup 2FA
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromToken(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const body = await request.json()
    const { action, code } = body
    
    switch (action) {
      case 'setup': {
        // Generate new 2FA setup
        if (twoFactorAuth.isEnabled(user.userId)) {
          return NextResponse.json(
            { error: '2FA já está ativado' },
            { status: 400 }
          )
        }
        
        const setup = twoFactorAuth.enable(user.userId)
        
        // Generate QR code URL for authenticator apps
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(setup.provisioningURI)}`
        
        return NextResponse.json({
          success: true,
          secret: setup.secret,
          provisioningURI: setup.provisioningURI,
          qrCodeUrl,
          backupCodes: setup.backupCodes,
          message: 'Escaneie o QR code e digite o código para confirmar'
        })
      }
      
      case 'confirm': {
        // Confirm 2FA setup with first code
        if (!code) {
          return NextResponse.json(
            { error: 'Código é obrigatório' },
            { status: 400 }
          )
        }
        
        const confirmed = twoFactorAuth.confirm(user.userId, code)
        
        if (!confirmed) {
          return NextResponse.json(
            { error: 'Código inválido. Tente novamente.' },
            { status: 400 }
          )
        }
        
        return NextResponse.json({
          success: true,
          message: 'Autenticação de dois fatores ativada com sucesso!'
        })
      }
      
      case 'verify': {
        // Verify 2FA code (for login flow)
        if (!code) {
          return NextResponse.json(
            { error: 'Código é obrigatório' },
            { status: 400 }
          )
        }
        
        const result = await twoFactorAuth.verify(user.userId, code)
        
        if (!result.valid) {
          return NextResponse.json(
            { error: 'Código inválido ou expirado' },
            { status: 400 }
          )
        }
        
        return NextResponse.json({
          success: true,
          method: result.method,
          message: result.method === 'backup' 
            ? 'Verificado com código de backup' 
            : 'Código verificado com sucesso'
        })
      }
      
      case 'regenerate-backup': {
        // Regenerate backup codes
        if (!code) {
          return NextResponse.json(
            { error: 'Código atual é obrigatório' },
            { status: 400 }
          )
        }
        
        const newCodes = await twoFactorAuth.regenerateBackupCodes(user.userId, code)
        
        if (!newCodes) {
          return NextResponse.json(
            { error: 'Código inválido ou 2FA não está ativado' },
            { status: 400 }
          )
        }
        
        return NextResponse.json({
          success: true,
          backupCodes: newCodes,
          message: 'Novos códigos de backup gerados'
        })
      }
      
      case 'send-email-code': {
        // Send verification code via email
        const emailCode = twoFactorAuth.generateEmailCode(user.userId)
        
        // In production, send this via email service
        console.log(`[2FA] Email code for ${user.email}: ${emailCode}`)
        
        return NextResponse.json({
          success: true,
          message: 'Código enviado para seu email'
          // In dev mode, include code for testing
          // ...(process.env.NODE_ENV !== 'production' && { code: emailCode })
        })
      }
      
      case 'verify-email-code': {
        if (!code) {
          return NextResponse.json(
            { error: 'Código é obrigatório' },
            { status: 400 }
          )
        }
        
        const isValid = twoFactorAuth.verifyEmailCode(user.userId, code)
        
        if (!isValid) {
          return NextResponse.json(
            { error: 'Código incorreto, expirado ou muitas tentativas' },
            { status: 400 }
          )
        }
        
        return NextResponse.json({
          success: true,
          message: 'Código verificado com sucesso'
        })
      }
      
      default:
        return NextResponse.json(
          { error: 'Ação inválida' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in 2FA operation:', error)
    return NextResponse.json(
      { error: 'Erro na operação de 2FA' },
      { status: 500 }
    )
  }
}

// DELETE - Disable 2FA
export async function DELETE(request: NextRequest) {
  try {
    const user = getUserFromToken(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    
    if (!code) {
      return NextResponse.json(
        { error: 'Código é obrigatório para desativar 2FA' },
        { status: 400 }
      )
    }
    
    // Verificar código antes de desativar
    const verifyResult = await twoFactorAuth.verify(user.userId, code)
    if (!verifyResult.valid) {
      return NextResponse.json(
        { error: 'Código inválido' },
        { status: 400 }
      )
    }
    
    const disabled = twoFactorAuth.disable(user.userId)
    
    if (!disabled) {
      return NextResponse.json(
        { error: 'Código inválido ou 2FA não está ativado' },
        { status: 400 }
      )
    }
    
    return NextResponse.json({
      success: true,
      message: 'Autenticação de dois fatores desativada'
    })
  } catch (error) {
    console.error('Error disabling 2FA:', error)
    return NextResponse.json(
      { error: 'Erro ao desativar 2FA' },
      { status: 500 }
    )
  }
}
