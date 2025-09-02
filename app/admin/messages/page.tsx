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
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Home,
	Shield,
	ArrowLeft,
	MessageSquare,
	Bug,
	Lightbulb,
	User,
	Calendar,
	Mail,
	Loader2,
	Trash2,
	CheckCircle,
	Clock,
	Play,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";

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

export default function AdminMessagesPage() {
	const router = useRouter();
	const { user, loading } = useAuth();
	const [messages, setMessages] = useState<AdminMessage[]>([]);
	const [loadingMessages, setLoadingMessages] = useState(true);
	const [processingId, setProcessingId] = useState<string | null>(null);

	// Vérifier si l'utilisateur est admin
	useEffect(() => {
		if (!loading && (!user || user.role !== "admin")) {
			router.push("/");
		}
	}, [user, loading, router]);

	// Charger les messages
	useEffect(() => {
		if (user && user.role === "admin") {
			fetchMessages();
		}
	}, [user]);

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

	const pendingMessages = messages.filter((m) => m.status === "pending");
	const inProgressMessages = messages.filter((m) => m.status === "in_progress");
	const resolvedMessages = messages.filter((m) => m.status === "resolved");

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

	const formatMessageType = (type: string) => {
		switch (type) {
			case "bug":
				return "Bug";
			case "suggestion":
				return "Suggestion";
			case "question":
				return "Question";
			default:
				return type;
		}
	};

	const formatPriority = (priority: string) => {
		switch (priority) {
			case "urgent":
				return "Urgente";
			case "high":
				return "Élevée";
			case "medium":
				return "Moyenne";
			case "low":
				return "Faible";
			default:
				return priority;
		}
	};

	const formatStatus = (status: string) => {
		switch (status) {
			case "pending":
				return "En attente";
			case "in_progress":
				return "En cours";
			case "resolved":
				return "Résolu";
			default:
				return status;
		}
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
								<span className="font-semibold text-gray-900">
									Gestion des Messages
								</span>
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
				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate="visible"
					className="space-y-8"
				>
					{/* Stats Cards */}
					<motion.div variants={itemVariants}>
						<div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
							<Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300">
								<CardContent className="p-6">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm font-medium text-gray-600">
												En attente
											</p>
											<p className="text-3xl font-bold text-yellow-600">
												{pendingMessages.length}
											</p>
										</div>
										<Clock className="w-8 h-8 text-yellow-600" />
									</div>
								</CardContent>
							</Card>

							<Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300">
								<CardContent className="p-6">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm font-medium text-gray-600">
												En cours
											</p>
											<p className="text-3xl font-bold text-blue-600">
												{inProgressMessages.length}
											</p>
										</div>
										<Play className="w-8 h-8 text-blue-600" />
									</div>
								</CardContent>
							</Card>

							<Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300">
								<CardContent className="p-6">
									<div className="flex items-center justify-between">
										<div>
											<p className="text-sm font-medium text-gray-600">
												Résolus
											</p>
											<p className="text-3xl font-bold text-green-600">
												{resolvedMessages.length}
											</p>
										</div>
										<CheckCircle className="w-8 h-8 text-green-600" />
									</div>
								</CardContent>
							</Card>
						</div>
					</motion.div>

					{/* Messages Management */}
					<motion.div variants={itemVariants}>
						<Card className="shadow-xl border-0">
							<CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
								<CardTitle className="text-xl flex items-center">
									<MessageSquare className="w-5 h-5 mr-2" />
									Gestion des Messages
								</CardTitle>
								<CardDescription className="text-blue-100">
									Gérez les messages reçus des utilisateurs
								</CardDescription>
							</CardHeader>
							<CardContent className="p-6">
								<Tabs defaultValue="pending">
									<TabsList className="grid w-full grid-cols-3 mb-6">
										<TabsTrigger value="pending" className="relative">
											En attente
											{pendingMessages.length > 0 && (
												<Badge className="ml-2 bg-yellow-500 text-white text-xs px-1.5 py-0.5">
													{pendingMessages.length}
												</Badge>
											)}
										</TabsTrigger>
										<TabsTrigger value="in_progress">
											En cours ({inProgressMessages.length})
										</TabsTrigger>
										<TabsTrigger value="resolved">
											Résolus ({resolvedMessages.length})
										</TabsTrigger>
									</TabsList>

									<TabsContent value="pending">
										{loadingMessages ? (
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
										) : pendingMessages.length > 0 ? (
											<div className="space-y-4">
												{pendingMessages.map((message) => (
													<Card
														key={message.id}
														className="border border-yellow-200 bg-yellow-50/30"
													>
														<CardContent className="p-6">
															<div className="flex justify-between items-start mb-4">
																<div className="flex-1">
																	<div className="flex items-center space-x-2 mb-2">
																		{getMessageTypeIcon(message.type)}
																		<h3 className="text-lg font-semibold text-gray-900">
																			{message.subject}
																		</h3>
																		<Badge
																			className={getPriorityColor(
																				message.priority
																			)}
																		>
																			{formatPriority(message.priority)}
																		</Badge>
																		<Badge
																			className={getStatusColor(message.status)}
																		>
																			{formatStatus(message.status)}
																		</Badge>
																	</div>

																	<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
																		<div className="space-y-2">
																			<div className="flex items-center text-sm text-gray-600">
																				<User className="w-4 h-4 mr-2" />
																				{message.name}
																			</div>
																			<div className="flex items-center text-sm text-gray-600">
																				<Mail className="w-4 h-4 mr-2" />
																				{message.email}
																			</div>
																		</div>

																		<div className="space-y-2">
																			<div className="text-sm">
																				<span className="font-medium text-gray-700">
																					Type:
																				</span>
																				<span className="ml-2">
																					{formatMessageType(message.type)}
																				</span>
																			</div>
																			<div className="flex items-center text-sm text-gray-600">
																				<Calendar className="w-4 h-4 mr-2" />
																				{new Date(
																					message.created_at
																				).toLocaleDateString("fr-FR")}
																			</div>
																		</div>
																	</div>

																	<div className="mb-4 p-4 bg-gray-50 rounded-lg">
																		<p className="text-sm text-gray-700">
																			{message.message}
																		</p>
																	</div>
																</div>
															</div>

															<div className="flex justify-end space-x-3">
																<Button
																	variant="outline"
																	size="sm"
																	className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
																	onClick={() =>
																		handleMessageAction(message.id, "delete")
																	}
																	disabled={processingId === message.id}
																>
																	{processingId === message.id ? (
																		<Loader2 className="w-4 h-4 mr-2 animate-spin" />
																	) : (
																		<Trash2 className="w-4 h-4 mr-2" />
																	)}
																	Supprimer
																</Button>
																<Button
																	size="sm"
																	className="bg-blue-600 hover:bg-blue-700"
																	onClick={() =>
																		handleMessageAction(message.id, "take")
																	}
																	disabled={processingId === message.id}
																>
																	{processingId === message.id ? (
																		<Loader2 className="w-4 h-4 mr-2 animate-spin" />
																	) : (
																		<Play className="w-4 h-4 mr-2" />
																	)}
																	Prendre en charge
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
													Aucun message en attente
												</h3>
												<p className="text-gray-600">
													Tous les messages ont été traités
												</p>
											</div>
										)}
									</TabsContent>

									<TabsContent value="in_progress">
										{inProgressMessages.length > 0 ? (
											<div className="space-y-4">
												{inProgressMessages.map((message) => (
													<Card
														key={message.id}
														className="border border-blue-200 bg-blue-50/30"
													>
														<CardContent className="p-6">
															<div className="flex justify-between items-start mb-4">
																<div className="flex-1">
																	<div className="flex items-center space-x-2 mb-2">
																		{getMessageTypeIcon(message.type)}
																		<h3 className="text-lg font-semibold text-gray-900">
																			{message.subject}
																		</h3>
																		<Badge
																			className={getPriorityColor(
																				message.priority
																			)}
																		>
																			{formatPriority(message.priority)}
																		</Badge>
																		<Badge
																			className={getStatusColor(message.status)}
																		>
																			{formatStatus(message.status)}
																		</Badge>
																	</div>

																	<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
																		<div className="space-y-2">
																			<div className="flex items-center text-sm text-gray-600">
																				<User className="w-4 h-4 mr-2" />
																				{message.name}
																			</div>
																			<div className="flex items-center text-sm text-gray-600">
																				<Mail className="w-4 h-4 mr-2" />
																				{message.email}
																			</div>
																		</div>

																		<div className="space-y-2">
																			<div className="text-sm">
																				<span className="font-medium text-gray-700">
																					Type:
																				</span>
																				<span className="ml-2">
																					{formatMessageType(message.type)}
																				</span>
																			</div>
																			{message.responded_by_user && (
																				<div className="text-sm">
																					<span className="font-medium text-gray-700">
																						Pris en charge par:
																					</span>
																					<span className="ml-2">
																						{
																							message.responded_by_user
																								.first_name
																						}{" "}
																						{
																							message.responded_by_user
																								.last_name
																						}
																					</span>
																				</div>
																			)}
																		</div>
																	</div>

																	<div className="mb-4 p-4 bg-gray-50 rounded-lg">
																		<p className="text-sm text-gray-700">
																			{message.message}
																		</p>
																	</div>
																</div>
															</div>

															<div className="flex justify-end space-x-3">
																<Button
																	variant="outline"
																	size="sm"
																	className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300"
																	onClick={() =>
																		handleMessageAction(message.id, "delete")
																	}
																	disabled={processingId === message.id}
																>
																	{processingId === message.id ? (
																		<Loader2 className="w-4 h-4 mr-2 animate-spin" />
																	) : (
																		<Trash2 className="w-4 h-4 mr-2" />
																	)}
																	Supprimer
																</Button>
																<Button
																	size="sm"
																	className="bg-green-600 hover:bg-green-700"
																	onClick={() =>
																		handleMessageAction(message.id, "resolve")
																	}
																	disabled={processingId === message.id}
																>
																	{processingId === message.id ? (
																		<Loader2 className="w-4 h-4 mr-2 animate-spin" />
																	) : (
																		<CheckCircle className="w-4 h-4 mr-2" />
																	)}
																	Marquer résolu
																</Button>
															</div>
														</CardContent>
													</Card>
												))}
											</div>
										) : (
											<div className="text-center py-12">
												<Play className="w-16 h-16 text-gray-300 mx-auto mb-4" />
												<h3 className="text-lg font-semibold text-gray-900 mb-2">
													Aucun message en cours
												</h3>
												<p className="text-gray-600">
													Les messages en cours de traitement apparaîtront ici
												</p>
											</div>
										)}
									</TabsContent>

									<TabsContent value="resolved">
										{resolvedMessages.length > 0 ? (
											<div className="space-y-4">
												{resolvedMessages.map((message) => (
													<Card
														key={message.id}
														className="border border-green-200 bg-green-50/30"
													>
														<CardContent className="p-6">
															<div className="flex justify-between items-start">
																<div className="flex-1">
																	<div className="flex items-center space-x-2 mb-2">
																		{getMessageTypeIcon(message.type)}
																		<h3 className="text-lg font-semibold text-gray-900">
																			{message.subject}
																		</h3>
																		<Badge
																			className={getPriorityColor(
																				message.priority
																			)}
																		>
																			{formatPriority(message.priority)}
																		</Badge>
																		<Badge
																			className={getStatusColor(message.status)}
																		>
																			<CheckCircle className="w-3 h-3 mr-1" />
																			{formatStatus(message.status)}
																		</Badge>
																	</div>

																	<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
																		<div className="space-y-2">
																			<div className="flex items-center text-sm text-gray-600">
																				<User className="w-4 h-4 mr-2" />
																				{message.name}
																			</div>
																			<div className="flex items-center text-sm text-gray-600">
																				<Mail className="w-4 h-4 mr-2" />
																				{message.email}
																			</div>
																		</div>

																		<div className="space-y-2">
																			<div className="text-sm">
																				<span className="font-medium text-gray-700">
																					Type:
																				</span>
																				<span className="ml-2">
																					{formatMessageType(message.type)}
																				</span>
																			</div>
																			{message.responded_by_user && (
																				<div className="text-sm">
																					<span className="font-medium text-gray-700">
																						Traité par:
																					</span>
																					<span className="ml-2">
																						{
																							message.responded_by_user
																								.first_name
																						}{" "}
																						{
																							message.responded_by_user
																								.last_name
																						}
																					</span>
																				</div>
																			)}
																		</div>
																	</div>

																	<div className="mb-4 p-4 bg-gray-50 rounded-lg">
																		<p className="text-sm text-gray-700">
																			{message.message}
																		</p>
																	</div>
																</div>
															</div>
														</CardContent>
													</Card>
												))}
											</div>
										) : (
											<div className="text-center py-12">
												<CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
												<h3 className="text-lg font-semibold text-gray-900 mb-2">
													Aucun message résolu
												</h3>
												<p className="text-gray-600">
													Les messages résolus apparaîtront ici
												</p>
											</div>
										)}
									</TabsContent>
								</Tabs>
							</CardContent>
						</Card>
					</motion.div>
				</motion.div>
			</div>
		</div>
	);
}
