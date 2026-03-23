import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import {
  getUserByEmail,
  getCampaigns,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from "@/lib/db";

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email) return null;
  const user = getUserByEmail(session.user.email);
  if (!user || user.role !== "admin") return null;
  return user;
}

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^\w\u0590-\u05FF\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    || `campaign-${Date.now()}`;
}

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(getCampaigns());
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { title, description, image, goal, raised, currency, startDate, endDate, paymentLinks, active, shareText } = body;

  if (!title || !description || goal === undefined || !startDate) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const slug = body.slug || slugify(title);

  const campaign = createCampaign({
    slug: String(slug).slice(0, 200),
    title: String(title).slice(0, 200),
    description: String(description).slice(0, 5000),
    image: image ? String(image).slice(0, 500) : undefined,
    goal: Number(goal) || 0,
    raised: Number(raised) || 0,
    currency: String(currency || "₪").slice(0, 10),
    startDate: String(startDate),
    endDate: endDate ? String(endDate) : undefined,
    paymentLinks: Array.isArray(paymentLinks) ? paymentLinks : [],
    active: Boolean(active),
    shareText: shareText ? String(shareText).slice(0, 500) : undefined,
  });

  return NextResponse.json(campaign, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id, ...updates } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const campaign = updateCampaign(id, updates);
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(campaign);
}

export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { id } = body;
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

  const ok = deleteCampaign(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json({ success: true });
}
