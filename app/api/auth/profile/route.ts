import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '@/lib/supabase';

export async function PUT(request: NextRequest) {
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
    const { firstName, lastName, phone, bio } = await request.json();

    // Validation des données
    if (!firstName || !lastName || !phone) {
      return NextResponse.json(
        { error: 'Prénom, nom et téléphone sont requis' },
        { status: 400 }
      );
    }

    // Mettre à jour le profil
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .update({
        first_name: firstName,
        last_name: lastName,
        phone,
        bio: bio || ''
      })
      .eq('id', decoded.userId)
      .select('id, email, first_name, last_name, phone, role, bio, avatar_url, verified, created_at, updated_at')
      .single();

    if (error) {
      console.error('Erreur mise à jour profil:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la mise à jour du profil' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Profil mis à jour avec succès',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        phone: user.phone,
        role: user.role,
        bio: user.bio,
        avatarUrl: user.avatar_url,
        verified: user.verified,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      }
    });

  } catch (error) {
    console.error('Erreur API profile:', error);
    
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