import { z } from "zod";

// Reserved usernames that cannot be used
const RESERVED_USERNAMES = [
  "admin", "api", "dashboard", "login", "signup", "settings",
  "profile", "help", "support", "about", "contact", "blog",
  "app", "www", "mail", "ftp", "status", "docs",
];

// Password must be 8+ chars with at least 1 uppercase, 1 lowercase, 1 number
export const passwordSchema = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .regex(/[A-Z]/, "Precisa ter pelo menos 1 letra maiúscula")
  .regex(/[a-z]/, "Precisa ter pelo menos 1 letra minúscula")
  .regex(/[0-9]/, "Precisa ter pelo menos 1 número");

export const usernameSchema = z
  .string()
  .min(3, "Mínimo 3 caracteres")
  .max(30, "Máximo 30 caracteres")
  .regex(/^[a-z0-9-]+$/, "Apenas letras minúsculas, números e hífen")
  .refine((val) => !val.startsWith("-") && !val.endsWith("-"), "Não pode começar ou terminar com hífen")
  .refine((val) => !RESERVED_USERNAMES.includes(val), "Este nome é reservado");

export const emailSchema = z
  .string()
  .email("Email inválido")
  .min(1, "Email é obrigatório");

export const bioSchema = z
  .string()
  .max(160, "Máximo 160 caracteres")
  .optional();

export const displayNameSchema = z
  .string()
  .min(1, "Nome é obrigatório")
  .max(50, "Máximo 50 caracteres");

export const linkSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(100),
  url: z.string().url("URL inválida"),
  active: z.boolean().default(true),
  type: z.enum(["normal", "spotlight", "header"]).default("normal"),
});

export const productSchema = z.object({
  title: z.string().min(1, "Título é obrigatório").max(200),
  price: z.number().min(0, "Preço deve ser positivo"),
  originalPrice: z.number().min(0).optional(),
  description: z.string().max(500).optional(),
  url: z.string().url("URL inválida").optional(),
  active: z.boolean().default(true),
});

// Upload validation
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm"];
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_VIDEO_SIZE = 10 * 1024 * 1024; // 10MB

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return "Tipo de arquivo não permitido. Use JPEG, PNG, WebP ou GIF.";
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return "Imagem muito grande. Máximo 5MB.";
  }
  return null;
}

export function validateVideoFile(file: File): string | null {
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return "Tipo de vídeo não permitido. Use MP4 ou WebM.";
  }
  if (file.size > MAX_VIDEO_SIZE) {
    return "Vídeo muito grande. Máximo 10MB.";
  }
  return null;
}

// Password strength meter (0-4)
export function getPasswordStrength(password: string): { score: number; label: string; color: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels: Record<number, { label: string; color: string }> = {
    0: { label: "Muito fraca", color: "#ef4444" },
    1: { label: "Fraca", color: "#f97316" },
    2: { label: "Razoável", color: "#eab308" },
    3: { label: "Boa", color: "#22c55e" },
    4: { label: "Forte", color: "#16a34a" },
    5: { label: "Muito forte", color: "#15803d" },
  };

  return { score, ...levels[Math.min(score, 5)] };
}
