"use client";

import { useState, useEffect } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Users,
	Building,
	TrendingUp,
	TrendingDown,
	Calendar,
	CheckCircle,
	Clock,
	X,
	Shield,
	Home,
	ArrowLeft,
	Loader2,
	BarChart3,
	PieChart,
	Activity,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface Statistics {
	globalStats: {
		totalUsers: number;
		totalListings: number;
		activeListings: number;
		pendingListings: number;
		inactiveListings: number;
		students: number;
		landlords: number;
		verifiedUsers: number;
	};
	dailyStats: {
		usersToday: number;
		usersYesterday: number;
		usersThisWeek: number;
		usersThisMonth: number;
		listingsToday: number;
		listingsYesterday: number;
		listingsThisWeek: number;
		listingsThisMonth: number;
		userGrowthToday: number;
		listingGrowthToday: number;
	};
	chartData: Array<{
		date: string;
		users: number;
		listings: number;
	}>;
}

export default function AdminStatisticsPage() {
	const router = useRouter();
	const { user, loading } = useAuth();
	const [statistics, setStatistics] = useState<Statistics | null>(null);
	const [loadingStats, setLoadingStats] = useState(true);
	const [error, setError] = useState("");

	// Vérifier si l'utilisateur est admin
	useEffect(() => {
		if (!loading && (!user || user.role !== "admin")) {
			router.push("/");
		}
	}, [user, loading, router]);

	// Charger les statistiques
	useEffect(() => {
		if (user && user.role === "admin") {
			fetchStatistics();
		}
	}, [user]);

	const fetchStatistics = async () => {
		try {
			setLoadingStats(true);
			setError("");

			const response = await fetch("/api/admin/statistics");

			if (!response.ok) {
				throw new Error("Erreur lors du chargement des statistiques");
			}

			const data = await response.json();
			setStatistics(data);
		} catch (err) {
			setError("Erreur lors du chargement des statistiques");
			console.error("Erreur:", err);
		} finally {
			setLoadingStats(false);
		}
	};

	// Afficher un loader pendant la vérification d'authentification
	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 flex items-center justify-center">
				<div className="text-center">
					<Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
					<p className="text-gray-600">Vérification des permissions...</p>
				</div>
			</div>
		);
	}

	// Ne pas afficher la page si pas admin
	if (!user || user.role !== "admin") {
		return null;
	}

	const formatGrowth = (growth: number) => {
		if (growth > 0) {
			return (
				<div className="flex items-center text-green-600">
					<TrendingUp className="w-4 h-4 mr-1" />+{growth.toFixed(1)}%
				</div>
			);
		} else if (growth < 0) {
			return (
				<div className="flex items-center text-red-600">
					<TrendingDown className="w-4 h-4 mr-1" />
					{growth.toFixed(1)}%
				</div>
			);
		} else {
			return (
				<div className="flex items-center text-gray-500">
					<Activity className="w-4 h-4 mr-1" />
					0%
				</div>
			);
		}
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("fr-FR", {
			weekday: "short",
			day: "numeric",
			month: "short",
		});
	};

	const containerVariants = {
		hidden: { opacity: 0 },
		visible: {
			opacity: 1,
			transition: {
				staggerChildren: 0.1,
			},
		},
	};

	const itemVariants = {
		hidden: { y: 20, opacity: 0 },
		visible: {
			y: 0,
			opacity: 1,
			transition: {
				duration: 0.6,
			},
		},
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50">
			{/* Header */}
			<header className="bg-white shadow-sm border-b sticky top-0 z-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<Link href="/admin" className="flex items-center space-x-3">
							<ArrowLeft className="w-5 h-5 text-gray-600" />
							<div className="flex items-center space-x-2">
								<div className="rounded-lg flex items-center justify-center">
									<Image
										src="/uadDeukouway.png"
										alt="Logo"
										width={60}
										height={50}
									/>
								</div>
							</div>
						</Link>
						<div className="flex items-center space-x-3">
							<Badge className="bg-red-100 text-red-800 hover:bg-red-100">
								<Shield className="w-3 h-3 mr-1" />
								Admin
							</Badge>
							<span className="text-sm text-gray-700 hidden sm:block">
								{user.firstName} {user.lastName}
							</span>
						</div>
					</div>
				</div>
			</header>

			<div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
				{loadingStats ? (
					<div className="flex items-center justify-center py-12">
						<div className="text-center">
							<Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
							<p className="text-gray-600">Chargement des statistiques...</p>
						</div>
					</div>
				) : error ? (
					<div className="text-center py-12">
						<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
							<X className="w-8 h-8 text-red-400" />
						</div>
						<h3 className="text-lg font-semibold text-gray-900 mb-2">
							Erreur de chargement
						</h3>
						<p className="text-gray-600 mb-4">{error}</p>
						<Button onClick={fetchStatistics} variant="outline">
							Réessayer
						</Button>
					</div>
				) : statistics ? (
					<motion.div
						variants={containerVariants}
						initial="hidden"
						animate="visible"
						className="space-y-8"
					>
						{/* Title */}
						<motion.div variants={itemVariants} className="text-center">
							<h1 className="text-3xl font-bold text-gray-900 mb-2">
								Tableau de bord statistiques
							</h1>
							<p className="text-gray-600">
								Vue d'ensemble des performances de la plateforme
							</p>
						</motion.div>

						{/* Stats du jour */}
						<motion.div variants={itemVariants}>
							<h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
								<Calendar className="w-5 h-5 mr-2 text-blue-600" />
								Statistiques du jour
							</h2>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
								<Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300">
									<CardContent className="p-6">
										<div className="flex items-center justify-between mb-4">
											<div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
												<Users className="w-6 h-6 text-blue-600" />
											</div>
											{formatGrowth(statistics.dailyStats.userGrowthToday)}
										</div>
										<div className="text-2xl font-bold text-blue-600 mb-1">
											{statistics.dailyStats.usersToday}
										</div>
										<div className="text-sm text-gray-600">
											Nouveaux utilisateurs
										</div>
										<div className="text-xs text-gray-500 mt-1">
											Hier: {statistics.dailyStats.usersYesterday}
										</div>
									</CardContent>
								</Card>

								<Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300">
									<CardContent className="p-6">
										<div className="flex items-center justify-between mb-4">
											<div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
												<Building className="w-6 h-6 text-green-600" />
											</div>
											{formatGrowth(statistics.dailyStats.listingGrowthToday)}
										</div>
										<div className="text-2xl font-bold text-green-600 mb-1">
											{statistics.dailyStats.listingsToday}
										</div>
										<div className="text-sm text-gray-600">
											Nouvelles annonces
										</div>
										<div className="text-xs text-gray-500 mt-1">
											Hier: {statistics.dailyStats.listingsYesterday}
										</div>
									</CardContent>
								</Card>

								<Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300">
									<CardContent className="p-6">
										<div className="flex items-center justify-between mb-4">
											<div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
												<Users className="w-6 h-6 text-purple-600" />
											</div>
										</div>
										<div className="text-2xl font-bold text-purple-600 mb-1">
											{statistics.dailyStats.usersThisWeek}
										</div>
										<div className="text-sm text-gray-600">Cette semaine</div>
										<div className="text-xs text-gray-500 mt-1">
											Utilisateurs
										</div>
									</CardContent>
								</Card>

								<Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300">
									<CardContent className="p-6">
										<div className="flex items-center justify-between mb-4">
											<div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
												<Building className="w-6 h-6 text-orange-600" />
											</div>
										</div>
										<div className="text-2xl font-bold text-orange-600 mb-1">
											{statistics.dailyStats.listingsThisWeek}
										</div>
										<div className="text-sm text-gray-600">Cette semaine</div>
										<div className="text-xs text-gray-500 mt-1">Annonces</div>
									</CardContent>
								</Card>
							</div>
						</motion.div>

						{/* Stats globales */}
						<motion.div variants={itemVariants}>
							<h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
								<PieChart className="w-5 h-5 mr-2 text-blue-600" />
								Statistiques globales
							</h2>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
								<Card className="shadow-lg border-0">
									<CardContent className="p-6 text-center">
										<div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
											<Users className="w-8 h-8 text-blue-600" />
										</div>
										<div className="text-3xl font-bold text-blue-600 mb-2">
											{statistics.globalStats.totalUsers}
										</div>
										<div className="text-gray-600 mb-2">Total utilisateurs</div>
										<div className="space-y-1">
											<div className="flex justify-between text-sm">
												<span className="text-gray-500">Étudiants:</span>
												<span className="font-medium">
													{statistics.globalStats.students}
												</span>
											</div>
											<div className="flex justify-between text-sm">
												<span className="text-gray-500">Propriétaires:</span>
												<span className="font-medium">
													{statistics.globalStats.landlords}
												</span>
											</div>
											<div className="flex justify-between text-sm">
												<span className="text-gray-500">Vérifiés:</span>
												<span className="font-medium text-green-600">
													{statistics.globalStats.verifiedUsers}
												</span>
											</div>
										</div>
									</CardContent>
								</Card>

								<Card className="shadow-lg border-0">
									<CardContent className="p-6 text-center">
										<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
											<Building className="w-8 h-8 text-green-600" />
										</div>
										<div className="text-3xl font-bold text-green-600 mb-2">
											{statistics.globalStats.totalListings}
										</div>
										<div className="text-gray-600 mb-2">Total annonces</div>
										<div className="space-y-1">
											<div className="flex justify-between text-sm">
												<span className="text-gray-500">Actives:</span>
												<span className="font-medium text-green-600">
													{statistics.globalStats.activeListings}
												</span>
											</div>
											<div className="flex justify-between text-sm">
												<span className="text-gray-500">En attente:</span>
												<span className="font-medium text-yellow-600">
													{statistics.globalStats.pendingListings}
												</span>
											</div>
											<div className="flex justify-between text-sm">
												<span className="text-gray-500">Inactives:</span>
												<span className="font-medium text-red-600">
													{statistics.globalStats.inactiveListings}
												</span>
											</div>
										</div>
									</CardContent>
								</Card>

								<Card className="shadow-lg border-0">
									<CardContent className="p-6 text-center">
										<div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
											<Clock className="w-8 h-8 text-yellow-600" />
										</div>
										<div className="text-3xl font-bold text-yellow-600 mb-2">
											{statistics.globalStats.pendingListings}
										</div>
										<div className="text-gray-600 mb-2">En attente</div>
										<div className="text-sm text-gray-500">
											Annonces à valider
										</div>
									</CardContent>
								</Card>

								<Card className="shadow-lg border-0">
									<CardContent className="p-6 text-center">
										<div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
											<CheckCircle className="w-8 h-8 text-purple-600" />
										</div>
										<div className="text-3xl font-bold text-purple-600 mb-2">
											{Math.round(
												(statistics.globalStats.verifiedUsers /
													statistics.globalStats.totalUsers) *
													100
											)}
											%
										</div>
										<div className="text-gray-600 mb-2">Taux vérification</div>
										<div className="text-sm text-gray-500">
											Utilisateurs vérifiés
										</div>
									</CardContent>
								</Card>
							</div>
						</motion.div>

						{/* Graphique des 7 derniers jours */}
						<motion.div variants={itemVariants}>
							<Card className="shadow-lg border-0">
								<CardHeader>
									<CardTitle className="flex items-center">
										<BarChart3 className="w-5 h-5 mr-2 text-blue-600" />
										Évolution des 7 derniers jours
									</CardTitle>
									<CardDescription>
										Nombre d'inscriptions et d'annonces par jour
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="space-y-4">
										{statistics.chartData.map((day, index) => (
											<div
												key={day.date}
												className="flex items-center space-x-4"
											>
												<div className="w-20 text-sm text-gray-600">
													{formatDate(day.date)}
												</div>
												<div className="flex-1 space-y-2">
													<div className="flex items-center space-x-2">
														<div className="w-3 h-3 bg-blue-500 rounded-full"></div>
														<span className="text-sm text-gray-600">
															Utilisateurs:
														</span>
														<span className="font-medium">{day.users}</span>
														<div className="flex-1 bg-gray-200 rounded-full h-2">
															<div
																className="bg-blue-500 h-2 rounded-full transition-all duration-500"
																style={{
																	width: `${Math.max(
																		(day.users /
																			Math.max(
																				...statistics.chartData.map(
																					(d) => d.users
																				)
																			)) *
																			100,
																		5
																	)}%`,
																}}
															></div>
														</div>
													</div>
													<div className="flex items-center space-x-2">
														<div className="w-3 h-3 bg-green-500 rounded-full"></div>
														<span className="text-sm text-gray-600">
															Annonces:
														</span>
														<span className="font-medium">{day.listings}</span>
														<div className="flex-1 bg-gray-200 rounded-full h-2">
															<div
																className="bg-green-500 h-2 rounded-full transition-all duration-500"
																style={{
																	width: `${Math.max(
																		(day.listings /
																			Math.max(
																				...statistics.chartData.map(
																					(d) => d.listings
																				)
																			)) *
																			100,
																		5
																	)}%`,
																}}
															></div>
														</div>
													</div>
												</div>
											</div>
										))}
									</div>
								</CardContent>
							</Card>
						</motion.div>

						{/* Actions rapides */}
						<motion.div variants={itemVariants}>
							<Card className="shadow-lg border-0">
								<CardHeader>
									<CardTitle>Actions rapides</CardTitle>
									<CardDescription>
										Accès rapide aux fonctionnalités d'administration
									</CardDescription>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
										<Link href="/admin">
											<Button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
												<Shield className="w-4 h-4 mr-2" />
												Gestion générale
											</Button>
										</Link>
										<Button
											onClick={fetchStatistics}
											variant="outline"
											className="w-full"
										>
											<Activity className="w-4 h-4 mr-2" />
											Actualiser
										</Button>
										<Link href="/">
											<Button variant="outline" className="w-full">
												<Home className="w-4 h-4 mr-2" />
												Voir le site
											</Button>
										</Link>
									</div>
								</CardContent>
							</Card>
						</motion.div>
					</motion.div>
				) : null}
			</div>
		</div>
	);
}
