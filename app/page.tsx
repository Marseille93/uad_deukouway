"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
	Home as HomeIcon,
	Users,
	Shield,
	ArrowRight,
	CheckCircle,
	Zap,
	Target,
	Coffee,
	BookOpen,
	Heart,
	Search,
	Plus,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { motion } from "framer-motion";

const features = [
	{
		icon: Users,
		title: "Communauté Étudiante",
		description:
			"Connecte-toi avec d'autres étudiants de l'UAD pour des colocations",
		color: "text-blue-600",
	},
	{
		icon: Zap,
		title: "Recherche Rapide",
		description: "Trouve ton logement idéal en quelques clics avec nos filtres",
		color: "text-purple-600",
	},
	{
		icon: Target,
		title: "Adapté aux Étudiants",
		description:
			"Une plateforme pensée spécialement pour les besoins étudiants",
		color: "text-orange-600",
	},
	{
		icon: Heart,
		title: "Entraide",
		description: "Une communauté solidaire qui s'entraide pour le logement",
		color: "text-red-600",
	},
];

const testimonials = [
	{
		name: "Aminata D.",
		role: "Master 2 Informatique",
		content: "Enfin une plateforme qui comprend nos besoins d'étudiants !",
		rating: 5,
	},
	{
		name: "Moussa K.",
		role: "Licence 3 Gestion",
		content: "Interface simple et efficace. Parfait pour nous !",
		rating: 5,
	},
	{
		name: "Fatou S.",
		role: "Master 1 Économie",
		content: "Une vraie solution pour les étudiants de Bambey.",
		rating: 5,
	},
];

// Exemples d'annonces pour la section preview
const sampleListings = [
	{
		id: "1",
		title: "Chambre en colocation - Près du campus 2",
		type: "Chambre",
		mode: "Colocation",
		location: "Près du Campus 2, Bambey",
		availableSpots: 2,
		totalSpots: 4,
		image:
			"https://www.villard-bonnot.fr/uploads/Image/85/7392_698_Demander-un-logement.png",
	},
	{
		id: "2",
		title: "Appartement T2 à coté du Stade",
		type: "Appartement",
		mode: "Location classique",
		location: "Thialy, Bambey",
		image:
			"https://www.alsace.eu/media/8851/cea-logement.png?width=763&quality=75",
	},
	{
		id: "3",
		title: "Recherche de colocataires pour une chambre spacieuse",
		type: "Chambre",
		mode: "Colocation",
		location: "Campus 2 universitaire, Bambey",
		availableSpots: 3,
		totalSpots: 4,
		image:
			"https://montpellier.esnfrance.org/wp-content/uploads/sites/16/2023/11/maison-appartement-logement.png",
	},
];

