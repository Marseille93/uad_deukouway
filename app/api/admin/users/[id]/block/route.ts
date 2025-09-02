import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { error: 'Authentification requise' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string };
    const { action } = await request.json();

    // Vérifier que l'utilisateur est admin
    const { data: admin, error: adminError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', decoded.userId)
      .single();

    if (adminError || !admin || admin.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const userId = params.id;

    // Vérifier que l'utilisateur à bloquer/débloquer n'est pas un admin
    const { data: targetUser, error: targetError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', userId)
      .single();

    if (targetError || !targetUser) {
      return NextResponse.json(
        { error: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    if (targetUser.role === 'admin') {
      return NextResponse.json(
        { error: 'Impossible de bloquer un administrateur' },
        { status: 403 }
      );
    }

    // Mettre à jour le statut de blocage
    const blocked = action === 'block';
    
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update({ 
        blocked,
        blocked_at: blocked ? new Date().toISOString() : null,
        blocked_by: blocked ? decoded.userId : null
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Erreur blocage utilisateur:', error);
      return NextResponse.json(
        { error: 'Erreur lors du blocage de l\'utilisateur' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: action === 'block' ? 'Utilisateur bloqué avec succès' : 'Utilisateur débloqué avec succès',
      user
    });

  } catch (error) {
    console.error('Erreur API block user:', error);
    
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json(
        { error: 'Token invalide' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}