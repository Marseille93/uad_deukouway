import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
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

    // Récupérer les annonces de l'utilisateur
    const { data: listings, error } = await supabaseAdmin
      .from('listings')
      .select('*, admin_validated')
      .eq('user_id', decoded.userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur récupération annonces utilisateur:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des annonces' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      listings: listings || []
    });

  } catch (error) {
    console.error('Erreur API listings user:', error);
    
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