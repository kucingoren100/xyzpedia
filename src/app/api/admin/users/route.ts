import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession, hashPasswordScrypt } from "@/lib/adminAuth";
import { logAuditEvent } from "@/lib/audit";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const admins = await prisma.admin.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      users: admins.map((a) => ({
        ...a,
        role: a.username === process.env.ADMIN_USERNAME ? "OWNER" : "ADMIN",
      })),
      currentUsername: session.username,
      currentRole: session.role,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    if (session.role !== "OWNER") {
      return NextResponse.json(
        { success: false, message: "Hanya role OWNER yang dapat menambah akun admin baru." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { username, name, password, role } = body;

    if (!username || !password || !name) {
      return NextResponse.json(
        { success: false, message: "Username, nama lengkap, dan password wajib diisi." },
        { status: 400 }
      );
    }

    const cleanUsername = username.trim().toLowerCase();
    const existing = await prisma.admin.findUnique({
      where: { username: cleanUsername },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: "Username admin sudah terdaftar." },
        { status: 400 }
      );
    }

    const hashedPassword = await hashPasswordScrypt(password);

    const newAdmin = await prisma.admin.create({
      data: {
        username: cleanUsername,
        name: name.trim(),
        password: hashedPassword,
      },
    });

    await logAuditEvent({
      actor: session.username,
      action: "create_admin_user",
      target: cleanUsername,
      summary: `Owner created admin user ${cleanUsername} (${name.trim()})`,
    });

    return NextResponse.json({
      success: true,
      message: `Admin ${cleanUsername} berhasil dibuat.`,
      user: {
        id: newAdmin.id,
        username: newAdmin.username,
        name: newAdmin.name,
        role: role || "ADMIN",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
