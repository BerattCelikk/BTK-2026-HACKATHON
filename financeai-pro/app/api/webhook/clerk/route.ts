import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, data } = body

    switch (type) {
      case "user.created": {
        await prisma.user.upsert({
          where: { clerkId: data.id },
          update: {
            email: data.email_addresses?.[0]?.email_address || "",
            firstName: data.first_name || null,
            lastName: data.last_name || null,
            avatarUrl: data.image_url || null,
          },
          create: {
            clerkId: data.id,
            email: data.email_addresses?.[0]?.email_address || "",
            firstName: data.first_name || null,
            lastName: data.last_name || null,
            avatarUrl: data.image_url || null,
          },
        })
        return NextResponse.json({ received: true, userCreated: true })
      }

      case "user.updated": {
        await prisma.user.update({
          where: { clerkId: data.id },
          data: {
            email: data.email_addresses?.[0]?.email_address || "",
            firstName: data.first_name || null,
            lastName: data.last_name || null,
            avatarUrl: data.image_url || null,
          },
        })
        return NextResponse.json({ received: true, userUpdated: true })
      }

      case "user.deleted": {
        await prisma.user.deleteMany({ where: { clerkId: data.id } })
        return NextResponse.json({ received: true, userDeleted: true })
      }

      default:
        return NextResponse.json({ received: true })
    }
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook error" }, { status: 500 })
  }
}
