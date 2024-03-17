"use server";

import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import validator from "validator";
import { z } from "zod";



import { db } from "@/lib/db";
import { forms, submissions } from "@/lib/db/pg-schema";
import { Event } from "@/lib/events";
import { generateId } from "@/lib/id";
import { ratelimit } from "@/lib/ratelimiter";
import { revalidatePath } from "next/cache";





const createSubmissionSchema = createInsertSchema(submissions).pick({
  formId: true,
  data: true,
})
type CreateSubmission = z.infer<typeof createSubmissionSchema>
const generateZodSchema = (field: any) => {
  let type
  switch (field.type) {
    case "text":
    case "password":
      type = z.string().min(field.minlength)
      break
    case "number":
      type = z.number()
      break
    case "email":
      type = z.string().email()
      break
    case "textarea":
      type = z.string().max(512)
      break
    case "checkbox":
      type = z.boolean()
      break
    case "url":
      type = z.string().url()
      break
    case "tel":
      type = z.string().refine(validator.isMobilePhone)
      break
    case "date":
      type = z.date()
      break

    // Add more field types and their corresponding schema definitions here
    default:
      // Default to treating unknown field types as strings
      type = z.string()
  }

  if (!field.required) {
    type = type.optional()
  } else if (
    field.type == "text" ||
    field.type == "textarea" ||
    field.type == "email"
  ) {
    if (field.minlength) {
      type = type.min(field.minlength)
    }
    if (field.maxlength) {
      type = type.max(field.maxlength)
    }
  }

  return type
}

export const createSubmission = async (data: CreateSubmission) => {
  const formSchema = await db.query.forms.findFirst({
    where: eq(forms.id, data.formId),
  })
  const content =JSON.parse(formSchema?.content?formSchema.content:"")
  
  let fieldSchemas =content.fields.map((field) => {
    let fieldSchema = generateZodSchema(field)

    return {
      [field.label]: fieldSchema,
    }
  })

  fieldSchemas = z.object({
    // Dynamically generate Zod object schema based on the fields
    ...fieldSchemas.reduce((acc, fieldSchema, index) => {
      return {
        ...acc,
        ...fieldSchema,
      }
    }, {}),
  })

  const validatedData = fieldSchemas.safeParse(data.data)
  const submission = createSubmissionSchema.parse(data)
  const ip = headers().get("x-forwarded-for")

  const { success } = await ratelimit.limit(ip ?? "anonymous")

  if (!success) {
    throw new Error("Too many requests")
  }

  const id = generateId()
  await db.insert(submissions).values({ ...submission, id })

  const event = new Event("submission.created")

  await event.emit({
    formId: submission.formId,
    data: JSON.stringify(submission?.data),
    submissionId: id,
  })
}

export async function deleteFormSubmission(id: string,submissionId:string) {
  await db.delete(submissions).where(eq(submissions.id, submissionId))
  revalidatePath(`/f/${id}/f/${submissionId}`)
}

const updateSubmissionSchema = createInsertSchema(submissions).pick({
  formId: true,
  id:true,
  data: true,
})
type UpdateSubmission = z.infer<typeof updateSubmissionSchema>

export const updateSubmission = async (data: UpdateSubmission) => {
  const submission = await db.query.submissions.findFirst({
    where:and(eq(submissions.formId, data.formId),eq(submissions.id,data.id)),
  })
  // const content =JSON.parse(formSchema?.content?formSchema.content:"")
  // console.log(content);
  
  // let fieldSchemas =content.fields.map((field) => {
  //   let fieldSchema = generateZodSchema(field)

  //   return {
  //     [field.label]: fieldSchema,
  //   }
  // })

  // submissionSchema = z.object({
  //   // Dynamically generate Zod object schema based on the fields
  //   ...fieldSchemas.reduce((acc, fieldSchema, index) => {
  //     return {
  //       ...acc,
  //       ...fieldSchema,
  //     }
  //   }, {}),
  // })

  // const validatedData = fieldSchemas.safeParse(data.data)
  const validatedSubmission = createSubmissionSchema.parse(data)
  const ip = headers().get("x-forwarded-for")

  const { success } = await ratelimit.limit(ip ?? "anonymous")

  if (!success) {
    throw new Error("Too many requests")
  }

  await db.update(submissions).set({ data:data.data}).where(eq(submissions.id,data.id))

  const event = new Event("submission.updated")

  await event.emit({
    formId: data.formId,
    data: JSON.stringify(submission?.data),
    submissionId: data.id,
  })
}