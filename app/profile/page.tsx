"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
	Home,
	User,
	Mail,
	Phone,
	Calendar,
	CheckCircle,
	Edit3,
	Save,
	X,
	ArrowLeft,
	Building,
	MapPin,
	Eye,
	Loader2,
	Users,
	Shield,
	LogOut,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

interface UserListing {
	id: string;
	title: string;
	type: string;
	mode: string;
	price: number;
	location: string;
	status: string;
	admin_validated: boolean;
	views: number;
	created_at: string;
}

export default function ProfilePage() {
	const router = useRouter();
	const { user, loading, logout } = useAuth();
	const [isEditing, setIsEditing] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [updateError, setUpdateError] = useState("");
	const [updateSuccess, setUpdateSuccess] = useState(false);
	const [userListings, setUserListings] = useState<UserListing[]>([]);
	const [loadingListings, setLoadingListings] = useState(true);

	const [formData, setFormData] = useState({
		firstName: "",
		lastName: "",
		phone: "",
		bio: "",
	});

	// Rediriger vers la page d'authentification si pas connecté
	useEffect(() => {
		if (!loading && !user) {
			router.push("/auth");
		}
	}, [user, loading, router]);

	// Initialiser les données du formulaire
	useEffect(() => {
		if (user) {
			setFormData({
				firstName: user.firstName || "",
				lastName: user.lastName || "",
				phone: user.phone || "",
				bio: user.bio || "",
			});
			fetchUserListings();
		}
	}, [user]);

	const fetchUserListings = async () => {
		try {
			setLoadingListings(true);
			const response = await fetch("/api/listings/user");

			if (response.ok) {
				const data = await response.json();
				setUserListings(data.listings || []);
			} else {
				console.error("Erreur lors du chargement des annonces");
			}
		} catch (error) {
			console.error("Erreur:", error);
		} finally {
			setLoadingListings(false);
		}
	};

	const handleUpdateProfile = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setUpdateError("");
		setUpdateSuccess(false);

		try {
			const response = await fetch("/api/auth/profile", {
				method: "PUT",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			if (response.ok) {
				setUpdateSuccess(true);
				setIsEditing(false);
				setTimeout(() => setUpdateSuccess(false), 3000);
			} else {
				const data = await response.json();
				setUpdateError(data.error || "Erreur lors de la mise à jour");
			}
		} catch (error) {
			setUpdateError("Erreur de connexion");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleLogout = async () => {
		await logout();
		router.push("/");
	};
	const handleDeleteListing = async (listingId: string) => {
		if (!confirm("Êtes-vous sûr de vouloir supprimer cette annonce ?")) {
			return;
		}

		try {
			const response = await fetch(`/api/listings/${listingId}`, {
				method: "DELETE",
			});

			if (response.ok) {
				alert("Annonce supprimée avec succès");
				fetchUserListings();
			} else {
				alert("Erreur lors de la suppression");
			}
		} catch (error) {
			alert("Erreur de connexion");
		}
	};

	const formatListingType = (type: string) => {
		switch (type) {
			case "room":
				return "Chambre";
			case "apartment":
				return "Appartement";
			case "house":
				return "Maison";
			default:
				return type;
		}
	};

	const formatListingMode = (mode: string) => {
		switch (mode) {
			case "colocation":
				return "Colocation";
			case "classic":
				return "Location classique";
			default:
				return mode;
		}
	};

	const getTypeIcon = (type: string) => {
		switch (type) {
			case "room":
				return <Home className="w-4 h-4" />;
			case "apartment":
				return <Building className="w-4 h-4" />;
			case "house":
				return <Building className="w-4 h-4" />;
			default:
				return <Home className="w-4 h-4" />;
		}
	};

	const getStatusBadge = (listing: UserListing) => {
		if (!listing.admin_validated) {
			return (
				<Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
					En attente de validation
				</Badge>
			);
		}
		if (listing.status === "active") {
			return (
				<Badge className="bg-green-100 text-green-800 hover:bg-green-100">
					<CheckCircle className="w-3 h-3 mr-1" />
					Publiée
				</Badge>
			);
		}
		return (
			<Badge className="bg-red-100 text-red-800 hover:bg-red-100">
				Inactive
			</Badge>
		);
	};

	// Afficher un loader pendant la vérification d'authentification
	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 flex items-center justify-center">
				<div className="text-center">
					<Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
					<p className="text-gray-600">Chargement...</p>
				</div>
			</div>
		);
	}

	// Ne pas afficher la page si pas connecté
	if (!user) {
		return null;
	}

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
			<header className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-50">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<Link
							href={user.role === "admin" ? "/admin" : "/dashboard"}
							className="flex items-center space-x-3"
						>
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
							{user.role === "admin" && (
								<Badge className="bg-red-100 text-red-800 hover:bg-red-100">
									<Shield className="w-3 h-3 mr-1" />
									Admin
								</Badge>
							)}
							<span className="text-sm text-gray-700 hidden sm:block">
								{user.firstName} {user.lastName}
							</span>
							<Button
								variant="outline"
								size="sm"
								onClick={handleLogout}
								className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
							>
								<LogOut className="w-4 h-4 sm:mr-2" />
								<span className="hidden sm:inline">Déconnexion</span>
							</Button>
						</div>
					</div>
				</div>
			</header>

			<div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate="visible"
					className="space-y-8"
				>
					{/* Profile Header */}
					<motion.div variants={itemVariants}>
						<Card className="shadow-xl border-0 overflow-hidden">
							<div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 sm:p-8">
								<div className="flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6">
									<motion.div
										whileHover={{ scale: 1.05 }}
										className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
									>
										<User className="w-12 h-12 text-white" />
									</motion.div>
									<div className="text-center sm:text-left text-white flex-1">
										<div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-2">
											<h1 className="text-2xl sm:text-3xl font-bold">
												{user.firstName} {user.lastName}
											</h1>
											{user.verified && (
												<motion.div
													initial={{ scale: 0 }}
													animate={{ scale: 1 }}
													transition={{ delay: 0.3 }}
												>
													<Badge className="bg-green-100 text-green-800 hover:bg-green-100">
														<CheckCircle className="w-3 h-3 mr-1" />
														Vérifié
													</Badge>
												</motion.div>
											)}
										</div>
										<p className="text-blue-100 text-lg mb-2">
											{user.role === "student"
												? "Étudiant"
												: user.role === "landlord"
												? "Propriétaire"
												: "Administrateur"}
										</p>
										<p className="text-blue-200 text-sm">
											Membre depuis{" "}
											{new Date(user.createdAt).toLocaleDateString("fr-FR", {
												year: "numeric",
												month: "long",
												day: "numeric",
											})}
										</p>
									</div>
								</div>
							</div>
						</Card>
					</motion.div>

					{/* Stats Cards */}
					<motion.div variants={itemVariants}>
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
							<Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300">
								<CardContent className="p-6 text-center">
									<div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
										<Building className="w-6 h-6 text-blue-600" />
									</div>
									<div className="text-2xl font-bold text-blue-600 mb-1">
										{userListings.length}
									</div>
									<div className="text-sm text-gray-600">Annonces publiées</div>
								</CardContent>
							</Card>

							<Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300">
								<CardContent className="p-6 text-center">
									<div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
										<CheckCircle className="w-6 h-6 text-green-600" />
									</div>
									<div className="text-2xl font-bold text-green-600 mb-1">
										{
											userListings.filter(
												(l) => l.admin_validated && l.status === "active"
											).length
										}
									</div>
									<div className="text-sm text-gray-600">Annonces actives</div>
								</CardContent>
							</Card>

							<Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300">
								<CardContent className="p-6 text-center">
									<div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
										<Eye className="w-6 h-6 text-purple-600" />
									</div>
									<div className="text-2xl font-bold text-purple-600 mb-1">
										{userListings.reduce(
											(total, listing) => total + listing.views,
											0
										)}
									</div>
									<div className="text-sm text-gray-600">Vues totales</div>
								</CardContent>
							</Card>
						</div>
					</motion.div>

					{/* Main Content */}
					<motion.div variants={itemVariants}>
						<Tabs defaultValue="profile" className="space-y-6">
							<TabsList className="grid w-full grid-cols-2 bg-white shadow-lg border-0">
								<TabsTrigger
									value="profile"
									className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
								>
									<User className="w-4 h-4 mr-2" />
									Mon profil
								</TabsTrigger>
								<TabsTrigger
									value="listings"
									className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white"
								>
									<Building className="w-4 h-4 mr-2" />
									Mes annonces ({userListings.length})
								</TabsTrigger>
							</TabsList>

							<TabsContent value="profile">
								<Card className="shadow-xl border-0">
									<CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
										<div className="flex justify-between items-center">
											<div>
												<CardTitle className="text-xl text-gray-900">
													Informations personnelles
												</CardTitle>
												<CardDescription>
													Gérez vos informations de profil
												</CardDescription>
											</div>
											{!isEditing && (
												<Button
													onClick={() => setIsEditing(true)}
													className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
												>
													<Edit3 className="w-4 h-4 mr-2" />
													Modifier
												</Button>
											)}
										</div>
									</CardHeader>
									<CardContent className="p-6 sm:p-8">
										{updateSuccess && (
											<motion.div
												initial={{ opacity: 0, y: -10 }}
												animate={{ opacity: 1, y: 0 }}
												className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
											>
												<div className="flex items-center">
													<CheckCircle className="w-5 h-5 text-green-600 mr-2" />
													<p className="text-green-700 font-medium">
														Profil mis à jour avec succès!
													</p>
												</div>
											</motion.div>
										)}

										{updateError && (
											<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
												<p className="text-red-600">{updateError}</p>
											</div>
										)}

										{isEditing ? (
											<form
												onSubmit={handleUpdateProfile}
												className="space-y-6"
											>
												<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
													<div className="space-y-2">
														<Label htmlFor="firstName">Prénom</Label>
														<Input
															id="firstName"
															value={formData.firstName}
															onChange={(e) =>
																setFormData({
																	...formData,
																	firstName: e.target.value,
																})
															}
															className="focus:ring-2 focus:ring-blue-500"
															required
														/>
													</div>
													<div className="space-y-2">
														<Label htmlFor="lastName">Nom</Label>
														<Input
															id="lastName"
															value={formData.lastName}
															onChange={(e) =>
																setFormData({
																	...formData,
																	lastName: e.target.value,
																})
															}
															className="focus:ring-2 focus:ring-blue-500"
															required
														/>
													</div>
												</div>

												<div className="space-y-2">
													<Label htmlFor="phone">Numéro de téléphone</Label>
													<div className="relative">
														<Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
														<Input
															id="phone"
															type="tel"
															value={formData.phone}
															onChange={(e) =>
																setFormData({
																	...formData,
																	phone: e.target.value,
																})
															}
															className="pl-10 focus:ring-2 focus:ring-blue-500"
															required
														/>
													</div>
												</div>

												<div className="space-y-2">
													<Label htmlFor="bio">Biographie</Label>
													<Textarea
														id="bio"
														value={formData.bio}
														onChange={(e) =>
															setFormData({ ...formData, bio: e.target.value })
														}
														placeholder="Parlez-nous de vous..."
														rows={4}
														className="focus:ring-2 focus:ring-blue-500"
													/>
												</div>

												<div className="flex justify-end space-x-3 pt-4">
													<Button
														type="button"
														variant="outline"
														onClick={() => {
															setIsEditing(false);
															setUpdateError("");
															// Reset form data
															setFormData({
																firstName: user.firstName || "",
																lastName: user.lastName || "",
																phone: user.phone || "",
																bio: user.bio || "",
															});
														}}
													>
														<X className="w-4 h-4 mr-2" />
														Annuler
													</Button>
													<Button
														type="submit"
														className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
														disabled={isSubmitting}
													>
														{isSubmitting ? (
															<>
																<Loader2 className="w-4 h-4 mr-2 animate-spin" />
																Sauvegarde...
															</>
														) : (
															<>
																<Save className="w-4 h-4 mr-2" />
																Sauvegarder
															</>
														)}
													</Button>
												</div>
											</form>
										) : (
											<div className="space-y-6">
												<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
													<div className="space-y-4">
														<div className="p-4 bg-gray-50 rounded-lg">
															<div className="flex items-center mb-2">
																<User className="w-4 h-4 text-gray-500 mr-2" />
																<span className="text-sm font-medium text-gray-600">
																	Nom complet
																</span>
															</div>
															<p className="text-lg font-semibold text-gray-900">
																{user.firstName} {user.lastName}
															</p>
														</div>

														<div className="p-4 bg-gray-50 rounded-lg">
															<div className="flex items-center mb-2">
																<Mail className="w-4 h-4 text-gray-500 mr-2" />
																<span className="text-sm font-medium text-gray-600">
																	Email
																</span>
															</div>
															<p className="text-lg text-gray-900">
																{user.email}
															</p>
														</div>
													</div>

													<div className="space-y-4">
														<div className="p-4 bg-gray-50 rounded-lg">
															<div className="flex items-center mb-2">
																<Phone className="w-4 h-4 text-gray-500 mr-2" />
																<span className="text-sm font-medium text-gray-600">
																	Téléphone
																</span>
															</div>
															<p className="text-lg text-gray-900">
																{user.phone}
															</p>
														</div>

														<div className="p-4 bg-gray-50 rounded-lg">
															<div className="flex items-center mb-2">
																<Calendar className="w-4 h-4 text-gray-500 mr-2" />
																<span className="text-sm font-medium text-gray-600">
																	Membre depuis
																</span>
															</div>
															<p className="text-lg text-gray-900">
																{new Date(user.createdAt).toLocaleDateString(
																	"fr-FR",
																	{
																		year: "numeric",
																		month: "long",
																		day: "numeric",
																	}
																)}
															</p>
														</div>
													</div>
												</div>

												{user.bio && (
													<div className="p-4 bg-gray-50 rounded-lg">
														<div className="flex items-center mb-2">
															<User className="w-4 h-4 text-gray-500 mr-2" />
															<span className="text-sm font-medium text-gray-600">
																Biographie
															</span>
														</div>
														<p className="text-gray-900 leading-relaxed">
															{user.bio}
														</p>
													</div>
												)}
											</div>
										)}
									</CardContent>
								</Card>
							</TabsContent>

							<TabsContent value="listings">
								<Card className="shadow-xl border-0">
									<CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
										<CardTitle className="text-xl text-gray-900">
											Mes annonces
										</CardTitle>
										<CardDescription>
											Gérez vos annonces de logement
										</CardDescription>
									</CardHeader>
									<CardContent className="p-6">
										{loadingListings ? (
											<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
												{[1, 2, 3, 4].map((i) => (
													<Card key={i} className="border">
														<div className="h-32 bg-gray-200 animate-pulse"></div>
														<CardContent className="p-4">
															<div className="space-y-3">
																<div className="h-4 bg-gray-200 rounded animate-pulse"></div>
																<div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
																<div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
															</div>
														</CardContent>
													</Card>
												))}
											</div>
										) : userListings.length > 0 ? (
											<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
												{userListings.map((listing, index) => (
													<motion.div
														key={listing.id}
														initial={{ opacity: 0, y: 20 }}
														animate={{ opacity: 1, y: 0 }}
														transition={{ duration: 0.5, delay: index * 0.1 }}
														whileHover={{ y: -5 }}
													>
														<Card className="h-full shadow-lg border-0 hover:shadow-xl transition-all duration-300">
															<div className="relative">
																<div className="h-32 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
																	{getTypeIcon(listing.type)}
																	<span className="ml-2 text-gray-700 font-medium">
																		{formatListingType(listing.type)}
																	</span>
																</div>
																<div className="absolute top-3 left-3">
																	{getStatusBadge(listing)}
																</div>
															</div>
															<CardContent className="p-4">
																<h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
																	{listing.title}
																</h3>
																<div className="flex items-center text-sm text-gray-600 mb-3">
																	<MapPin className="w-4 h-4 mr-1" />
																	<span className="truncate">
																		{listing.location}
																	</span>
																</div>
																<div className="flex items-center justify-between mb-3">
																	<Badge
																		variant={
																			listing.mode === "colocation"
																				? "secondary"
																				: "default"
																		}
																	>
																		{listing.mode === "colocation" && (
																			<Users className="w-3 h-3 mr-1" />
																		)}
																		{formatListingMode(listing.mode)}
																	</Badge>
																	<div className="flex items-center text-xs text-gray-500">
																		<Eye className="w-3 h-3 mr-1" />
																		{listing.views}
																	</div>
																</div>
																<div className="flex items-center justify-between text-sm">
																	<span className="font-medium text-blue-600">
																		{listing.price.toLocaleString()} FCFA
																	</span>
																	<span className="text-gray-500">
																		{Math.floor(
																			(Date.now() -
																				new Date(
																					listing.created_at
																				).getTime()) /
																				(1000 * 60 * 60 * 24)
																		)}
																		j
																	</span>
																</div>
																<div className="mt-4 flex justify-between">
																	<Link href={`/listing/${listing.id}`}>
																		<Button variant="outline" size="sm">
																			<Eye className="w-4 h-4 mr-2" />
																			Voir
																		</Button>
																	</Link>
																	<Button
																		variant="outline"
																		size="sm"
																		className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
																		onClick={() =>
																			handleDeleteListing(listing.id)
																		}
																	>
																		<X className="w-4 h-4 mr-2" />
																		Supprimer
																	</Button>
																</div>
															</CardContent>
														</Card>
													</motion.div>
												))}
											</div>
										) : (
											<motion.div
												initial={{ opacity: 0 }}
												animate={{ opacity: 1 }}
												className="text-center py-12"
											>
												<div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
													<Building className="w-10 h-10 text-gray-400" />
												</div>
												<h3 className="text-xl font-semibold text-gray-900 mb-3">
													Aucune annonce
												</h3>
												<p className="text-gray-600 mb-6 max-w-md mx-auto">
													Vous n'avez pas encore publié d'annonce. Commencez dès
													maintenant !
												</p>
												<Link href="/dashboard">
													<Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
														<Building className="w-4 h-4 mr-2" />
														Créer ma première annonce
													</Button>
												</Link>
											</motion.div>
										)}
									</CardContent>
								</Card>
							</TabsContent>
						</Tabs>
					</motion.div>
				</motion.div>
			</div>
		</div>
	);
}
