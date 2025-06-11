"use client";
import useProject from "@/hooks/use-project";
import { api } from "@/trpc/react";
import React from "react";
import MeetingCard from "../dashboard/meeting-card";
import Link from "next/link";
import { Badge, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import useRefetch from "@/hooks/use-refetch";

const MeetingsPage = () => {
  const { projectId } = useProject();
  const { data: meetings, isLoading } = api.project.getMeetings.useQuery(
    { projectId },
    {
      refetchInterval: 4000,
    },
  );

  const deleteMeeting = api.project.deleteMeeting.useMutation();
  const refetch = useRefetch();
  return (
    <>
      <MeetingCard />
      <div className="h-8"></div>
      <h1 className="text-xl font-semibold">Meetings</h1>
      {meetings && meetings.length === 0 && <div>No Meetings Found</div>}
      {isLoading && <div>Loading...</div>}
      <ul className="divide-y divide-gray-200">
        {meetings?.map((meeting) => (
          <li
            key={meeting.id}
            className="flex items-center justify-between gap-x-6 p-5 hover:bg-gray-50"
          >
            <div>
              <div className="min-w-0">
                <div className="items-centergap-2 flex">
                  <Link
                    href={`/meeting/${meeting.id}`}
                    className="text-sm font-semibold"
                  >
                    {meeting.name}
                  </Link>
                  {meeting.status === "PROCESSING" && (
                    <div className="ml-1 bg-yellow-100 text-yellow-800 border border-yellow-300 px-3 rounded-full text-sm font-medium shadow-sm">
                      <div>Processing...</div>
                    </div>

                  )}
                </div>
              </div>
              <div className="gaap-x-2 flex items-center text-xs text-gray-500">
                <p className="whitespace-nowrap">
                  {meeting.createdAt.toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>
            <div className="flex flex-none items-center gap-x-4">
              <Link href={`/meetings/${meeting.id}`}>
                <Button size="sm" variant="outline">
                  View Meeting
                </Button>
              </Link>
              <Button
                disabled={deleteMeeting.isPending}
                size="sm"
                variant="destructive"
                onClick={() => deleteMeeting.mutate({ meetingId: meeting.id }, {
                  onSuccess: () => {
                    toast.success("Meeting deleted successfully");
                    refetch();
                  },
                })}
              >
                <Trash2 />
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
};

export default MeetingsPage;
