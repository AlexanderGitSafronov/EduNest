import { auth } from "@/lib/auth"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Navbar } from "@/components/layout/Navbar"
import { LessonViewer } from "@/components/lesson/LessonViewer"

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = await params
  const session = await auth()
  if (!session?.user) redirect("/auth/login")

  const sessionUser = session.user as { role?: string; id?: string }

  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      module: {
        include: {
          course: {
            include: {
              teacher: { select: { id: true, name: true } },
              modules: {
                orderBy: { position: "asc" },
                include: { lessons: { orderBy: { position: "asc" }, select: { id: true, title: true, duration: true, type: true } } },
              },
            },
          },
        },
      },
      attachments: true,
      progress: { where: { userId: sessionUser.id } },
    },
  })

  if (!lesson) notFound()

  const course = lesson.module.course

  // Check access
  if (sessionUser.role === "STUDENT") {
    const enrollment = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId: sessionUser.id!, courseId: course.id } },
    })
    if (!enrollment) redirect("/dashboard")
  } else if (sessionUser.role === "TEACHER" && course.teacher.id !== sessionUser.id) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <LessonViewer lesson={lesson as any} userId={sessionUser.id!} role={sessionUser.role as string} userName={session.user.name ?? undefined} />
      </main>
    </div>
  )
}
