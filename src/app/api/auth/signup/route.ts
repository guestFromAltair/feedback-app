import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import bcrypt from "bcryptjs"
import { z } from "zod"
import { sendWelcomeEmail } from "@/lib/email"

const signupSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const parsed = signupSchema.safeParse(body)
    if (!parsed.success) {
        return NextResponse.json(
          { error: parsed.error.issues[0].message },
          { status: 400 }
        )
      }

    const { name, email, password } = parsed.data

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      if (existingUser.password) {
        return NextResponse.json(
            {error: "An account with this email already exists"},
            {status: 409}
        )
      }

      // Upgrade lightweight account to full account
      const hashedPassword = await bcrypt.hash(password, 12)

      await prisma.user.update({
        where: { email },
        data: { name, password: hashedPassword }
      })

      try {
        await sendWelcomeEmail({ to: email, name })
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError)
      }

      return NextResponse.json(
          { message: "Account created successfully", userId: existingUser.id },
          { status: 201 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword }
    })

    try {
      await sendWelcomeEmail({ to: email, name })
    } catch (emailError) {
      console.error("Failed to send welcome email:", emailError)
    }

    return NextResponse.json(
      { message: "Account created successfully", userId: user.id },
      { status: 201 }
    )
  } catch (error) {
    console.error("Signup error:", error)
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }
}