export default function HomePage() {
	const { user } = useAuth();
	const [currentTestimonial, setCurrentTestimonial] = useState(0);

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
		}, 4000);
		return () => clearInterval(interval);
	}, []);

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

	const floatingVariants = {
		animate: {
			y: [-10, 10, -10],
			transition: {
				duration: 3,
				repeat: Infinity,
				ease: "easeInOut",
			},
		},
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50">
			{/* Header */}
			<header className="bg-white/80 backdrop-blur-md shadow-sm border-b sticky top-0 z-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="flex justify-between items-center h-16">
						<motion.div
							className="flex items-center space-x-3"
							initial={{ x: -20, opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							transition={{ duration: 0.5 }}
						>
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
								<p className="text-xs text-gray-500">Logements étudiants</p>
							</div>
						</motion.div>
						<motion.div
							className="flex items-center space-x-4"
							initial={{ x: 20, opacity: 0 }}
							animate={{ x: 0, opacity: 1 }}
							transition={{ duration: 0.5, delay: 0.2 }}
						>
							{user ? (
								<div className="flex items-center space-x-3">
									<span className="text-sm text-gray-700 hidden sm:block">
										{user.firstName} {user.lastName}
									</span>
									<Link href={user.role === "admin" ? "/admin" : "/dashboard"}>
										<Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
											Mon espace
										</Button>
									</Link>
								</div>
							) : (
								<Link href="/auth">
									<Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700">
										Se connecter
									</Button>
								</Link>
							)}
						</motion.div>
					</div>
				</div>
			</header>

			{/* Hero Section */}
			<section className="relative py-12 sm:py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
				<div className="max-w-6xl mx-auto">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
						<motion.div
							variants={containerVariants}
							initial="hidden"
							animate="visible"
							className="text-center lg:text-left"
						>
							<motion.div variants={itemVariants}>
								<Badge className="mb-4 bg-blue-100 text-blue-800 hover:bg-blue-100">
									<Zap className="w-3 h-3 mr-1" />
									Nouveau sur Bambey !
								</Badge>
							</motion.div>

							<motion.h1
								variants={itemVariants}
								className="text-3xl sm:text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight"
							>
								Trouve ton
								<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
									{" "}
									logement idéal
								</span>
								<br />à Bambey
							</motion.h1>

							<motion.p
								variants={itemVariants}
								className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed"
							>
								La première plateforme dédiée aux étudiants de l'UAD. Trouve ta
								chambre, ta colocation ou publie ton annonce en toute
								simplicité.
							</motion.p>

							<motion.div
								variants={itemVariants}
								className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
							>
								<Link href="/auth">
									<Button
										size="lg"
										className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-8 py-6"
									>
										<Search className="w-5 h-5 mr-2" />
										Commencer ma recherche
									</Button>
								</Link>
								<Link href="/auth">
									<Button
										size="lg"
										variant="outline"
										className="w-full sm:w-auto text-lg px-8 py-6 border-2"
									>
										<Plus className="w-5 h-5 mr-2" />
										Publier une annonce
									</Button>
								</Link>
							</motion.div>
						</motion.div>

						<motion.div
							variants={floatingVariants}
							animate="animate"
							className="relative mt-8 lg:mt-0 ml-8"
						>
							<div className="relative">
								<motion.div
									initial={{ scale: 0.8, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									transition={{ duration: 0.8, delay: 0.3 }}
									className="bg-white rounded-2xl shadow-2xl p-4 sm:p-6 transform rotate-3"
								>
									<img
										src="https://www.villard-bonnot.fr/uploads/Image/85/7392_698_Demander-un-logement.png"
										alt="Logement étudiant"
										className="w-full h-48 sm:h-64 object-cover rounded-xl mb-4"
									/>
									<div className="space-y-2">
										<h3 className="font-semibold text-gray-900">
											Chambre en colocation
										</h3>
										<div className="flex items-center text-sm text-gray-600">
											<Users className="w-4 h-4 mr-1" />
											Près du Campus 2
										</div>
										<div className="flex justify-between items-center">
											<span className="text-sm text-gray-600">
												Disponible maintenant
											</span>
											<Badge className="bg-green-100 text-green-800">
												2 places libres
											</Badge>
										</div>
									</div>
								</motion.div>

								<motion.div
									initial={{ scale: 0.8, opacity: 0 }}
									animate={{ scale: 1, opacity: 1 }}
									transition={{ duration: 0.8, delay: 0.6 }}
									className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-xl p-3 sm:p-4 transform -rotate-6"
								>
									<div className="flex items-center space-x-2">
										<div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
											<CheckCircle className="w-5 h-5 text-green-600" />
										</div>
										<div>
											<p className="text-sm font-medium text-gray-900">
												Communauté
											</p>
											<p className="text-xs text-gray-500">Étudiants UAD</p>
										</div>
									</div>
								</motion.div>
							</div>
						</motion.div>
					</div>
				</div>

				{/* Background decorations */}
				<div className="absolute top-20 left-4 sm:left-10 w-16 sm:w-20 h-16 sm:h-20 bg-blue-200 rounded-full opacity-20 animate-pulse"></div>
				<div className="absolute bottom-20 right-4 sm:right-10 w-24 sm:w-32 h-24 sm:h-32 bg-indigo-200 rounded-full opacity-20 animate-pulse"></div>
			</section>

			{/* Sample Listings Section */}
			<section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white">
				<div className="max-w-6xl mx-auto">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						viewport={{ once: true }}
						className="text-center mb-12"
					>
						<h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
							Découvre quelques{" "}
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
								logements disponibles
							</span>
						</h2>
						<p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
							Voici un aperçu des types de logements que tu peux trouver sur
							notre plateforme
						</p>
					</motion.div>

					<motion.div
						variants={containerVariants}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
						className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12"
					>
						{sampleListings.slice(0, 5).map((listing, index) => (
							<motion.div
								key={listing.id}
								variants={itemVariants}
								whileHover={{ y: -5, scale: 1.02 }}
								transition={{ duration: 0.2 }}
								className={
									index === 4
										? "sm:col-span-2 lg:col-span-1 lg:col-start-2"
										: ""
								}
							>
								<Card className="h-full shadow-lg border-0 hover:shadow-xl transition-all duration-300 overflow-hidden">
									<div className="relative">
										<img
											src={listing.image}
											alt={listing.title}
											className="w-full h-48 object-cover"
										/>
										<div className="absolute top-3 left-3">
											<Badge className="bg-white/90 text-gray-800 hover:bg-white">
												{listing.type}
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
										<h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
											{listing.title}
										</h3>
										<div className="flex items-center text-sm text-gray-600 mb-3">
											<Users className="w-4 h-4 mr-1" />
											{listing.location}
										</div>
										<div className="flex items-center justify-between">
											<Badge
												variant={
													listing.mode === "Colocation"
														? "secondary"
														: "default"
												}
											>
												{listing.mode}
											</Badge>
											<span className="text-sm text-blue-600 font-medium">
												Disponible
											</span>
										</div>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						viewport={{ once: true }}
						className="text-center"
					>
						<Link href="/auth">
							<Button
								size="lg"
								className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-lg px-8 py-4"
							>
								Voir toutes les annonces
								<ArrowRight className="w-5 h-5 ml-2" />
							</Button>
						</Link>
					</motion.div>
				</div>
			</section>

			{/* Features Section */}
			<section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
				<div className="max-w-6xl mx-auto">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						viewport={{ once: true }}
						className="text-center mb-12 sm:mb-16"
					>
						<h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
							Pourquoi choisir{" "}
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
								UAD Deukouway
							</span>{" "}
							?
						</h2>
						<p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
							Une plateforme pensée par et pour les étudiants de l'Université
							Alioune Diop de Bambey
						</p>
					</motion.div>

					<motion.div
						variants={containerVariants}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
						className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8"
					>
						{features.map((feature, index) => (
							<motion.div
								key={index}
								variants={itemVariants}
								whileHover={{ y: -5, scale: 1.02 }}
								transition={{ duration: 0.2 }}
							>
								<Card className="h-full shadow-lg border-0 hover:shadow-xl transition-all duration-300">
									<CardContent className="p-4 sm:p-6 text-center">
										<div
											className={`w-12 sm:w-16 h-12 sm:h-16 mx-auto mb-4 rounded-full bg-gray-50 flex items-center justify-center ${feature.color}`}
										>
											<feature.icon className="w-6 sm:w-8 h-6 sm:h-8" />
										</div>
										<h3 className="text-lg font-semibold text-gray-900 mb-3">
											{feature.title}
										</h3>
										<p className="text-gray-600 leading-relaxed text-sm sm:text-base">
											{feature.description}
										</p>
									</CardContent>
								</Card>
							</motion.div>
						))}
					</motion.div>
				</div>
			</section>

			{/* Student-focused Section */}
			<section className="py-12 sm:py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
						<motion.div
							initial={{ x: -50, opacity: 0 }}
							whileInView={{ x: 0, opacity: 1 }}
							transition={{ duration: 0.8 }}
							viewport={{ once: true }}
						>
							<div className="flex items-center mb-6">
								<div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
									<BookOpen className="w-6 h-6" />
								</div>
								<Badge className="bg-white/20 text-white hover:bg-white/20">
									Développé par un étudiant
								</Badge>
							</div>

							<h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">
								D'étudiant à étudiant,
								<br />
								nous comprenons tes besoins
							</h2>

							<p className="text-lg sm:text-xl text-blue-100 mb-8 leading-relaxed">
								Ce projet est né de l'expérience d'un étudiant qui a galéré pour
								trouver un logement décent à Bambey. Aujourd'hui, nous
								facilitons cette recherche pour toute la communauté étudiante de
								l'UAD.
							</p>

							<div className="space-y-4">
								<div className="flex items-center">
									<CheckCircle className="w-5 h-5 mr-3 text-green-300 flex-shrink-0" />
									<span className="text-sm sm:text-base">
										Comprend les contraintes budgétaires étudiantes
									</span>
								</div>
								<div className="flex items-center">
									<CheckCircle className="w-5 h-5 mr-3 text-green-300 flex-shrink-0" />
									<span className="text-sm sm:text-base">
										Interface simple et intuitive
									</span>
								</div>
								<div className="flex items-center">
									<CheckCircle className="w-5 h-5 mr-3 text-green-300 flex-shrink-0" />
									<span className="text-sm sm:text-base">
										Communauté bienveillante et solidaire
									</span>
								</div>
							</div>
						</motion.div>

						<motion.div
							initial={{ x: 50, opacity: 0 }}
							whileInView={{ x: 0, opacity: 1 }}
							transition={{ duration: 0.8 }}
							viewport={{ once: true }}
							className="relative"
						>
							<div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 sm:p-8">
								<div className="flex items-center mb-6">
									<div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mr-4">
										<Coffee className="w-6 h-6 text-blue-600" />
									</div>
									<div>
										<h3 className="font-semibold">Créé avec passion</h3>
										<p className="text-blue-100 text-sm">
											Par un étudiant de l'UAD
										</p>
									</div>
								</div>

								<blockquote className="text-base sm:text-lg italic text-blue-100 mb-4">
									"J'ai créé cette plateforme parce que je sais à quel point il
									peut être difficile de trouver un logement décent quand on est
									étudiant. Mon objectif : simplifier cette recherche pour tous
									mes camarades."
								</blockquote>

								<div className="flex items-center">
									<div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
										<span className="text-blue-600 font-bold">M</span>
									</div>
									<div>
										<p className="font-medium">Seydina Ibrahima DIENG</p>
										<p className="text-blue-200 text-sm">
											Fondateur & Étudiant UAD
										</p>
									</div>
								</div>
							</div>
						</motion.div>
					</div>
				</div>
			</section>

			{/* How it works */}
			<section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8">
				<div className="max-w-6xl mx-auto">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						viewport={{ once: true }}
						className="text-center mb-12 sm:mb-16"
					>
						<h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
							Comment ça marche ?
						</h2>
						<p className="text-lg sm:text-xl text-gray-600">
							Trois étapes simples pour trouver ou proposer un logement
						</p>
					</motion.div>

					<div className="space-y-16 lg:space-y-24">
						{[
							{
								step: "1",
								title: "Inscris-toi gratuitement",
								description: "Crée ton compte étudiant en quelques secondes",
								icon: Users,
								color: "from-blue-500 to-blue-600",
								screenshot: "/deukouwayRegister.png",
							},
							{
								step: "2",
								title: "Explore les annonces",
								description:
									"Utilise nos filtres pour trouver le logement qui correspond à tes critères",
								icon: Search,
								color: "from-indigo-500 to-indigo-600",
								screenshot: "/deukouwayOffers.png",
							},
							{
								step: "3",
								title: "Contacte directement",
								description:
									"Échange avec les propriétaires via WhatsApp ou téléphone",
								icon: Heart,
								color: "from-purple-500 to-purple-600",
								screenshot: "/deukouwayContact.png",
							},
						].map((step, index) => (
							<motion.div
								key={index}
								initial={{
									x: index % 2 === 0 ? -100 : 100,
									opacity: 0,
								}}
								whileInView={{ x: 0, opacity: 1 }}
								transition={{ duration: 0.6, delay: index * 0.2 }}
								viewport={{ once: true }}
								className={`grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center ${
									index % 2 === 1 ? "lg:grid-flow-col-dense" : ""
								}`}
							>
								{/* iPhone Mockup */}
								<div
									className={`mockup-phone border-primary scale-75 mx-auto ${
										index % 2 === 1 ? "lg:col-start-2" : ""
									}`}
								>
									<div className="mockup-phone-camera"></div>
									<div className="mockup-phone-display">
										<div className="relative w-full h-full bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center pt-16">
											<div className="">
												<img
													alt={`Screenshot étape ${step.step}`}
													src={step.screenshot}
													className="w-full h-full object-cover"
												/>
											</div>
										</div>
									</div>
								</div>

								{/* Content */}
								<div
									className={`text-center lg:text-left ${
										index % 2 === 1 ? "lg:col-start-1" : ""
									}`}
								>
									<div className="flex items-center justify-center mb-4">
										<step.icon className="w-6 h-6 text-gray-600 mr-2" />
										<div
											className={`w-8 h-8 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-white text-sm font-bold`}
										>
											{step.step}
										</div>
									</div>
									<h3 className="text-xl lg:text-2xl font-semibold text-gray-900 mb-4">
										{step.title}
									</h3>
									<p className="text-gray-600 leading-relaxed text-base lg:text-lg max-w-md mx-auto lg:mx-0">
										{step.description}
									</p>
								</div>
							</motion.div>
						))}
					</div>
				</div>
			</section>

			{/* Testimonials */}
			<section className="py-12 sm:py-20 bg-gray-50">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						viewport={{ once: true }}
						className="text-center mb-12 sm:mb-16"
					>
						<h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-4">
							Ce que disent nos étudiants
						</h2>
						<p className="text-lg sm:text-xl text-gray-600">
							Rejoins une communauté d'étudiants satisfaits
						</p>
					</motion.div>

					<motion.div
						key={currentTestimonial}
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						exit={{ opacity: 0, x: -20 }}
						transition={{ duration: 0.5 }}
						className="relative"
					>
						<Card className="shadow-xl border-0">
							<CardContent className="p-6 sm:p-8 text-center">
								<div className="flex justify-center mb-4">
									{[...Array(testimonials[currentTestimonial].rating)].map(
										(_, i) => (
											<Heart
												key={i}
												className="w-4 sm:w-5 h-4 sm:h-5 text-red-400 fill-current"
											/>
										)
									)}
								</div>

								<blockquote className="text-lg sm:text-xl text-gray-700 mb-6 italic leading-relaxed">
									"{testimonials[currentTestimonial].content}"
								</blockquote>

								<div className="flex items-center justify-center">
									<div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
										<span className="text-blue-600 font-bold">
											{testimonials[currentTestimonial].name[0]}
										</span>
									</div>
									<div>
										<p className="font-semibold text-gray-900">
											{testimonials[currentTestimonial].name}
										</p>
										<p className="text-gray-600 text-sm sm:text-base">
											{testimonials[currentTestimonial].role}
										</p>
									</div>
								</div>
							</CardContent>
						</Card>
					</motion.div>

					<div className="flex justify-center mt-8 space-x-2">
						{testimonials.map((_, index) => (
							<button
								key={index}
								onClick={() => setCurrentTestimonial(index)}
								className={`w-3 h-3 rounded-full transition-all ${
									index === currentTestimonial ? "bg-blue-600" : "bg-gray-300"
								}`}
							/>
						))}
					</div>
				</div>
			</section>

			{/* CTA Section */}
			<section className="py-12 sm:py-20 bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
				<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.6 }}
						viewport={{ once: true }}
					>
						<h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6">
							Prêt à trouver ton logement idéal ?
						</h2>
						<p className="text-lg sm:text-xl text-blue-100 mb-8 leading-relaxed">
							Rejoins dès maintenant la communauté UAD Deukouway et découvre des
							logements adaptés aux étudiants près de ton campus.
						</p>

						<motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
							<Link href="/auth">
								<Button
									size="md"
									className="bg-white text-blue-600 hover:bg-gray-100 text-sm px-8 sm:px-12 py-6 shadow-xl"
								>
									<Users className="w-5 h-5 mr-2" />
									Commencer maintenant - C'est gratuit !
								</Button>
							</Link>
						</motion.div>

						<p className="text-blue-200 text-sm mt-4">
							✨ Inscription gratuite • ⚡ Accès immédiat • 🔒 100% sécurisé
						</p>
					</motion.div>
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-white border-t">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
					<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
						<div className="sm:col-span-2">
							<div className="flex items-center space-x-3 mb-4">
								<div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
									<HomeIcon className="w-6 h-6 text-white" />
								</div>
								<div>
									<h3 className="text-lg font-bold text-gray-900">
										UAD Deukouway
									</h3>
									<p className="text-sm text-gray-500">Logements étudiants</p>
								</div>
							</div>
							<p className="text-gray-600 mb-4 text-sm sm:text-base">
								La plateforme de référence pour les logements étudiants à
								Bambey. Créée par un étudiant, pour les étudiants de l'UAD.
							</p>
							<div className="flex flex-wrap gap-2">
								<Badge variant="outline">🎓 100% Étudiant</Badge>
								<Badge variant="outline">🔒 Sécurisé</Badge>
								<Badge variant="outline">⚡ Gratuit</Badge>
							</div>
						</div>

						<div>
							<h4 className="font-semibold text-gray-900 mb-4">
								Liens rapides
							</h4>
							<div className="space-y-2">
								<Link
									href="/auth"
									className="block text-gray-600 hover:text-blue-600 transition-colors text-sm sm:text-base"
								>
									Rechercher
								</Link>
								<Link
									href="/auth"
									className="block text-gray-600 hover:text-blue-600 transition-colors text-sm sm:text-base"
								>
									Publier
								</Link>
								<Link
									href="/auth"
									className="block text-gray-600 hover:text-blue-600 transition-colors text-sm sm:text-base"
								>
									Mon compte
								</Link>
							</div>
						</div>

						<div>
							<h4 className="font-semibold text-gray-900 mb-4">Contact</h4>
							<div className="space-y-2 text-gray-600 text-sm sm:text-base">
								<p>Université Alioune Diop</p>
								<p>Bambey, Sénégal</p>
								<p>seydinaibrahima.dieng@uad.edu.sn</p>
							</div>
						</div>
					</div>

					<div className="border-t mt-8 pt-8 text-center text-gray-500">
						<p className="text-sm sm:text-base">
							&copy; 2025 UAD Deukouway. Développé par ALGO FALICE un étudiant
							de l'UADB pour les étudiants de l'UADB.
						</p>
					</div>
				</div>
			</footer>
		</div>
	);
}
