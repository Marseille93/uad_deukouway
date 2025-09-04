"use client";

import { useState } from "react";
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
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
	Home,
	ArrowLeft,
	Bug,
	Lightbulb,
	MessageSquare,
	Send,
	CheckCircle,
	AlertTriangle,
	Mail,
	Phone,
	Clock,
	User,
	Loader2,
} from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function ContactAdminPage() {
	const [formData, setFormData] = useState({
		name: "",
		email: "",
		subject: "",
		type: "",
		priority: "",
		message: "",
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [submitSuccess, setSubmitSuccess] = useState(false);
	const [submitError, setSubmitError] = useState("");

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setSubmitError("");

		try {
			const response = await fetch("/api/admin/messages", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: formData.name,
					email: formData.email,
					subject: formData.subject,
					message: formData.message,
					type: formData.type,
					priority: formData.priority || "medium",
				}),
			});

			if (response.ok) {
				setSubmitSuccess(true);
				setFormData({
					name: "",
					email: "",
					subject: "",
					type: "",
					priority: "",
					message: "",
				});

				setTimeout(() => setSubmitSuccess(false), 5000);
			} else {
				const data = await response.json();
				setSubmitError(data.error || "Erreur lors de l'envoi du message");
			}
		} catch (error) {
			setSubmitError("Erreur de connexion");
		} finally {
			setIsSubmitting(false);
		}
	};

	const getTypeIcon = (type: string) => {
		switch (type) {
			case "bug":
				return <Bug className="w-4 h-4" />;
			case "suggestion":
				return <Lightbulb className="w-4 h-4" />;
			case "question":
				return <MessageSquare className="w-4 h-4" />;
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
						<Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
							<MessageSquare className="w-3 h-3 mr-1" />
							Contact Admin
						</Badge>
					</div>
				</div>
			</header>

			<div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
				<motion.div
					variants={containerVariants}
					initial="hidden"
					animate="visible"
					className="space-y-8"
				>
					{/* Hero Section */}
					<motion.div variants={itemVariants} className="text-center">
						<div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
							<MessageSquare className="w-10 h-10 text-white" />
						</div>
						<h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
							Contactez l'Administration
						</h1>
						<p className="text-lg text-gray-600 max-w-2xl mx-auto">
							Signalez un bug, proposez une amélioration ou posez une question.
							Nous sommes là pour améliorer votre expérience sur UAD Deukouway.
						</p>
					</motion.div>

					{/* Quick Info Cards */}
					<motion.div variants={itemVariants}>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
							<Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300">
								<CardContent className="p-6 text-center">
									<div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
										<Bug className="w-6 h-6 text-red-600" />
									</div>
									<h3 className="font-semibold text-gray-900 mb-2">
										Signaler un Bug
									</h3>
									<p className="text-sm text-gray-600">
										Un problème technique ? Aidez-nous à l'identifier et le
										corriger rapidement.
									</p>
								</CardContent>
							</Card>

							<Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300">
								<CardContent className="p-6 text-center">
									<div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
										<Lightbulb className="w-6 h-6 text-yellow-600" />
									</div>
									<h3 className="font-semibold text-gray-900 mb-2">
										Suggérer une Amélioration
									</h3>
									<p className="text-sm text-gray-600">
										Une idée pour améliorer la plateforme ? Partagez-la avec
										nous !
									</p>
								</CardContent>
							</Card>

							<Card className="shadow-lg border-0 hover:shadow-xl transition-all duration-300">
								<CardContent className="p-6 text-center">
									<div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
										<MessageSquare className="w-6 h-6 text-blue-600" />
									</div>
									<h3 className="font-semibold text-gray-900 mb-2">
										Poser une Question
									</h3>
									<p className="text-sm text-gray-600">
										Besoin d'aide ou d'informations ? Nous sommes là pour vous
										répondre.
									</p>
								</CardContent>
							</Card>
						</div>
					</motion.div>

					{/* Contact Form */}
					<motion.div variants={itemVariants}>
						<Card className="shadow-xl border-0">
							<CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
								<CardTitle className="text-xl flex items-center">
									<Send className="w-5 h-5 mr-2" />
									Envoyer un message
								</CardTitle>
								<CardDescription className="text-blue-100">
									Remplissez le formulaire ci-dessous pour nous contacter
								</CardDescription>
							</CardHeader>
							<CardContent className="p-6 sm:p-8">
								{submitSuccess && (
									<motion.div
										initial={{ opacity: 0, y: -10 }}
										animate={{ opacity: 1, y: 0 }}
										className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg"
									>
										<div className="flex items-center">
											<CheckCircle className="w-5 h-5 text-green-600 mr-2" />
											<div>
												<p className="text-green-700 font-medium">
													Message envoyé avec succès !
												</p>
												<p className="text-green-600 text-sm">
													Nous vous répondrons dans les plus brefs délais.
												</p>
											</div>
										</div>
									</motion.div>
								)}

								{submitError && (
									<div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
										<div className="flex items-center">
											<AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
											<p className="text-red-600">{submitError}</p>
										</div>
									</div>
								)}

								<form onSubmit={handleSubmit} className="space-y-6">
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
										<div className="space-y-2">
											<Label htmlFor="name">Nom complet *</Label>
											<div className="relative">
												<User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
												<Input
													id="name"
													value={formData.name}
													onChange={(e) =>
														setFormData({ ...formData, name: e.target.value })
													}
													className="pl-10 focus:ring-2 focus:ring-blue-500"
													placeholder="Votre nom complet"
													required
												/>
											</div>
										</div>

										<div className="space-y-2">
											<Label htmlFor="email">Email *</Label>
											<div className="relative">
												<Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
												<Input
													id="email"
													type="email"
													value={formData.email}
													onChange={(e) =>
														setFormData({ ...formData, email: e.target.value })
													}
													className="pl-10 focus:ring-2 focus:ring-blue-500"
													placeholder="votre@email.com"
													required
												/>
											</div>
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="subject">Sujet *</Label>
										<Input
											id="subject"
											value={formData.subject}
											onChange={(e) =>
												setFormData({ ...formData, subject: e.target.value })
											}
											className="focus:ring-2 focus:ring-blue-500"
											placeholder="Résumé de votre message"
											required
										/>
									</div>

									<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
										<div className="space-y-2">
											<Label>Type de message *</Label>
											<Select
												value={formData.type}
												onValueChange={(value) =>
													setFormData({ ...formData, type: value })
												}
											>
												<SelectTrigger className="focus:ring-2 focus:ring-blue-500">
													<SelectValue placeholder="Sélectionnez le type" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="bug">
														<div className="flex items-center">
															<Bug className="w-4 h-4 mr-2 text-red-600" />
															Signaler un bug
														</div>
													</SelectItem>
													<SelectItem value="suggestion">
														<div className="flex items-center">
															<Lightbulb className="w-4 h-4 mr-2 text-yellow-600" />
															Suggestion d'amélioration
														</div>
													</SelectItem>
													<SelectItem value="question">
														<div className="flex items-center">
															<MessageSquare className="w-4 h-4 mr-2 text-blue-600" />
															Question générale
														</div>
													</SelectItem>
												</SelectContent>
											</Select>
										</div>

										<div className="space-y-2">
											<Label>Priorité</Label>
											<Select
												value={formData.priority}
												onValueChange={(value) =>
													setFormData({ ...formData, priority: value })
												}
											>
												<SelectTrigger className="focus:ring-2 focus:ring-blue-500">
													<SelectValue placeholder="Niveau de priorité" />
												</SelectTrigger>
												<SelectContent>
													<SelectItem value="low">
														<Badge className="bg-green-100 text-green-800 hover:bg-green-100">
															Faible
														</Badge>
													</SelectItem>
													<SelectItem value="medium">
														<Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
															Moyenne
														</Badge>
													</SelectItem>
													<SelectItem value="high">
														<Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
															Élevée
														</Badge>
													</SelectItem>
													<SelectItem value="urgent">
														<Badge className="bg-red-100 text-red-800 hover:bg-red-100">
															Urgente
														</Badge>
													</SelectItem>
												</SelectContent>
											</Select>
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="message">Message détaillé *</Label>
										<Textarea
											id="message"
											value={formData.message}
											onChange={(e) =>
												setFormData({ ...formData, message: e.target.value })
											}
											className="focus:ring-2 focus:ring-blue-500 min-h-[120px]"
											placeholder="Décrivez votre problème, suggestion ou question en détail..."
											required
										/>
										<p className="text-xs text-gray-500">
											Plus vous donnez de détails, plus nous pourrons vous aider
											efficacement.
										</p>
									</div>

									{/* Preview */}
									{formData.type && (
										<div className="p-4 bg-gray-50 rounded-lg border">
											<h4 className="font-medium text-gray-900 mb-2 flex items-center">
												{getTypeIcon(formData.type)}
												<span className="ml-2">Aperçu de votre message</span>
											</h4>
											<div className="space-y-2 text-sm">
												<div className="flex items-center space-x-2">
													<span className="font-medium">Type:</span>
													<Badge variant="outline">
														{formData.type === "bug"
															? "Bug"
															: formData.type === "suggestion"
															? "Suggestion"
															: "Question"}
													</Badge>
													{formData.priority && (
														<Badge
															className={getPriorityColor(formData.priority)}
														>
															{formData.priority === "low"
																? "Faible"
																: formData.priority === "medium"
																? "Moyenne"
																: formData.priority === "high"
																? "Élevée"
																: "Urgente"}
														</Badge>
													)}
												</div>
												{formData.subject && (
													<div>
														<span className="font-medium">Sujet:</span>{" "}
														{formData.subject}
													</div>
												)}
											</div>
										</div>
									)}

									<div className="flex justify-end pt-4">
										<Button
											type="submit"
											className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 px-8"
											disabled={isSubmitting}
										>
											{isSubmitting ? (
												<>
													<Loader2 className="w-4 h-4 mr-2 animate-spin" />
													Envoi en cours...
												</>
											) : (
												<>
													<Send className="w-4 h-4 mr-2" />
													Envoyer le message
												</>
											)}
										</Button>
									</div>
								</form>
							</CardContent>
						</Card>
					</motion.div>

					{/* Contact Info */}
					<motion.div variants={itemVariants}>
						<Card className="shadow-lg border-0">
							<CardContent className="p-6">
								<h3 className="font-semibold text-gray-900 mb-4 flex items-center">
									<Phone className="w-5 h-5 mr-2 text-blue-600" />
									Autres moyens de contact
								</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div className="space-y-3">
										<div className="flex items-center text-gray-600">
											<Mail className="w-4 h-4 mr-3 text-blue-600" />
											<div>
												<p className="font-medium">Email direct</p>
												<p className="text-sm">
													seydinaibrahima.dieng@uadb.edu.sn
												</p>
											</div>
										</div>
										<div className="flex items-center text-gray-600">
											<Phone className="w-4 h-4 mr-3 text-green-600" />
											<div>
												<p className="font-medium">WhatsApp</p>
												<p className="text-sm">+221 76 269 07 19</p>
											</div>
										</div>
									</div>
									<div className="space-y-3">
										<div className="flex items-center text-gray-600">
											<Clock className="w-4 h-4 mr-3 text-orange-600" />
											<div>
												<p className="font-medium">Temps de réponse</p>
												<p className="text-sm">24-48h en moyenne</p>
											</div>
										</div>
										<div className="flex items-center text-gray-600">
											<AlertTriangle className="w-4 h-4 mr-3 text-red-600" />
											<div>
												<p className="font-medium">Urgences</p>
												<p className="text-sm">Réponse sous 2-4h</p>
											</div>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					</motion.div>
				</motion.div>
			</div>
		</div>
	);
}
