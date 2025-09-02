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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Home, User, Mail, Phone, Lock, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function AuthPage() {
	const router = useRouter();
	const { user, loading, error, login, register } = useAuth();
	const [showPassword, setShowPassword] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [authError, setAuthError] = useState("");

	const [loginForm, setLoginForm] = useState({
		email: "",
		password: "",
	});

	const [registerForm, setRegisterForm] = useState({
		firstName: "",
		lastName: "",
		email: "",
		phone: "",
		role: "",
		password: "",
		confirmPassword: "",
	});

	// Rediriger si déjà connecté
	useEffect(() => {
		if (user && !loading) {
			if (user.role === "student") {
				router.push("/dashboard");
			} else router.push("/admin");
		}
	}, [user, loading, router]);

	const handleLogin = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setAuthError("");

		const result = await login(loginForm.email, loginForm.password);

		if (result.success) {
			if (result.user?.role === "admin") {
				router.push("/admin");
			} else {
				router.push("/dashboard");
			}
		} else {
			setAuthError(result.error || "Erreur de connexion");
		}

		setIsSubmitting(false);
	};

	const handleRegister = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);
		setAuthError("");

		if (registerForm.password !== registerForm.confirmPassword) {
			setAuthError("Les mots de passe ne correspondent pas");
			setIsSubmitting(false);
			return;
		}

		const result = await register({
			firstName: registerForm.firstName,
			lastName: registerForm.lastName,
			email: registerForm.email,
			phone: registerForm.phone,
			role: registerForm.role,
			password: registerForm.password,
		});

		if (result.success) {
			if (result.user?.role === "admin") {
				router.push("/admin");
			} else {
				router.push("/dashboard");
			}
		} else {
			setAuthError(result.error || "Erreur lors de l'inscription");
		}

		setIsSubmitting(false);
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 flex items-center justify-center">
				<div className="text-center">
					<div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
					<p className="text-gray-600">Chargement...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-cyan-50 flex items-center justify-center p-4">
			<div className="w-full max-w-md">
				{/* Header */}
				<div className="text-center mb-8">
					<Link href="/" className="inline-flex items-center space-x-3 mb-4">
						<div className="w-18 h-14 rounded-xl flex items-center justify-center">
							<Image
								src="/uadDeukouway.png"
								alt="Logo"
								width={80}
								height={80}
							/>{" "}
						</div>
						<div className="text-left">
							<h1 className="text-2xl font-bold text-gray-900">
								UAD Deukouway
							</h1>
							<p className="text-sm text-gray-500">Logements étudiants</p>
						</div>
					</Link>
				</div>

				<Card className="shadow-xl border-0">
					<CardHeader className="space-y-1 pb-6">
						<CardTitle className="text-2xl text-center">Bienvenue</CardTitle>
						<CardDescription className="text-center">
							Connectez-vous ou créez votre compte
						</CardDescription>
					</CardHeader>
					<CardContent>
						{(authError || error) && (
							<div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
								<p className="text-red-600 text-sm">{authError || error}</p>
							</div>
						)}

						<Tabs defaultValue="login" className="w-full">
							<TabsList className="grid w-full grid-cols-2 mb-6">
								<TabsTrigger value="login">Connexion</TabsTrigger>
								<TabsTrigger value="register">Inscription</TabsTrigger>
							</TabsList>

							<TabsContent value="login" className="space-y-4">
								<form onSubmit={handleLogin} className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="login-email">Email</Label>
										<div className="relative">
											<Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
											<Input
												id="login-email"
												type="email"
												placeholder="votre@email.com"
												value={loginForm.email}
												onChange={(e) =>
													setLoginForm({ ...loginForm, email: e.target.value })
												}
												className="pl-10"
												required
											/>
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="login-password">Mot de passe</Label>
										<div className="relative">
											<Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
											<Input
												id="login-password"
												type={showPassword ? "text" : "password"}
												placeholder="••••••••"
												value={loginForm.password}
												onChange={(e) =>
													setLoginForm({
														...loginForm,
														password: e.target.value,
													})
												}
												className="pl-10 pr-10"
												required
											/>
											<button
												type="button"
												onClick={() => setShowPassword(!showPassword)}
												className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
											>
												{showPassword ? (
													<EyeOff className="h-4 w-4" />
												) : (
													<Eye className="h-4 w-4" />
												)}
											</button>
										</div>
									</div>

									<Button
										type="submit"
										className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
										disabled={isSubmitting}
									>
										{isSubmitting ? "Connexion..." : "Se connecter"}
									</Button>
								</form>
							</TabsContent>

							<TabsContent value="register" className="space-y-4">
								<form onSubmit={handleRegister} className="space-y-4">
									<div className="grid grid-cols-2 gap-4">
										<div className="space-y-2">
											<Label htmlFor="firstName">Prénom</Label>
											<Input
												id="firstName"
												placeholder="Prénom"
												value={registerForm.firstName}
												onChange={(e) =>
													setRegisterForm({
														...registerForm,
														firstName: e.target.value,
													})
												}
												required
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="lastName">Nom</Label>
											<Input
												id="lastName"
												placeholder="Nom"
												value={registerForm.lastName}
												onChange={(e) =>
													setRegisterForm({
														...registerForm,
														lastName: e.target.value,
													})
												}
												required
											/>
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="email">Email</Label>
										<div className="relative">
											<Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
											<Input
												id="email"
												type="email"
												placeholder="votre@email.com"
												value={registerForm.email}
												onChange={(e) =>
													setRegisterForm({
														...registerForm,
														email: e.target.value,
													})
												}
												className="pl-10"
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
												placeholder="+221 70 123 45 67"
												value={registerForm.phone}
												onChange={(e) =>
													setRegisterForm({
														...registerForm,
														phone: e.target.value,
													})
												}
												className="pl-10"
												required
											/>
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="role">Vous êtes</Label>
										<Select
											value={registerForm.role}
											onValueChange={(value) =>
												setRegisterForm({ ...registerForm, role: value })
											}
										>
											<SelectTrigger>
												<SelectValue placeholder="Sélectionnez votre statut" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="student">Étudiant</SelectItem>
												<SelectItem value="landlord">
													Propriétaire/Bailleur
												</SelectItem>
											</SelectContent>
										</Select>
									</div>

									<div className="space-y-2">
										<Label htmlFor="password">Mot de passe</Label>
										<div className="relative">
											<Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
											<Input
												id="password"
												type={showPassword ? "text" : "password"}
												placeholder="••••••••"
												value={registerForm.password}
												onChange={(e) =>
													setRegisterForm({
														...registerForm,
														password: e.target.value,
													})
												}
												className="pl-10 pr-10"
												required
											/>
											<button
												type="button"
												onClick={() => setShowPassword(!showPassword)}
												className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
											>
												{showPassword ? (
													<EyeOff className="h-4 w-4" />
												) : (
													<Eye className="h-4 w-4" />
												)}
											</button>
										</div>
									</div>

									<div className="space-y-2">
										<Label htmlFor="confirmPassword">
											Confirmer le mot de passe
										</Label>
										<div className="relative">
											<Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
											<Input
												id="confirmPassword"
												type="password"
												placeholder="••••••••"
												value={registerForm.confirmPassword}
												onChange={(e) =>
													setRegisterForm({
														...registerForm,
														confirmPassword: e.target.value,
													})
												}
												className="pl-10"
												required
											/>
										</div>
									</div>

									<Button
										type="submit"
										className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
										disabled={isSubmitting}
									>
										{isSubmitting ? "Inscription..." : "Créer mon compte"}
									</Button>
								</form>
							</TabsContent>
						</Tabs>
					</CardContent>
				</Card>

				<div className="text-center mt-6">
					<Link
						href="/"
						className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
					>
						← Retour à l'accueil
					</Link>
				</div>
			</div>
		</div>
	);
}
