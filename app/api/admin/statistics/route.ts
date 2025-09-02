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

    // Obtenir les dates pour les calculs
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    // Statistiques globales des utilisateurs
    const { data: totalUsers, error: totalUsersError } = await supabaseAdmin
      .from('users')
      .select('id', { count: 'exact' })
      .neq('role', 'admin');

    const { data: usersToday, error: usersTodayError } = await supabaseAdmin
      .from('users')
      .select('id', { count: 'exact' })
      .gte('created_at', today.toISOString())
      .neq('role', 'admin');

    const { data: usersYesterday, error: usersYesterdayError } = await supabaseAdmin
      .from('users')
      .select('id', { count: 'exact' })
      .gte('created_at', yesterday.toISOString())
      .lt('created_at', today.toISOString())
      .neq('role', 'admin');

    const { data: usersThisWeek, error: usersThisWeekError } = await supabaseAdmin
      .from('users')
      .select('id', { count: 'exact' })
      .gte('created_at', lastWeek.toISOString())
      .neq('role', 'admin');

    const { data: usersThisMonth, error: usersThisMonthError } = await supabaseAdmin
      .from('users')
      .select('id', { count: 'exact' })
      .gte('created_at', lastMonth.toISOString())
      .neq('role', 'admin');

    // Statistiques des annonces
    const { data: totalListings, error: totalListingsError } = await supabaseAdmin
      .from('listings')
      .select('id', { count: 'exact' });

    const { data: listingsToday, error: listingsTodayError } = await supabaseAdmin
      .from('listings')
      .select('id', { count: 'exact' })
      .gte('created_at', today.toISOString());

    const { data: listingsYesterday, error: listingsYesterdayError } = await supabaseAdmin
      .from('listings')
      .select('id', { count: 'exact' })
      .gte('created_at', yesterday.toISOString())
      .lt('created_at', today.toISOString());

    const { data: listingsThisWeek, error: listingsThisWeekError } = await supabaseAdmin
      .from('listings')
      .select('id', { count: 'exact' })
      .gte('created_at', lastWeek.toISOString());

    const { data: listingsThisMonth, error: listingsThisMonthError } = await supabaseAdmin
      .from('listings')
      .select('id', { count: 'exact' })
      .gte('created_at', lastMonth.toISOString());

    // Annonces par statut
    const { data: activeListings, error: activeListingsError } = await supabaseAdmin
      .from('listings')
      .select('id', { count: 'exact' })
      .eq('status', 'active')
      .eq('admin_validated', true);

    const { data: pendingListings, error: pendingListingsError } = await supabaseAdmin
      .from('listings')
      .select('id', { count: 'exact' })
      .eq('admin_validated', false);

    const { data: inactiveListings, error: inactiveListingsError } = await supabaseAdmin
      .from('listings')
      .select('id', { count: 'exact' })
      .eq('status', 'inactive');

    // Utilisateurs par rôle
    const { data: students, error: studentsError } = await supabaseAdmin
      .from('users')
      .select('id', { count: 'exact' })
      .eq('role', 'student');

    const { data: landlords, error: landlordsError } = await supabaseAdmin
      .from('users')
      .select('id', { count: 'exact' })
      .eq('role', 'landlord');

    const { data: verifiedUsers, error: verifiedUsersError } = await supabaseAdmin
      .from('users')
      .select('id', { count: 'exact' })
      .eq('verified', true)
      .neq('role', 'admin');

    // Statistiques par jour pour les 7 derniers jours
    const dailyStats = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const { data: dailyUsers } = await supabaseAdmin
        .from('users')
        .select('id', { count: 'exact' })
        .gte('created_at', date.toISOString())
        .lt('created_at', nextDate.toISOString())
        .neq('role', 'admin');

      const { data: dailyListings } = await supabaseAdmin
        .from('listings')
        .select('id', { count: 'exact' })
        .gte('created_at', date.toISOString())
        .lt('created_at', nextDate.toISOString());

      dailyStats.push({
        date: date.toISOString().split('T')[0],
        users: dailyUsers?.length || 0,
        listings: dailyListings?.length || 0
      });
    }

    // Vérifier les erreurs
    if (totalUsersError || usersTodayError || usersYesterdayError || 
        totalListingsError || listingsTodayError || listingsYesterdayError) {
      console.error('Erreur récupération statistiques:', {
        totalUsersError, usersTodayError, usersYesterdayError,
        totalListingsError, listingsTodayError, listingsYesterdayError
      });
      return NextResponse.json(
        { error: 'Erreur lors de la récupération des statistiques' },
        { status: 500 }
      );
    }

    // Calculer les pourcentages de croissance
    const userGrowthToday = usersYesterday?.length ? 
      ((usersToday?.length || 0) - (usersYesterday?.length || 0)) / (usersYesterday?.length || 1) * 100 : 0;

    const listingGrowthToday = listingsYesterday?.length ? 
      ((listingsToday?.length || 0) - (listingsYesterday?.length || 0)) / (listingsYesterday?.length || 1) * 100 : 0;

    return NextResponse.json({
      globalStats: {
        totalUsers: totalUsers?.length || 0,
        totalListings: totalListings?.length || 0,
        activeListings: activeListings?.length || 0,
        pendingListings: pendingListings?.length || 0,
        inactiveListings: inactiveListings?.length || 0,
        students: students?.length || 0,
        landlords: landlords?.length || 0,
        verifiedUsers: verifiedUsers?.length || 0
      },
      dailyStats: {
        usersToday: usersToday?.length || 0,
        usersYesterday: usersYesterday?.length || 0,
        usersThisWeek: usersThisWeek?.length || 0,
        usersThisMonth: usersThisMonth?.length || 0,
        listingsToday: listingsToday?.length || 0,
        listingsYesterday: listingsYesterday?.length || 0,
        listingsThisWeek: listingsThisWeek?.length || 0,
        listingsThisMonth: listingsThisMonth?.length || 0,
        userGrowthToday: Math.round(userGrowthToday * 100) / 100,
        listingGrowthToday: Math.round(listingGrowthToday * 100) / 100
      },
      chartData: dailyStats
    });

  } catch (error) {
    console.error('Erreur API admin statistics:', error);
    
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