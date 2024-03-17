"use client"

import React from "react"
import Link from "next/link"
import { deleteFormSubmission } from "@/actions/submissions"
import { ColumnDef } from "@tanstack/react-table"
import dayjs from "dayjs"
import { InferModel } from "drizzle-orm"
import {
  CopyIcon,
  DeleteIcon,
  Edit2Icon,
  Edit3Icon,
  EditIcon,
  ExternalLinkIcon,
  InboxIcon,
  MoreHorizontal,
  PencilIcon,
} from "lucide-react"

import { siteConfig } from "@/config/site"
import { submissions } from "@/lib/db/pg-schema"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button, buttonVariants } from "@/components/ui/button"
import { DataTableColumnHeader } from "@/components/ui/data-column-header"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { Trash2 } from "lucide-react"

type Submission = InferModel<typeof submissions, "select">
const deleteSubmission = async ({
  formId,
  id,
}: {
  formId: string
  id: string
}) => {
  await deleteFormSubmission(formId, id)
  toast({
    title: `Form submission deleted`,
    description: `Form submission has been deleted`,
  })
}

export const submissionColumns: ColumnDef<Submission> = {
  header: "Actions",
  id: "actions",
  cell: ({ row }) => {
    const form = row.original
    return (
      <AlertDialog>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuGroup>
              <Link href={`/f/${form.formId}/s/${form.id}`}>
                <DropdownMenuItem>
                  <PencilIcon className="mr-2 h-4 w-4" />
                  <span>Edit</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <AlertDialogTrigger asChild>
                <DropdownMenuItem className="text-destructive">
                  <Trash2 className="mr-2 h-4 w-4" />
                  <span>Delete</span>
                </DropdownMenuItem>
              </AlertDialogTrigger>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              You are going to delete this submission. Its <b>not</b> deleted
              permanently though. You can restore it whenever you want.
            </AlertDialogDescription>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                className={buttonVariants({ variant: "destructive" })}
                onClick={() => deleteSubmission({formId: form.formId,id: form.id})}
              >
                Delete Submission
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogHeader>
        </AlertDialogContent>
      </AlertDialog>
    )
  },
}
