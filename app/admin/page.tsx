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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Home,
	Shield,
	Check,
	X,
	Clock,
	Users,
	Building,
	MapPin,
	Phone,
	Calendar,
	Loader2,
	ArrowLeft,
	Mail,
	UserCheck,
	Plus,
	BarChart3,
	MessageSquare,
	Bug,
	Lightbulb,
	User,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface AdminListing {
	id: string;
	title: string;
	type: string;
	mode: string;
	price: number;
	location: string;
	description: string;
	contact_phone: string;
	caution: number;
	admin_validated: boolean;
	status: string;
	created_at: string;
	views: number;
	user: {
		first_name: string;
		last_name: string;
		email: string;
		phone: string;
		role: string;
	};
}

interface AdminUser {
	id: string;
	email: string;
	first_name: string;
	last_name: string;
	phone: string;
	role: string;
	verified: boolean;
	blocked?: boolean;
	created_at: string;
}

interface AdminMessage {
	id: string;
	name: string;
	email: string;
	subject: string;
	message: string;
	type: string;
	priority: string;
	status: string;
	admin_response?: string;
	created_at: string;
	users?: {
		first_name: string;
		last_name: string;
		email: string;
	};
	responded_by_user?: {
		first_name: string;
		last_name: string;
	};
}

export default function AdminPage() {
	const router = useRouter();
	const { user, loading } = useAuth();
	const [listings, setListings] = useState<AdminListing[]>([]);
	const [users, setUsers] = useState<AdminUser[]>([]);
	const [messages, setMessages] = useState<AdminMessage[]>([]);
	const [loadingListings, setLoadingListings] = useState(true);
	const [loadingUsers, setLoadingUsers] = useState(true);
	const [loadingMessages, setLoadingMessages] = useState(true);
	const [activeTab, setActiveTab] = useState("pending");
	const [processingId, setProcessingId] = useState<string | null>(null);
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

	// Vérifier si l'utilisateur est admin
	useEffect(() => {
		if (!loading && (!user || user.role !== "admin")) {
			router.push("/");
		}
	}, [user, loading, router]);

	// Charger les annonces et utilisateurs
	useEffect(() => {
		if (user && user.role === "admin") {
			fetchListings();
			fetchUsers();
			fetchMessages();
		}
	}, [user]);

	const fetchListings = async () => {
		try {
			setLoadingListings(true);
			const response = await fetch("/api/admin/listings");

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

	const fetchUsers = async () => {
		try {
			setLoadingUsers(true);
			const response = await fetch("/api/admin/users");

			if (response.ok) {
				const data = await response.json();
				setUsers(data.users || []);
			} else {
				console.error("Erreur lors du chargement des utilisateurs");
			}
		} catch (error) {
			console.error("Erreur:", error);
		} finally {
			setLoadingUsers(false);
		}
	};

	const fetchMessages = async () => {
		try {
			setLoadingMessages(true);
			const response = await fetch("/api/admin/messages");

			if (response.ok) {
				const data = await response.json();
				setMessages(data.messages || []);
			} else {
				console.error("Erreur lors du chargement des messages");
			}
		} catch (error) {
			console.error("Erreur:", error);
		} finally {
			setLoadingMessages(false);
		}
	};
	const handleValidation = async (
		listingId: string,
		action: "approve" | "reject"
	) => {
		setProcessingId(listingId);

		try {
			const response = await fetch(
				`/api/admin/listings/${listingId}/validate`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ action }),
				}
			);

			if (response.ok) {
				await fetchListings();
				alert(
					action === "approve"
						? "Annonce approuvée avec succès!"
						: "Annonce rejetée"
				);
			} else {
				alert("Erreur lors de la validation");
			}
		} catch (error) {
			alert("Erreur de connexion");
		} finally {
			setProcessingId(null);
		}
	};

	const handleBlockUser = async (
		userId: string,
		action: "block" | "unblock"
	) => {
		setProcessingId(userId);

		try {
			const response = await fetch(`/api/admin/users/${userId}/block`, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ action }),
			});

			if (response.ok) {
				await fetchUsers();
				alert(
					action === "block"
						? "Utilisateur bloqué avec succès!"
						: "Utilisateur débloqué avec succès!"
				);
			} else {
				alert("Erreur lors de l'action");
			}
		} catch (error) {
			alert("Erreur de connexion");
		} finally {
			setProcessingId(null);
		}
	};

	const handleMessageAction = async (
		messageId: string,
		action: "take" | "resolve" | "delete"
	) => {
		setProcessingId(messageId);

		try {
			if (action === "delete") {
				const response = await fetch(`/api/admin/messages/${messageId}`, {
					method: "DELETE",
				});

				if (response.ok) {
					await fetchMessages();
					alert("Message supprimé avec succès!");
				} else {
					alert("Erreur lors de la suppression");
				}
			} else {
				const status = action === "take" ? "in_progress" : "resolved";

				const response = await fetch(`/api/admin/messages/${messageId}`, {
					method: "PUT",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ status }),
				});

				if (response.ok) {
					await fetchMessages();
					alert(
						action === "take"
							? "Message pris en charge!"
							: "Message marqué comme résolu!"
					);
				} else {
					alert("Erreur lors de la mise à jour");
				}
			}
		} catch (error) {
			alert("Erreur de connexion");
		} finally {
			setProcessingId(null);
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
				alert("Annonce créée avec succès!");
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

	const pendingListings = listings.filter((l) => !l.admin_validated);
	const approvedListings = listings.filter(
		(l) => l.admin_validated && l.status === "active"
	);
	const rejectedListings = listings.filter((l) => l.status === "inactive");
	const pendingMessages = messages.filter((m) => m.status === "pending");
	const inProgressMessages = messages.filter((m) => m.status === "in_progress");
	const resolvedMessages = messages.filter((m) => m.status === "resolved");
	const totalUsers = users.length;
	const verifiedUsers = users.filter((u) => u.verified).length;
	const studentsCount = users.filter((u) => u.role === "student").length;
	const landlordsCount = users.filter((u) => u.role === "landlord").length;

	const getMessageTypeIcon = (type: string) => {
		switch (type) {
			case "bug":
				return <Bug className="w-4 h-4 text-red-600" />;
			case "suggestion":
				return <Lightbulb className="w-4 h-4 text-yellow-600" />;
			case "question":
				return <MessageSquare className="w-4 h-4 text-blue-600" />;
			default:
				return <MessageSquare className="w-4 h-4" />;
		}
	};

	const getPriorityColor = (priority: string) => {
		switch (priority) {
			case "urgent":
				return "bg-red-100 text-red-800 border-red-200";
			case "high":
				return "bg-orange-100 text-orange-800 border-orange-200";
			case "medium":
				return "bg-yellow-100 text-yellow-800 border-yellow-200";
			case "low":
				return "bg-green-100 text-green-800 border-green-200";
			default:
				return "bg-gray-100 text-gray-800 border-gray-200";
		}
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "pending":
				return "bg-yellow-100 text-yellow-800";
			case "in_progress":
				return "bg-blue-100 text-blue-800";
			case "resolved":
				return "bg-green-100 text-green-800";
			default:
				return "bg-gray-100 text-gray-800";
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

	const getListingTypeIcon = (type: string) => {
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

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50">
			{/* Header */}
			<header className="bg-white shadow-sm border-b">
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
									UAD Deukouway - Administration
								</h1>
								<p className="text-xs text-gray-500">Gestion du système</p>
							</div>
						</div>
						<div className="flex items-center space-x-3">
							<span className="text-sm text-gray-700">
								{user.firstName} {user.lastName}
							</span>
							<Badge className="bg-red-100 text-red-800 hover:bg-red-100">
								<Shield className="w-3 h-3 mr-1" />
								Admin
							</Badge>
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
											Créez une annonce en tant qu'administrateur. Elle sera
											automatiquement validée.
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
														Publication...
													</>
												) : (
													"Publier l'annonce"
												)}
											</Button>
										</div>
									</form>
								</DialogContent>
							</Dialog>
							<Link href="/profile">
								<Button variant="outline" size="sm">
									Mon profil
								</Button>
							</Link>
							<Link href="/admin/statistics">
								<Button variant="outline" size="sm">
									<BarChart3 className="w-4 h-4 mr-2" />
									Statistiques
								</Button>
							</Link>
							<Link href="/admin/messages">
								<Button variant="outline" size="sm">
									<MessageSquare className="w-4 h-4 mr-2" />
									Messages
								</Button>
							</Link>
						</div>
					</div>
				</div>
			</header>

			<div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
				{/* Stats Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
					<Card className="shadow-lg border-0">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-600">
										Messages en attente
									</p>
									<p className="text-3xl font-bold text-orange-600">
										{pendingMessages.length}
									</p>
								</div>
								<MessageSquare className="w-8 h-8 text-orange-600" />
							</div>
						</CardContent>
					</Card>

					<Card className="shadow-lg border-0">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-600">
										Annonces à valider
									</p>
									<p className="text-3xl font-bold text-yellow-600">
										{pendingListings.length}
									</p>
								</div>
								<Clock className="w-8 h-8 text-yellow-600" />
							</div>
						</CardContent>
					</Card>

					<Card className="shadow-lg border-0">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-600">
										Annonces approuvées
									</p>
									<p className="text-3xl font-bold text-green-600">
										{approvedListings.length}
									</p>
								</div>
								<Check className="w-8 h-8 text-green-600" />
							</div>
						</CardContent>
					</Card>

					<Card className="shadow-lg border-0">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-600">
										Total utilisateurs
									</p>
									<p className="text-3xl font-bold text-blue-600">
										{totalUsers}
									</p>
								</div>
								<Users className="w-8 h-8 text-blue-600" />
							</div>
						</CardContent>
					</Card>

					<Card className="shadow-lg border-0">
						<CardContent className="p-6">
							<div className="flex items-center justify-between">
								<div>
									<p className="text-sm font-medium text-gray-600">
										Utilisateurs vérifiés
									</p>
									<p className="text-3xl font-bold text-green-600">
										{verifiedUsers}
									</p>
								</div>
								<UserCheck className="w-8 h-8 text-green-600" />
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Management Tabs */}
				<Tabs value={activeTab} onValueChange={setActiveTab}>
					<TabsList className="grid w-full grid-cols-2 mb-6">
						<TabsTrigger value="pending" className="relative">
							Gestion des annonces
							{pendingListings.length > 0 && (
								<Badge className="ml-2 bg-yellow-500 text-white text-xs px-1.5 py-0.5">
									{pendingListings.length}
								</Badge>
							)}
						</TabsTrigger>
						<TabsTrigger value="users">
							Gestion des utilisateurs ({totalUsers})
						</TabsTrigger>
					</TabsList>

					<TabsContent value="pending">
						<Card className="shadow-lg border-0">
							<CardHeader>
								<CardTitle>Gestion des annonces</CardTitle>
								<CardDescription>
									Validez ou rejetez les annonces soumises
								</CardDescription>
							</CardHeader>
							<CardContent>
								<Tabs defaultValue="pending-listings">
									<TabsList className="grid w-full grid-cols-3 mb-6">
										<TabsTrigger value="pending-listings" className="relative">
											En attente
											{pendingListings.length > 0 && (
												<Badge className="ml-2 bg-yellow-500 text-white text-xs px-1.5 py-0.5">
													{pendingListings.length}
												</Badge>
											)}
										</TabsTrigger>
										<TabsTrigger value="approved-listings">
											Approuvées ({approvedListings.length})
										</TabsTrigger>
										<TabsTrigger value="rejected-listings">
											Rejetées ({rejectedListings.length})
										</TabsTrigger>
									</TabsList>

									<TabsContent value="pending-listings">
										{loadingListings ? (
											<div className="space-y-4">
												{[1, 2, 3].map((i) => (
													<Card key={i} className="border">
														<CardContent className="p-6">
															<div className="space-y-3">
																<div className="h-4 bg-gray-200 rounded animate-pulse"></div>
																<div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
																<div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
															</div>
														</CardContent>
													</Card>
												))}
											</div>
										) : pendingListings.length > 0 ? (
											<div className="space-y-4">
												{pendingListings.map((listing) => (
													<Card
														key={listing.id}
														className="border border-yellow-200 bg-yellow-50/30"
													>
														<CardContent className="p-6">
															<div className="flex justify-between items-start mb-4">
																<div className="flex-1">
																	<div className="flex items-center space-x-2 mb-2">
																		{getListingTypeIcon(listing.type)}
																		<h3 className="text-lg font-semibold text-gray-900">
																			{listing.title}
																		</h3>
																		<Badge
																			variant="outline"
																			className="bg-yellow-100 text-yellow-800 border-yellow-300"
																		>
																			<Clock className="w-3 h-3 mr-1" />
																			En attente
																		</Badge>
																	</div>

																	<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
																		<div className="space-y-2">
																			<div className="flex items-center text-sm text-gray-600">
																				<Building className="w-4 h-4 mr-2" />
																				{formatListingType(listing.type)} -{" "}
																				{formatListingMode(listing.mode)}
																			</div>
																			<div className="flex items-center text-sm text-gray-600">
																				<MapPin className="w-4 h-4 mr-2" />
																				{listing.location}
																			</div>
																			<div className="flex items-center text-sm text-gray-600">
																				<Phone className="w-4 h-4 mr-2" />
																				{listing.contact_phone}
																			</div>
																		</div>

																		<div className="space-y-2">
																			<div className="text-sm">
																				<span className="font-medium text-gray-700">
																					Publié par:
																				</span>
																				<span className="ml-2">
																					{listing.user.first_name}{" "}
																					{listing.user.last_name}
																				</span>
																			</div>
																		</div>
																	</div>

																	<div className="mb-4">
																		<p className="text-sm text-gray-700 line-clamp-2">
																			{listing.description}
																		</p>
																	</div>

																	<div className="flex items-center text-xs text-gray-500 space-x-4">
																		<div className="flex items-center">
																			<Calendar className="w-3 h-3 mr-1" />
																			{new Date(
																				listing.created_at
																			).toLocaleDateString("fr-FR")}
																		</div>
																		<div className="flex items-center">
																			<Users className="w-3 h-3 mr-1" />
																			{listing.views} vues
																		</div>
																	</div>
																</div>
															</div>

															<div className="flex justify-end space-x-3">
																<Button
																	variant="outline"
																	size="sm"
																	className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
																	onClick={() =>
																		handleValidation(listing.id, "reject")
																	}
																	disabled={processingId === listing.id}
																>
																	{processingId === listing.id ? (
																		<Loader2 className="w-4 h-4 mr-2 animate-spin" />
																	) : (
																		<X className="w-4 h-4 mr-2" />
																	)}
																	Rejeter
																</Button>
																<Button
																	size="sm"
																	className="bg-green-600 hover:bg-green-700"
																	onClick={() =>
																		handleValidation(listing.id, "approve")
																	}
																	disabled={processingId === listing.id}
																>
																	{processingId === listing.id ? (
																		<Loader2 className="w-4 h-4 mr-2 animate-spin" />
																	) : (
																		<Check className="w-4 h-4 mr-2" />
																	)}
																	Approuver
																</Button>
															</div>
														</CardContent>
													</Card>
												))}
											</div>
										) : (
											<div className="text-center py-12">
												<Clock className="w-16 h-16 text-gray-300 mx-auto mb-4" />
												<h3 className="text-lg font-semibold text-gray-900 mb-2">
													Aucune annonce en attente
												</h3>
												<p className="text-gray-600">
													Toutes les annonces ont été traitées
												</p>
											</div>
										)}
									</TabsContent>

									<TabsContent value="approved-listings">
										{approvedListings.length > 0 ? (
											<div className="space-y-4">
												{approvedListings.map((listing) => (
													<Card
														key={listing.id}
														className="border border-green-200 bg-green-50/30"
													>
														<CardContent className="p-6">
															<div className="flex justify-between items-start">
																<div className="flex-1">
																	<div className="flex items-center space-x-2 mb-2">
																		{getListingTypeIcon(listing.type)}
																		<h3 className="text-lg font-semibold text-gray-900">
																			{listing.title}
																		</h3>
																		<Badge className="bg-green-100 text-green-800 hover:bg-green-100">
																			<Check className="w-3 h-3 mr-1" />
																			Approuvée
																		</Badge>
																	</div>
																	<p className="text-sm text-gray-600 mb-2">
																		{listing.location}
																	</p>
																</div>
																<div className="text-sm text-gray-500">
																	{new Date(
																		listing.created_at
																	).toLocaleDateString("fr-FR")}
																</div>
															</div>
														</CardContent>
													</Card>
												))}
											</div>
										) : (
											<div className="text-center py-12">
												<Check className="w-16 h-16 text-gray-300 mx-auto mb-4" />
												<h3 className="text-lg font-semibold text-gray-900 mb-2">
													Aucune annonce approuvée
												</h3>
												<p className="text-gray-600">
													Les annonces approuvées apparaîtront ici
												</p>
											</div>
										)}
									</TabsContent>

									<TabsContent value="rejected-listings">
										{rejectedListings.length > 0 ? (
											<div className="space-y-4">
												{rejectedListings.map((listing) => (
													<Card
														key={listing.id}
														className="border border-red-200 bg-red-50/30"
													>
														<CardContent className="p-6">
															<div className="flex justify-between items-start">
																<div className="flex-1">
																	<div className="flex items-center space-x-2 mb-2">
																		{getListingTypeIcon(listing.type)}
																		<h3 className="text-lg font-semibold text-gray-900">
																			{listing.title}
																		</h3>
																		<Badge className="bg-red-100 text-red-800 hover:bg-red-100">
																			<X className="w-3 h-3 mr-1" />
																			Rejetée
																		</Badge>
																	</div>
																	<p className="text-sm text-gray-600 mb-2">
																		{listing.location}
																	</p>
																</div>
																<Button
																	size="sm"
																	className="bg-green-600 hover:bg-green-700"
																	onClick={() =>
																		handleValidation(listing.id, "approve")
																	}
																	disabled={processingId === listing.id}
																>
																	{processingId === listing.id ? (
																		<Loader2 className="w-4 h-4 mr-2 animate-spin" />
																	) : (
																		<Check className="w-4 h-4 mr-2" />
																	)}
																	Réactiver
																</Button>
															</div>
														</CardContent>
													</Card>
												))}
											</div>
										) : (
											<div className="text-center py-12">
												<X className="w-16 h-16 text-gray-300 mx-auto mb-4" />
												<h3 className="text-lg font-semibold text-gray-900 mb-2">
													Aucune annonce rejetée
												</h3>
												<p className="text-gray-600">
													Les annonces rejetées apparaîtront ici
												</p>
											</div>
										)}
									</TabsContent>
								</Tabs>
							</CardContent>
						</Card>
					</TabsContent>

					<TabsContent value="users">
						<Card className="shadow-lg border-0">
							<CardHeader>
								<CardTitle>Gestion des utilisateurs</CardTitle>
								<CardDescription>
									Gérez les comptes utilisateurs du système
								</CardDescription>
							</CardHeader>
							<CardContent>
								{loadingUsers ? (
									<div className="space-y-4">
										{[1, 2, 3].map((i) => (
											<Card key={i} className="border">
												<CardContent className="p-6">
													<div className="space-y-3">
														<div className="h-4 bg-gray-200 rounded animate-pulse"></div>
														<div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
														<div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
													</div>
												</CardContent>
											</Card>
										))}
									</div>
								) : users.length > 0 ? (
									<div className="space-y-4">
										<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
											<Card className="border border-blue-200 bg-blue-50/30">
												<CardContent className="p-4 text-center">
													<div className="text-2xl font-bold text-blue-600">
														{studentsCount}
													</div>
													<div className="text-sm text-gray-600">Étudiants</div>
												</CardContent>
											</Card>
											<Card className="border border-green-200 bg-green-50/30">
												<CardContent className="p-4 text-center">
													<div className="text-2xl font-bold text-green-600">
														{landlordsCount}
													</div>
													<div className="text-sm text-gray-600">
														Propriétaires
													</div>
												</CardContent>
											</Card>
											<Card className="border border-purple-200 bg-purple-50/30">
												<CardContent className="p-4 text-center">
													<div className="text-2xl font-bold text-purple-600">
														{verifiedUsers}
													</div>
													<div className="text-sm text-gray-600">Vérifiés</div>
												</CardContent>
											</Card>
										</div>

										{users.map((user) => (
											<Card key={user.id} className="border">
												<CardContent className="p-6">
													<div className="flex justify-between items-start">
														<div className="flex-1">
															<div className="flex items-center space-x-3 mb-3">
																<div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
																	<Users className="w-5 h-5 text-blue-600" />
																</div>
																<div>
																	<h3 className="font-semibold text-gray-900">
																		{user.first_name} {user.last_name}
																	</h3>
																	<div className="flex items-center space-x-2">
																		<Badge
																			variant={
																				user.role === "student"
																					? "secondary"
																					: "default"
																			}
																		>
																			{user.role === "student"
																				? "Étudiant"
																				: "Propriétaire"}
																		</Badge>
																		{user.verified && (
																			<Badge className="bg-green-100 text-green-800 hover:bg-green-100">
																				<UserCheck className="w-3 h-3 mr-1" />
																				Vérifié
																			</Badge>
																		)}
																		{user.blocked && (
																			<Badge className="bg-red-100 text-red-800 hover:bg-red-100">
																				<X className="w-3 h-3 mr-1" />
																				Bloqué
																			</Badge>
																		)}
																	</div>
																</div>
															</div>

															<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
																<div className="space-y-2">
																	<div className="flex items-center text-sm text-gray-600">
																		<Mail className="w-4 h-4 mr-2" />
																		{user.email}
																	</div>
																	<div className="flex items-center text-sm text-gray-600">
																		<Phone className="w-4 h-4 mr-2" />
																		{user.phone}
																	</div>
																</div>
																<div className="space-y-2">
																	<div className="flex items-center text-sm text-gray-600">
																		<Calendar className="w-4 h-4 mr-2" />
																		Inscrit le{" "}
																		{new Date(
																			user.created_at
																		).toLocaleDateString("fr-FR")}
																	</div>
																</div>
															</div>
														</div>

														<div className="flex justify-end mt-4">
															{user.blocked ? (
																<Button
																	size="sm"
																	className="bg-green-600 hover:bg-green-700"
																	onClick={() =>
																		handleBlockUser(user.id, "unblock")
																	}
																	disabled={processingId === user.id}
																>
																	{processingId === user.id ? (
																		<Loader2 className="w-4 h-4 mr-2 animate-spin" />
																	) : (
																		<Check className="w-4 h-4 mr-2" />
																	)}
																	Débloquer
																</Button>
															) : (
																<Button
																	variant="outline"
																	size="sm"
																	className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
																	onClick={() =>
																		handleBlockUser(user.id, "block")
																	}
																	disabled={processingId === user.id}
																>
																	{processingId === user.id ? (
																		<Loader2 className="w-4 h-4 mr-2 animate-spin" />
																	) : (
																		<X className="w-4 h-4 mr-2" />
																	)}
																	Bloquer
																</Button>
															)}
														</div>
													</div>
												</CardContent>
											</Card>
										))}
									</div>
								) : (
									<div className="text-center py-12">
										<Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
										<h3 className="text-lg font-semibold text-gray-900 mb-2">
											Aucun utilisateur
										</h3>
										<p className="text-gray-600">
											Les utilisateurs inscrits apparaîtront ici
										</p>
									</div>
								)}
							</CardContent>
						</Card>
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}
