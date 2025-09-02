import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

export async function DELETE(
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
    const listingId = params.id;

    // Vérifier que l'annonce appartient à l'utilisateur ou que c'est un admin
    const { data: listing, error: fetchError } = await supabaseAdmin
      .from('listings')
      .select('user_id')
      .eq('id', listingId)
      .single();

    if (fetchError || !listing) {
      return NextResponse.json(
        { error: 'Annonce non trouvée' },
        { status: 404 }
      );
    }

    // Vérifier si l'utilisateur est admin
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .select('role')
      .eq('id', decoded.userId)
      .single();

    // Autoriser la suppression si c'est le propriétaire ou un admin
    if (listing.user_id !== decoded.userId && (!user || user.role !== 'admin')) {
      return NextResponse.json(
        { error: 'Non autorisé à supprimer cette annonce' },
        { status: 403 }
      );
    }

    // Supprimer l'annonce
    const { error: deleteError } = await supabaseAdmin
      .from('listings')
      .delete()
      .eq('id', listingId);

    if (deleteError) {
      console.error('Erreur suppression annonce:', deleteError);
      return NextResponse.json(
        { error: 'Erreur lors de la suppression de l\'annonce' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: 'Annonce supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur API delete listing:', error);
    
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

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const listingId = params.id;

    // Récupérer l'annonce avec les informations du propriétaire
    const { data: listing, error } = await supabaseAdmin
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
      .eq('id', listingId)
      .eq('status', 'active')
      .single();

    if (error || !listing) {
      return NextResponse.json(
        { error: 'Annonce non trouvée' },
        { status: 404 }
      );
    }

    // Incrémenter le nombre de vues
    await supabaseAdmin
      .from('listings')
      .update({ views: listing.views + 1 })
      .eq('id', listingId);

    // Transformer les données pour le frontend
    const transformedListing = {
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
      views: listing.views + 1,
      createdAt: listing.created_at,
      amenities: listing.amenities || [],
      surface: listing.surface,
      furnished: listing.furnished,
      deposit: listing.caution || 0,
      chargesIncluded: listing.charges_included,
      availability: listing.availability
    };

    return NextResponse.json({
      listing: transformedListing
    });

  } catch (error) {
    console.error('Erreur API get listing:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}