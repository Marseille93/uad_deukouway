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
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', decoded.userId)
      .single();

    if (userError || !user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Accès non autorisé' },
        { status: 403 }
      );
    }

    const listingId = params.id;

    // Mettre à jour l'annonce selon l'action
    let updateData: any = {
      validated_by: decoded.userId,
      validation_date: new Date().toISOString()
    };

    if (action === 'approve') {
      updateData.admin_validated = true;
      updateData.status = 'active';
    } else if (action === 'reject') {
      updateData.admin_validated = false;
      updateData.status = 'inactive';
    } else {
      return NextResponse.json(
        { error: 'Action invalide' },
        { status: 400 }
      );
    }

    const { data: listing, error } = await supabaseAdmin
      .from('listings')
      .update(updateData)
      .eq('id', listingId)
      .select()
      .single();

    if (error) {
      console.error('Erreur validation annonce:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la validation de l\'annonce' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: action === 'approve' ? 'Annonce approuvée avec succès' : 'Annonce rejetée',
      listing
    });

  } catch (error) {
    console.error('Erreur API validation:', error);
    
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