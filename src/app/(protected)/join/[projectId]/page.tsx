// app/(protected)/join/[projectId]/page.tsx (example path, adjust as needed)
import { db } from "@/server/db";
import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  params: {
    projectId: string;
  };
};

const JoinHandler = async ({ params }: Props) => {
  const { projectId } = params;

  const { userId } = await auth();
  if (!userId) return redirect("/sign-in");

  const dbUser = await db.user.findUnique({
    where: { id: userId },
  });

  const client = await clerkClient();
  const user = await client.users.getUser(userId);

  if (!dbUser) {
    await db.user.create({
      data: {
        id: userId,
        firstName: user.firstName,
        lastName: user.lastName,
        imageUrl: user.imageUrl,
        emailAddress: user.emailAddresses[0]!.emailAddress,
      },
    });
  }

  const project = await db.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    return redirect("/dashboard");
  }

  try {
    await db.userToProject.create({
      data: {
        userId,
        projectId,
      },
    });
  } catch (e) {
    console.log("User already in project");
  }

  return redirect("/dashboard");
};

export default JoinHandler;
