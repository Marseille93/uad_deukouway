import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function chunkArray<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
}

export async function POST(req: NextRequest) {
  // Récupérer tous les utilisateurs
  const { data: users, error } = await supabase
    .from("users")
    .select("email, first_name");

  const emails = users?.map((u: any) => u.email).filter(Boolean);

  if (!emails?.length) {
    return NextResponse.json({ error: "Aucun utilisateur à notifier" }, { status: 400 });
  }

  // Configurer le transporteur Nodemailer
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const batches = chunkArray(emails, 40); // Gmail limite à 100, mais 40 c'est safe
  let errors: any[] = [];
  for (const batch of batches) {
    try {
      await transporter.sendMail({
        from: `"UAD Deukouway" <${process.env.GMAIL_USER}>`,
        to: batch, // tableau d'emails
        subject: "Nouvelles annonces disponibles !",
        html: `
          <h2>Bonjour 👋</h2>
          <p>De nouvelles annonces de logement sont disponibles sur UAD Deukouway !</p>
          <p><a href="https://uad-deukouway.vercel.app" target="_blank">Connectez-vous</a> pour les découvrir.</p>
          <p>Bonne recherche !</p>
        `,
      });
    } catch (e) {
      errors.push(e);
      console.error("Erreur d'envoi batch:", e);
    }
  }
  if (errors.length) {
    return NextResponse.json({ error: "Erreur d'envoi email", details: errors }, { status: 500 });
  }
  return NextResponse.json({ success: true });
}