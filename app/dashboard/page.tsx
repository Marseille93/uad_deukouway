"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Home,
	Search,
	Filter,
	Plus,
	Users,
	Building,
	MapPin,
	Phone,
	Calendar,
	Eye,
	User,
	LogOut,
	Loader2,
	X,
	MessageSquare,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface Listing {
	id: string;
	title: string;
	type: string;
	mode: string;
	price: number;
	priceType: string;
	location: string;
	description: string;
	images: string[];
	availableSpots?: number;
	totalSpots?: number;
	contact: string;
	publisher: {
		name: string;
		role: string;
		verified: boolean;
		memberSince: string;
	};
	views: number;
	createdAt: string;
}

export default function DashboardPage() {
	const router = useRouter();
	const { user, loading, logout } = useAuth();
	const [listings, setListings] = useState<Listing[]>([]);
	const [filteredListings, setFilteredListings] = useState<Listing[]>([]);
	const [loadingListings, setLoadingListings] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [typeFilter, setTypeFilter] = useState("all");
	const [modeFilter, setModeFilter] = useState("all");
	const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [createError, setCreateError] = useState("");

	const [formData, setFormData] = useState({
		title: "",
		type: "",
		mode: "",
		price: "",
		priceType: "total",
		location: "",
		description: "",
		availableSpots: "1",
		contact: "",
		cautionAmount: "0",
		hasCaution: false,
	});

	// Rediriger vers la page d'authentification si pas connecté
	useEffect(() => {
		if (!loading && !user) {
			router.push("/auth");
		}
	}, [user, loading, router]);

	// Charger les annonces
	useEffect(() => {
		if (user) {
			fetchListings();
		}
	}, [user]);

	// Filtrer les annonces
	useEffect(() => {
		let filtered = listings;

		if (searchTerm) {
			filtered = filtered.filter(
				(listing) =>
					listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
					listing.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
					listing.description.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		if (typeFilter !== "all") {
			filtered = filtered.filter((listing) => listing.type === typeFilter);
		}

		if (modeFilter !== "all") {
			filtered = filtered.filter((listing) => listing.mode === modeFilter);
		}

		setFilteredListings(filtered);
	}, [listings, searchTerm, typeFilter, modeFilter]);

	const fetchListings = async () => {
		try {
			setLoadingListings(true);
			const response = await fetch("/api/listings");

			if (response.ok) {
				const data = await response.json();
				setListings(data.listings || []);
			} else {
				console.error("Erreur lors du chargement des annonces");
			}
		} catch (error) {
			console.error("Erreur:", error);
		} finally {
			setLoadingListings(false);
		}
	};

	const handleCreateListing = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setCreateError("");

		try {
			const response = await fetch("/api/listings", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					title: formData.title,
					type:
						formData.type === "Chambre"
							? "room"
							: formData.type === "Appartement"
							? "apartment"
							: "house",
					mode: formData.mode === "Colocation" ? "colocation" : "classic",
					price: parseInt(formData.price),
					priceType: formData.priceType,
					location: formData.location,
					description: formData.description,
					availableSpots:
						formData.mode === "Colocation"
							? parseInt(formData.availableSpots)
							: null,
					contact: formData.contact,
					cautionAmount: formData.hasCaution
						? parseInt(formData.cautionAmount)
						: 0,
					images: [],
				}),
			});

			if (response.ok) {
				const data = await response.json();
				alert(
					data.message ||
						"Annonce soumise avec succès! Elle sera visible après validation par l'administrateur."
				);
				setIsCreateModalOpen(false);
				setFormData({
					title: "",
					type: "",
					mode: "",
					price: "",
					priceType: "total",
					location: "",
					description: "",
					availableSpots: "1",
					contact: "",
					cautionAmount: "0",
					hasCaution: false,
				});
				fetchListings(); // Recharger les annonces
			} else {
				const data = await response.json();
				setCreateError(data.error || "Erreur lors de la publication");
			}
		} catch (error) {
			setCreateError("Erreur de connexion");
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleLogout = async () => {
		await logout();
		router.push("/");
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

	const getTypeIcon = (type: string) => {
		switch (type) {
			case "Chambre":
				return <Home className="w-4 h-4" />;
			case "Appartement":
				return <Building className="w-4 h-4" />;
			case "Maison":
				return <Building className="w-4 h-4" />;
			default:
				return <Home className="w-4 h-4" />;
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50">
			{/* Header */}
			<header className="bg-white shadow-sm border-b sticky top-0 z-40">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<div className="flex items-center space-x-3">
							<div className="rounded-lg flex items-center justify-center">
								<Image
									src="/uadDeukouway.png"
									alt="Logo"
									width={60}
									height={50}
								/>
							</div>
							<div>
								<h1 className="text-xl font-bold text-gray-900">
									UAD Deukouway
								</h1>
								<p className="text-xs text-gray-500 hidden sm:block">
									Logements étudiants
								</p>
							</div>
						</div>
						<div className="flex items-center space-x-3">
							<span className="text-sm text-gray-700 hidden sm:block">
								{user.firstName} {user.lastName}
							</span>
							<Link href="/contact-admin">
								<Button variant="outline" size="sm">
									<MessageSquare className="w-4 h-4 sm:mr-2" />
									<span className="hidden sm:inline">Contact Admin</span>
								</Button>
							</Link>
							<Link href="/profile">
								<Button variant="outline" size="sm">
									<User className="w-4 h-4 sm:mr-2" />
									<span className="hidden sm:inline">Profil</span>
								</Button>
							</Link>
							<Button variant="outline" size="sm" onClick={handleLogout}>
								<LogOut className="w-4 h-4 sm:mr-2" />
								<span className="hidden sm:inline">Déconnexion</span>
							</Button>
						</div>
					</div>
				</div>
			</header>

			<div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
				{/* Welcome Section */}
				<div className="mb-8">
					<h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
						Bienvenue, {user.firstName} !
					</h2>
					<p className="text-gray-600">
						Découvre les logements disponibles ou publie ta propre annonce
					</p>
				</div>

				{/* Search and Filters */}
				<Card className="shadow-lg border-0 mb-8">
					<CardContent className="p-4 sm:p-6">
						<div className="flex flex-col sm:flex-row gap-4 mb-4">
							<div className="flex-1">
								<div className="relative">
									<Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
									<Input
										placeholder="Rechercher par titre, localisation..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										className="pl-10"
									/>
								</div>
							</div>
							<Dialog
								open={isCreateModalOpen}
								onOpenChange={setIsCreateModalOpen}
							>
								<DialogTrigger asChild>
									<Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
										<Plus className="w-4 h-4 mr-2" />
										Faire une annonce
									</Button>
								</DialogTrigger>
								<DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
									<DialogHeader>
										<DialogTitle>Créer une nouvelle annonce</DialogTitle>
										<DialogDescription>
											Remplissez les informations pour publier votre annonce.
											Elle sera visible après validation.
										</DialogDescription>
									</DialogHeader>

									{createError && (
										<div className="p-3 bg-red-50 border border-red-200 rounded-lg">
											<p className="text-red-600 text-sm">{createError}</p>
										</div>
									)}

									<form onSubmit={handleCreateListing} className="space-y-4">
										<div className="space-y-2">
											<Label htmlFor="title">Titre de l'annonce</Label>
											<Input
												id="title"
												placeholder="Ex: Chambre en colocation - Centre ville"
												value={formData.title}
												onChange={(e) =>
													setFormData({ ...formData, title: e.target.value })
												}
												required
											/>
										</div>

										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label>Type de logement</Label>
												<Select
													value={formData.type}
													onValueChange={(value) =>
														setFormData({ ...formData, type: value })
													}
												>
													<SelectTrigger>
														<SelectValue placeholder="Type" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="Chambre">Chambre</SelectItem>
														<SelectItem value="Appartement">
															Appartement
														</SelectItem>
														<SelectItem value="Maison">Maison</SelectItem>
													</SelectContent>
												</Select>
											</div>

											<div className="space-y-2">
												<Label>Mode de location</Label>
												<Select
													value={formData.mode}
													onValueChange={(value) =>
														setFormData({ ...formData, mode: value })
													}
												>
													<SelectTrigger>
														<SelectValue placeholder="Mode" />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="Colocation">
															Colocation
														</SelectItem>
														<SelectItem value="Location classique">
															Location classique
														</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>

										{formData.mode === "Colocation" && (
											<div className="space-y-2">
												<Label htmlFor="spots">
													Nombre de places disponibles
												</Label>
												<Select
													value={formData.availableSpots}
													onValueChange={(value) =>
														setFormData({ ...formData, availableSpots: value })
													}
												>
													<SelectTrigger>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="1">1 place</SelectItem>
														<SelectItem value="2">2 places</SelectItem>
														<SelectItem value="3">3 places</SelectItem>
														<SelectItem value="4">4 places</SelectItem>
														<SelectItem value="5">5+ places</SelectItem>
													</SelectContent>
												</Select>
											</div>
										)}

										<div className="grid grid-cols-2 gap-4">
											<div className="space-y-2">
												<Label htmlFor="price">Prix (FCFA)</Label>
												<Input
													id="price"
													type="number"
													placeholder="50000"
													value={formData.price}
													onChange={(e) =>
														setFormData({ ...formData, price: e.target.value })
													}
													required
												/>
											</div>

											<div className="space-y-2">
												<Label>Type de prix</Label>
												<Select
													value={formData.priceType}
													onValueChange={(value) =>
														setFormData({ ...formData, priceType: value })
													}
												>
													<SelectTrigger>
														<SelectValue />
													</SelectTrigger>
													<SelectContent>
														<SelectItem value="total">Prix total</SelectItem>
														<SelectItem value="par personne">
															Prix par personne
														</SelectItem>
													</SelectContent>
												</Select>
											</div>
										</div>

										<div className="space-y-2">
											<Label htmlFor="location">Localisation</Label>
											<Input
												id="location"
												placeholder="Ex: Centre ville, Bambey"
												value={formData.location}
												onChange={(e) =>
													setFormData({ ...formData, location: e.target.value })
												}
												required
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="contact">Numéro de contact</Label>
											<Input
												id="contact"
												type="tel"
												placeholder="+221 70 123 45 67"
												value={formData.contact}
												onChange={(e) =>
													setFormData({ ...formData, contact: e.target.value })
												}
												required
											/>
										</div>

										<div className="space-y-2">
											<Label htmlFor="description">Description</Label>
											<Textarea
												id="description"
												placeholder="Décrivez votre logement..."
												value={formData.description}
												onChange={(e) =>
													setFormData({
														...formData,
														description: e.target.value,
													})
												}
												rows={3}
												required
											/>
										</div>

										<div className="space-y-4">
											<div className="flex items-center space-x-2">
												<input
													type="checkbox"
													id="hasCaution"
													checked={formData.hasCaution}
													onChange={(e) =>
														setFormData({
															...formData,
															hasCaution: e.target.checked,
														})
													}
													className="rounded border-gray-300"
												/>
												<Label htmlFor="hasCaution">
													Une caution est demandée
												</Label>
											</div>

											{formData.hasCaution && (
												<div className="space-y-2">
													<Label htmlFor="cautionAmount">
														Montant de la caution (FCFA)
													</Label>
													<Input
														id="cautionAmount"
														type="number"
														placeholder="50000"
														value={formData.cautionAmount}
														onChange={(e) =>
															setFormData({
																...formData,
																cautionAmount: e.target.value,
															})
														}
														required={formData.hasCaution}
													/>
												</div>
											)}
										</div>

										<div className="flex justify-end space-x-3 pt-4">
											<Button
												type="button"
												variant="outline"
												onClick={() => setIsCreateModalOpen(false)}
											>
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
														Soumission...
													</>
												) : (
													"Soumettre pour validation"
												)}
											</Button>
										</div>
									</form>
								</DialogContent>
							</Dialog>
						</div>

						<div className="flex flex-col sm:flex-row gap-4">
							<Select value={typeFilter} onValueChange={setTypeFilter}>
								<SelectTrigger className="w-full sm:w-48">
									<SelectValue placeholder="Type de logement" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Tous les types</SelectItem>
									<SelectItem value="Chambre">Chambre</SelectItem>
									<SelectItem value="Appartement">Appartement</SelectItem>
									<SelectItem value="Maison">Maison</SelectItem>
								</SelectContent>
							</Select>

							<Select value={modeFilter} onValueChange={setModeFilter}>
								<SelectTrigger className="w-full sm:w-48">
									<SelectValue placeholder="Mode de location" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">Tous les modes</SelectItem>
									<SelectItem value="Colocation">Colocation</SelectItem>
									<SelectItem value="Location classique">
										Location classique
									</SelectItem>
								</SelectContent>
							</Select>

							{(searchTerm || typeFilter !== "all" || modeFilter !== "all") && (
								<Button
									variant="outline"
									onClick={() => {
										setSearchTerm("");
										setTypeFilter("all");
										setModeFilter("all");
									}}
									className="w-full sm:w-auto"
								>
									<X className="w-4 h-4 mr-2" />
									Effacer
								</Button>
							)}
						</div>
					</CardContent>
				</Card>

				{/* Listings Grid */}
				{loadingListings ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
						{[1, 2, 3, 4, 5, 6].map((i) => (
							<Card key={i} className="shadow-lg border-0">
								<div className="h-48 bg-gray-200 animate-pulse"></div>
								<CardContent className="p-4 sm:p-6">
									<div className="space-y-3">
										<div className="h-4 bg-gray-200 rounded animate-pulse"></div>
										<div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
										<div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
									</div>
								</CardContent>
							</Card>
						))}
					</div>
				) : filteredListings.length > 0 ? (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
						{filteredListings.map((listing) => (
							<Link key={listing.id} href={`/listing/${listing.id}`}>
								<Card className="h-full shadow-lg border-0 hover:shadow-xl transition-all duration-300 cursor-pointer group">
									<div className="relative overflow-hidden">
										<img
											src={
												listing.images[0] ||
												"https://www.villard-bonnot.fr/uploads/Image/85/7392_698_Demander-un-logement.png"
											}
											alt={listing.title}
											className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
										/>
										<div className="absolute top-3 left-3">
											<Badge className="bg-white/90 text-gray-800 hover:bg-white">
												{getTypeIcon(listing.type)}
												<span className="ml-1">{listing.type}</span>
											</Badge>
										</div>
										{listing.mode === "Colocation" &&
											listing.availableSpots && (
												<div className="absolute top-3 right-3">
													<Badge className="bg-green-100 text-green-800 hover:bg-green-100">
														{listing.availableSpots} places libres
													</Badge>
												</div>
											)}
									</div>
									<CardContent className="p-4 sm:p-6">
										<h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
											{listing.title}
										</h3>
										<div className="flex items-center text-sm text-gray-600 mb-3">
											<MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
											<span className="truncate">{listing.location}</span>
										</div>
										<div className="flex items-center justify-between mb-3">
											<Badge
												variant={
													listing.mode === "Colocation"
														? "secondary"
														: "default"
												}
											>
												{listing.mode === "Colocation" && (
													<Users className="w-3 h-3 mr-1" />
												)}
												{listing.mode}
											</Badge>
											<div className="flex items-center text-xs text-gray-500">
												<Eye className="w-3 h-3 mr-1" />
												{listing.views}
											</div>
										</div>
										<div className="flex items-center justify-between text-sm">
											<span className="text-gray-600">
												Par {listing.publisher.name}
											</span>
											<span className="text-gray-500">
												{Math.floor(
													(Date.now() - new Date(listing.createdAt).getTime()) /
														(1000 * 60 * 60 * 24)
												)}
												j
											</span>
										</div>
									</CardContent>
								</Card>
							</Link>
						))}
					</div>
				) : (
					<Card className="shadow-lg border-0">
						<CardContent className="p-8 sm:p-12 text-center">
							<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<Search className="w-8 h-8 text-gray-400" />
							</div>
							<h3 className="text-lg font-semibold text-gray-900 mb-2">
								Aucune annonce trouvée
							</h3>
							<p className="text-gray-600 mb-6">
								{searchTerm || typeFilter !== "all" || modeFilter !== "all"
									? "Essayez de modifier vos critères de recherche"
									: "Aucune annonce disponible pour le moment"}
							</p>
							<Button
								onClick={() => {
									setSearchTerm("");
									setTypeFilter("all");
									setModeFilter("all");
								}}
								variant="outline"
							>
								Effacer les filtres
							</Button>
						</CardContent>
					</Card>
				)}
			</div>
		</div>
	);
}
