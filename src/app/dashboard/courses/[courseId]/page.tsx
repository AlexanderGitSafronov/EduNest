import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Navbar } from "@/components/layout/Navbar"
import { CourseEditor } from "@/components/teacher/CourseEditor"

export default async function CourseEditorPage({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = await params
  const session = await auth()
  if (!session?.user || (session.user as { role?: string }).role !== "TEACHER") redirect("/dashboard")

  let course
  try {
    course = await prisma.course.findUnique({
      where: { id: courseId, teacherId: session.user.id },
      include: {
        modules: {
          orderBy: { position: "asc" },
          include: {
            lessons: { orderBy: { position: "asc" } },
          },
        },
        enrollments: {
          include: { user: { select: { id: true, name: true, email: true, image: true } } },
        },
      },
    })
  } catch {
    course = null
  }

  if (!course) notFound()

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-muted/20">
        <CourseEditor course={course as any} />
      </main>
    </div>
  )
}
