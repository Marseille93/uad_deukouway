import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: NextRequest) {
	try {
		// Vérifier l'authentification
		const token = request.cookies.get("auth-token")?.value;

		if (!token) {
			return NextResponse.json(
				{ error: "Authentification requise" },
				{ status: 401 }
			);
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
			userId: string;
		};

		// Vérifier que l'utilisateur est admin
		const { data: user, error: userError } = await supabaseAdmin
			.from("users")
			.select("role")
			.eq("id", decoded.userId)
			.single();

		if (userError || !user || user.role !== "admin") {
			return NextResponse.json(
				{ error: "Accès non autorisé" },
				{ status: 403 }
			);
		}

		// Récupérer tous les messages avec les informations des utilisateurs
		const { data: messages, error } = await supabaseAdmin
			.from("admin_messages")
			.select(
				`
        *,
        users!admin_messages_user_id_fkey (
          first_name,
          last_name,
          email
        ),
        responded_by_user:users!admin_messages_responded_by_fkey (
          first_name,
          last_name
        )
      `
			)
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Erreur récupération messages admin:", error);
			return NextResponse.json(
				{ error: "Erreur lors de la récupération des messages" },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			messages: messages || [],
		});
	} catch (error) {
		console.error("Erreur API admin messages:", error);

		if (error instanceof jwt.JsonWebTokenError) {
			return NextResponse.json({ error: "Token invalide" }, { status: 401 });
		}

		return NextResponse.json(
			{ error: "Erreur interne du serveur" },
			{ status: 500 }
		);
	}
}

export async function POST(request: NextRequest) {
	try {
		const { name, email, subject, message, type, priority } =
			await request.json();

		// Validation des données
		if (!name || !email || !subject || !message || !type) {
			return NextResponse.json(
				{ error: "Tous les champs obligatoires doivent être remplis" },
				{ status: 400 }
			);
		}

		// Récupérer l'utilisateur connecté (optionnel)
		let userId = null;
		const token = request.cookies.get("auth-token")?.value;

		if (token) {
			try {
				const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
					userId: string;
				};
				userId = decoded.userId;
			} catch (error) {
				// Token invalide, mais on continue sans user_id
			}
		}

		// Créer le message
		const { data: newMessage, error } = await supabaseAdmin
			.from("admin_messages")
			.insert({
				user_id: userId,
				name,
				email,
				subject,
				message,
				type,
				priority: priority || "medium",
			})
			.select()
			.single();

		if (error) {
			console.error("Erreur création message admin:", error);
			return NextResponse.json(
				{ error: "Erreur lors de l'envoi du message" },
				{ status: 500 }
			);
		}

		return NextResponse.json({
			message: "Message envoyé avec succès!",
			data: newMessage,
		});
	} catch (error) {
		console.error("Erreur API create message:", error);
		return NextResponse.json(
			{ error: "Erreur interne du serveur" },
			{ status: 500 }
		);
	}
}
