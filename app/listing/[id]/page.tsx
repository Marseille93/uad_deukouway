"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Home,
	MapPin,
	Phone,
	Users,
	Calendar,
	Eye,
	Share2,
	Heart,
	ArrowLeft,
	Building,
	Building2,
	ChevronLeft,
	ChevronRight,
	Wifi,
	Car,
	Utensils,
	Bed,
	Bath,
	Shield,
	Loader2,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface ListingDetail {
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
	amenities: string[];
	surface?: string;
	furnished: boolean;
	deposit: number;
	chargesIncluded: boolean;
	availability: string;
}

// Photos aléatoires par défaut
const defaultImages = [
	"https://www.villard-bonnot.fr/uploads/Image/85/7392_698_Demander-un-logement.png",
	"https://www.alsace.eu/media/8851/cea-logement.png?width=763&quality=75",
	"https://montpellier.esnfrance.org/wp-content/uploads/sites/16/2023/11/maison-appartement-logement.png",
	"https://www.villard-bonnot.fr/uploads/Image/85/7392_698_Demander-un-logement.png",
];

export default function ListingDetailPage({
	params,
}: {
	params: { id: string };
}) {
	const router = useRouter();
	const [listing, setListing] = useState<ListingDetail | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [isFavorite, setIsFavorite] = useState(false);

	useEffect(() => {
		fetchListing();
	}, [params.id]);

	const fetchListing = async () => {
		try {
			setLoading(true);
			setError("");

			const response = await fetch(`/api/listings/${params.id}`);

			if (!response.ok) {
				if (response.status === 404) {
					setError("Annonce non trouvée");
				} else {
					setError("Erreur lors du chargement de l'annonce");
				}
				return;
			}

			const data = await response.json();

			// Ajouter des images par défaut si aucune image n'est disponible
			const listingData = {
				...data.listing,
				images:
					data.listing.images && data.listing.images.length > 0
						? data.listing.images
						: [defaultImages[Math.floor(Math.random() * defaultImages.length)]],
			};

			setListing(listingData);
		} catch (err) {
			setError("Erreur de connexion");
		} finally {
			setLoading(false);
		}
	};

	const handleWhatsAppContact = () => {
		if (!listing) return;
		const message = encodeURIComponent(
			`Bonjour, je suis intéressé(e) par votre annonce: ${listing.title}`
		);
		const whatsappUrl = `https://wa.me/${listing.contact.replace(
			/\D/g,
			""
		)}?text=${message}`;
		window.open(whatsappUrl, "_blank");
	};

	const handlePhoneCall = () => {
		if (!listing) return;
		window.location.href = `tel:${listing.contact}`;
	};

	const handleShare = () => {
		if (navigator.share) {
			navigator.share({
				title: listing?.title,
				text: `Découvrez cette annonce sur UAD Deukouway: ${listing?.title}`,
				url: window.location.href,
			});
		} else {
			navigator.clipboard.writeText(window.location.href);
			alert("Lien copié dans le presse-papiers!");
		}
	};

	const getTypeIcon = (type: string) => {
		switch (type) {
			case "Chambre":
				return <Home className="w-4 h-4" />;
			case "Appartement":
				return <Building className="w-4 h-4" />;
			case "Maison":
				return <Building2 className="w-4 h-4" />;
			default:
				return <Home className="w-4 h-4" />;
		}
	};

	const nextImage = () => {
		if (!listing) return;
		setCurrentImageIndex((prev) => (prev + 1) % listing.images.length);
	};

	const prevImage = () => {
		if (!listing) return;
		setCurrentImageIndex(
			(prev) => (prev - 1 + listing.images.length) % listing.images.length
		);
	};

	const formatPrice = (price: number, priceType: string) => {
		return `${price.toLocaleString()} FCFA ${
			priceType === "par personne" ? "/pers" : ""
		}`;
	};

	const getAmenityIcon = (amenity: string) => {
		if (
			amenity.toLowerCase().includes("internet") ||
			amenity.toLowerCase().includes("wifi")
		)
			return Wifi;
		if (amenity.toLowerCase().includes("cuisine")) return Utensils;
		if (amenity.toLowerCase().includes("parking")) return Car;
		if (amenity.toLowerCase().includes("salle de bain")) return Bath;
		if (amenity.toLowerCase().includes("meublé")) return Bed;
		return Home;
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 flex items-center justify-center">
				<div className="text-center">
					<Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
					<p className="text-gray-600">Chargement de l'annonce...</p>
				</div>
			</div>
		);
	}

	if (error || !listing) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 flex items-center justify-center">
				<div className="text-center">
					<div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
						<Home className="w-8 h-8 text-red-400" />
					</div>
					<h3 className="text-lg font-semibold text-gray-900 mb-2">
						{error || "Annonce non trouvée"}
					</h3>
					<p className="text-gray-600 mb-4">
						Cette annonce n'existe pas ou n'est plus disponible
					</p>
					<Link href="/">
						<Button variant="outline">
							<ArrowLeft className="w-4 h-4 mr-2" />
							Retour à l'accueil
						</Button>
					</Link>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50">
			{/* Header */}
			<header className="bg-white shadow-sm border-b sticky top-0 z-40">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<Link href="/dashboard" className="flex items-center space-x-3">
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
						<div className="flex items-center space-x-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => setIsFavorite(!isFavorite)}
								className={
									isFavorite ? "text-red-500 border-red-200 bg-red-50" : ""
								}
							>
								<Heart
									className={`w-4 h-4 ${isFavorite ? "fill-current" : ""}`}
								/>
							</Button>
							<Button variant="outline" size="sm" onClick={handleShare}>
								<Share2 className="w-4 h-4" />
							</Button>
						</div>
					</div>
				</div>
			</header>

			<div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					{/* Main Content */}
					<div className="lg:col-span-2 space-y-6">
						{/* Image Gallery */}
						<Card className="shadow-lg border-0 overflow-hidden">
							<div className="relative">
								<div className="relative h-64 md:h-96">
									<img
										src={listing.images[currentImageIndex]}
										alt={listing.title}
										className="w-full h-full object-cover"
									/>

									{/* Navigation arrows */}
									{listing.images.length > 1 && (
										<>
											<button
												onClick={prevImage}
												className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
											>
												<ChevronLeft className="w-5 h-5" />
											</button>
											<button
												onClick={nextImage}
												className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
											>
												<ChevronRight className="w-5 h-5" />
											</button>
										</>
									)}

									{/* Image indicators */}
									{listing.images.length > 1 && (
										<div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
											{listing.images.map((_, index) => (
												<button
													key={index}
													onClick={() => setCurrentImageIndex(index)}
													className={`w-3 h-3 rounded-full transition-all ${
														index === currentImageIndex
															? "bg-white"
															: "bg-white/60"
													}`}
												/>
											))}
										</div>
									)}

									{/* Badges */}
									<div className="absolute top-4 left-4 flex space-x-2">
										<Badge className="bg-white/90 text-gray-800 hover:bg-white">
											{getTypeIcon(listing.type)}
											<span className="ml-1">{listing.type}</span>
										</Badge>
										<Badge
											variant={
												listing.mode === "Colocation" ? "secondary" : "default"
											}
										>
											{listing.mode === "Colocation" && (
												<Users className="w-3 h-3 mr-1" />
											)}
											{listing.mode}
										</Badge>
									</div>

									{/* Image counter */}
									{listing.images.length > 1 && (
										<div className="absolute top-4 right-4">
											<Badge className="bg-black/50 text-white hover:bg-black/50">
												{currentImageIndex + 1} / {listing.images.length}
											</Badge>
										</div>
									)}
								</div>

								{/* Thumbnail gallery */}
								{listing.images.length > 1 && (
									<div className="p-4 bg-gray-50">
										<div className="flex space-x-2 overflow-x-auto">
											{listing.images.map((image, index) => (
												<button
													key={index}
													onClick={() => setCurrentImageIndex(index)}
													className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${
														index === currentImageIndex
															? "border-blue-500"
															: "border-transparent"
													}`}
												>
													<img
														src={image}
														alt={`Photo ${index + 1}`}
														className="w-full h-full object-cover"
													/>
												</button>
											))}
										</div>
									</div>
								)}
							</div>
						</Card>

						{/* Title and Price */}
						<Card className="shadow-lg border-0">
							<CardContent className="p-6">
								<div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
									<div className="flex-1">
										<h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
											{listing.title}
										</h1>
										<div className="flex items-center text-gray-600 mb-4">
											<MapPin className="w-5 h-5 mr-2" />
											<span className="text-lg">{listing.location}</span>
										</div>
									</div>
									<div className="text-right">
										<div className="text-3xl font-bold text-blue-600 mb-1">
											{formatPrice(listing.price, listing.priceType)}
										</div>
										<div className="text-sm text-gray-500">
											{listing.priceType === "par personne"
												? "par personne/mois"
												: "total/mois"}
										</div>
									</div>
								</div>

								{listing.mode === "Colocation" &&
									listing.availableSpots &&
									listing.totalSpots && (
										<div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 mb-6">
											<div className="flex items-center justify-between">
												<div className="flex items-center">
													<Users className="w-5 h-5 text-blue-600 mr-2" />
													<span className="font-medium text-gray-900">
														Colocation
													</span>
												</div>
												<Badge className="bg-green-100 text-green-800 hover:bg-green-100">
													{listing.availableSpots} / {listing.totalSpots} places
													libres
												</Badge>
											</div>
										</div>
									)}

								{/* Quick stats */}
								<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
									<div className="text-center p-3 bg-gray-50 rounded-lg">
										<div className="text-2xl font-bold text-blue-600">
											{listing.views}
										</div>
										<div className="text-xs text-gray-600">Vues</div>
									</div>
									{listing.surface && (
										<div className="text-center p-3 bg-gray-50 rounded-lg">
											<div className="text-sm font-medium text-gray-900">
												{listing.surface}
											</div>
											<div className="text-xs text-gray-600">Surface</div>
										</div>
									)}
									<div className="text-center p-3 bg-gray-50 rounded-lg">
										<div className="text-sm font-medium text-gray-900">
											{listing.availability}
										</div>
										<div className="text-xs text-gray-600">Disponibilité</div>
									</div>
									<div className="text-center p-3 bg-gray-50 rounded-lg">
										<div className="text-sm font-medium text-gray-900">
											{Math.floor(
												(Date.now() - new Date(listing.createdAt).getTime()) /
													(1000 * 60 * 60 * 24)
											)}{" "}
											jours
										</div>
										<div className="text-xs text-gray-600">En ligne</div>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Description */}
						<Card className="shadow-lg border-0">
							<CardContent className="p-6">
								<h3 className="text-xl font-semibold text-gray-900 mb-4">
									Description
								</h3>
								<div className="text-gray-700 whitespace-pre-line leading-relaxed text-base">
									{listing.description}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Sidebar */}
					<div className="lg:col-span-1">
						{/* Contact Card */}
						<div className="sticky top-24 space-y-6">
							<Card className="shadow-lg border-0">
								<CardContent className="p-6">
									<div className="text-center mb-6">
										<Avatar className="w-20 h-20 mx-auto mb-4">
											<AvatarFallback className="text-lg">
												{listing.publisher.name
													.split(" ")
													.map((n) => n[0])
													.join("")}
											</AvatarFallback>
										</Avatar>
										<div className="flex items-center justify-center space-x-2 mb-2">
											<h3 className="font-semibold text-gray-900">
												{listing.publisher.name}
											</h3>
											{listing.publisher.verified && (
												<Shield className="w-4 h-4 text-blue-600" />
											)}
										</div>
										<Badge
											variant={
												listing.publisher.role === "Étudiant"
													? "secondary"
													: "default"
											}
											className="mb-3"
										>
											{listing.publisher.role}
										</Badge>
										<p className="text-sm text-gray-500">
											Membre depuis{" "}
											{new Date(
												listing.publisher.memberSince
											).toLocaleDateString("fr-FR")}
										</p>
									</div>

									<div className="space-y-3">
										<Button
											onClick={handleWhatsAppContact}
											className="w-full bg-green-600 hover:bg-green-700 transition-colors"
										>
											<Phone className="w-4 h-4 mr-2" />
											WhatsApp
										</Button>

										<Button
											onClick={handlePhoneCall}
											variant="outline"
											className="w-full"
										>
											<Phone className="w-4 h-4 mr-2" />
											Appeler
										</Button>
									</div>

									<div className="mt-6 pt-6 border-t">
										<div className="text-center space-y-2">
											<div className="flex items-center justify-center text-sm text-gray-500">
												<Eye className="w-4 h-4 mr-1" />
												{listing.views} vues
											</div>
											<div className="flex items-center justify-center text-sm text-gray-500">
												<Calendar className="w-4 h-4 mr-1" />
												Publié le{" "}
												{new Date(listing.createdAt).toLocaleDateString(
													"fr-FR"
												)}
											</div>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Quick Info */}
							<Card className="shadow-lg border-0">
								<CardContent className="p-6">
									<h3 className="font-semibold text-gray-900 mb-4">
										Informations rapides
									</h3>
									<div className="space-y-3">
										<div className="flex justify-between">
											<span className="text-gray-600">Type</span>
											<span className="font-medium">{listing.type}</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-600">Mode</span>
											<span className="font-medium">{listing.mode}</span>
										</div>
										<div className="flex justify-between">
											<span className="text-gray-600">Prix</span>
											<span className="font-medium">
												{formatPrice(listing.price, listing.priceType)}
											</span>
										</div>
										{listing.mode === "Colocation" &&
											listing.availableSpots &&
											listing.totalSpots && (
												<>
													<div className="flex justify-between">
														<span className="text-gray-600">Places libres</span>
														<span className="font-medium text-green-600">
															{listing.availableSpots}
														</span>
													</div>
													<div className="flex justify-between">
														<span className="text-gray-600">Total places</span>
														<span className="font-medium">
															{listing.totalSpots}
														</span>
													</div>
												</>
											)}
										{listing.surface && (
											<div className="flex justify-between">
												<span className="text-gray-600">Surface</span>
												<span className="font-medium">{listing.surface}</span>
											</div>
										)}
										<div className="flex justify-between">
											<span className="text-gray-600">Caution</span>
											<span className="font-medium">
												{listing.deposit.toLocaleString()} FCFA
											</span>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Location Map Placeholder */}
							<Card className="shadow-lg border-0">
								<CardContent className="p-6">
									<h3 className="font-semibold text-gray-900 mb-4">
										Localisation
									</h3>
									<div className="bg-gray-100 rounded-lg h-48 flex items-center justify-center mb-4">
										<div className="text-center text-gray-500">
											<MapPin className="w-8 h-8 mx-auto mb-2" />
											<p className="text-sm">Carte interactive</p>
											<p className="text-xs">Bientôt disponible</p>
										</div>
									</div>
									<div className="flex items-center text-gray-600">
										<MapPin className="w-4 h-4 mr-2" />
										<span className="text-sm">{listing.location}</span>
									</div>
								</CardContent>
							</Card>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
