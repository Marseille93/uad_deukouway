import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(request: NextRequest) {
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
    
    const {
      title,
      type,
      mode,
      price,
      priceType,
      location,
      description,
      availableSpots,
      contact,
      cautionAmount,
      images
    } = await request.json();

    // Validation des données
    if (!title || !type || !mode || !price || !location || !description || !contact) {
      return NextResponse.json(
        { error: 'Tous les champs obligatoires doivent être remplis' },
        { status: 400 }
      );
    }

    // Créer l'annonce
    const { data: listing, error } = await supabaseAdmin
      .from('listings')
      .insert({
        title,
        description,
        type,
        mode,
        price: parseInt(price),
        price_type: priceType === 'par personne' ? 'per_person' : 'total',
        location,
        available_spots: mode === 'colocation' ? parseInt(availableSpots) : null,
        total_spots: mode === 'colocation' ? parseInt(availableSpots) : null,
        contact_phone: contact,
        caution: cautionAmount || 0,
        images: images || [],
        user_id: decoded.userId,
        admin_validated: false,
        status: 'active'
      })
      .select()
      .single();

    if (error) {
      console.error('Erreur création annonce:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la création de l\'annonce' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Annonce soumise avec succès! Elle sera visible après validation par l\'administrateur.',
      listing
    });

  } catch (error) {
    console.error('Erreur API listings POST:', error);
    
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Paramètres de recherche et filtres
    const search = searchParams.get('search') || '';
    const type = searchParams.get('type') || '';
    const mode = searchParams.get('mode') || '';
    const maxPrice = searchParams.get('maxPrice') || '';
    const caution = searchParams.get('caution') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // Construction de la requête
    let query = supabaseAdmin
      .from('listings')
      .select(`
        *,
        users!listings_user_id_fkey (
          first_name,
          last_name,
          role,
          verified,
          created_at
        )
      `)
      .eq('status', 'active')
      .eq('admin_validated', true)
      .order('created_at', { ascending: false });

    // Filtres de recherche
    if (search) {
      query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%,location.ilike.%${search}%`);
    }

    if (type && type !== 'all') {
      query = query.eq('type', type);
    }

    if (mode && mode !== 'all') {
      query = query.eq('mode', mode);
    }

    if (maxPrice) {
      query = query.lte('price', parseInt(maxPrice));
    }

    if (caution && caution !== 'all') {
      if (caution === 'no_caution') {
        query = query.eq('caution', 0);
      } else if (caution === 'with_caution') {
        query = query.gt('caution', 0);
      }
    }
    // Pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: listings, error, count } = await query;

    if (error) {
      console.error('Erreur récupération annonces:', error);
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des annonces' },
        { status: 500 }
      );
    }

    // Transformer les données pour le frontend
    const transformedListings = listings?.map(listing => ({
      id: listing.id,
      title: listing.title,
      type: listing.type === 'room' ? 'Chambre' : 
            listing.type === 'apartment' ? 'Appartement' : 'Maison',
      mode: listing.mode === 'colocation' ? 'Colocation' : 'Location classique',
      price: listing.price,
      priceType: listing.price_type === 'per_person' ? 'par personne' : 'total',
      location: listing.location,
      description: listing.description,
      images: listing.images || [],
      availableSpots: listing.available_spots,
      totalSpots: listing.total_spots,
      contact: listing.contact_phone,
      publisher: {
        name: `${listing.users.first_name} ${listing.users.last_name}`,
        role: listing.users.role === 'student' ? 'Étudiant' : 'Propriétaire',
        verified: listing.users.verified,
        memberSince: listing.users.created_at
      },
      views: listing.views,
      createdAt: listing.created_at,
      amenities: listing.amenities || [],
      surface: listing.surface,
      furnished: listing.furnished,
      deposit: listing.deposit,
      chargesIncluded: listing.charges_included,
      availability: listing.availability
    })) || [];

    return NextResponse.json({
      listings: transformedListings,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.error('Erreur API listings:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}