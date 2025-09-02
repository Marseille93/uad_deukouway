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

    // Récupérer toutes les annonces avec les informations des utilisateurs
    const { data: listings, error } = await supabaseAdmin
      .from('listings')
      .select(`
        *,
        users!listings_user_id_fkey (
          first_name,
          last_name,
          email,
          phone,
          role
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur récupération annonces admin:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des annonces' },
        { status: 500 }
      );
    }

    // Transformer les données pour le frontend
    const transformedListings = listings?.map(listing => ({
      id: listing.id,
      title: listing.title,
      type: listing.type,
      mode: listing.mode,
      price: listing.price,
      location: listing.location,
      description: listing.description,
      contact_phone: listing.contact_phone,
      caution: listing.caution || 0,
      admin_validated: listing.admin_validated,
      status: listing.status,
      created_at: listing.created_at,
      views: listing.views,
      user: {
        first_name: listing.users.first_name,
        last_name: listing.users.last_name,
        email: listing.users.email,
        phone: listing.users.phone,
        role: listing.users.role
      }
    })) || [];

    return NextResponse.json({
      listings: transformedListings
    });

  } catch (error) {
    console.error('Erreur API admin listings:', error);
    
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