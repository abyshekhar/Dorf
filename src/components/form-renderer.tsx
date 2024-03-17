"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSubmission, updateSubmission } from "@/actions/submissions";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { InferModel } from "drizzle-orm";
import { AtSignIcon, CalendarIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import validator from "validator";
import { z } from "zod";



import { fields, forms, submissions } from "@/lib/db/pg-schema";
import { cn } from "@/lib/utils";



import { Icons } from "./icons";
import { Button } from "./ui/button";
import { Calendar } from "./ui/calendar";
import { Checkbox } from "./ui/checkbox";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "./ui/form";
import { Input } from "./ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";


type Form = InferModel<typeof forms, "select">
type Field = InferModel<typeof fields, "select">
type Submission = InferModel<typeof submissions>
type FormWithFields = Form & {
  fields: Field[]
  submissions: any
}

interface FormRendererProps {
  form: FormWithFields
  preview?: boolean
}

const fieldTypeSchema = z.enum(fields.type.enumValues)
type FieldType = z.infer<typeof fieldTypeSchema>

// build validtion schema from form fields using zod. i.e. if field.type === "email" then add z.string().email() to schema. If its required then add .required()
const generateZodSchema = (field: Field) => {
  let type
  switch (field.type) {
    case "text":
    case "password":
      type = z.string()
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
    // if (field.minlength) {
    //   type = type.min(field.minlength?field.minlength:0)
    // }
    // if (field.maxlength) {
    //   type = type.max(field.maxlength?field.maxlength:512)
    // }
  }

  return type
}

const generateFormSchema = (formData: FormWithFields) => {
  const fieldSchemas = formData.fields.map((field) => {
    let fieldSchema = generateZodSchema(field)

    return {
      [field.label]: fieldSchema,
    }
  })

  return z.object({
    // Dynamically generate Zod object schema based on the fields
    ...fieldSchemas.reduce((acc, fieldSchema, index) => {
      return {
        ...acc,
        ...fieldSchema,
      }
    }, {}),
  })
}

export const FormRenderer = ({
  form: formData,
  preview,
}: FormRendererProps) => {
   const submission: any = formData?.submissions
    ? formData.submissions[0]?.data
    : undefined
  const formSchema = generateFormSchema(formData)
  const defaultValues = {}
  formData.fields.forEach(
    (field) => (defaultValues[field.label] = submission?  submission[field.label]:undefined)
  )
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues
  })
 

  
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function onSubmit(values: unknown) {
    setIsSubmitting(true)
    if (!preview) {
      if (formData.submissions && formData.submissions[0]?.id) {
        await updateSubmission({
          id: formData.submissions[0].id,
          formId: formData.id,
          data: JSON.parse(JSON.stringify(values)),
        })
      } else {
        await createSubmission({
          formId: formData.id,
          data: JSON.parse(JSON.stringify(values)),
        })
      }

      router.push(`/f/${formData.id}/success`)
      setIsSubmitting(false)
    } else {
      // preview timout of 2 secs
      setTimeout(() => {
        alert("Preview mode")
        setIsSubmitting(false)
      }, 1000)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {formData.fields.map((fieldItem) => {
          switch (fieldItem.type) {
            case "text":
              return (
                <FormField
                  key={fieldItem.id}
                  control={form.control}
                  name={fieldItem.label}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{fieldItem.label}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={fieldItem.placeholder || undefined}
                          required={fieldItem.required || false}
                          {...field}
                          value={
                            (field.value as string)
                          }
                          disabled={submission && fieldItem.disableOnEdit}
                        />
                      </FormControl>
                      {fieldItem.description && (
                        <FormDescription>
                          {fieldItem.description}
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )
            case "textarea":
              return (
                <FormField
                  key={fieldItem.id}
                  control={form.control}
                  name={fieldItem.label}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{fieldItem.label}</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          value={
                            (field.value as string)
                          }
                          required={fieldItem.required}
                          disabled={submission && fieldItem.disableOnEdit}
                        />
                      </FormControl>
                      {fieldItem.description && (
                        <FormDescription>
                          {fieldItem.description}
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )
            case "email":
              return (
                <FormField
                  key={fieldItem.id}
                  control={form.control}
                  name={fieldItem.label}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{fieldItem.label}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={fieldItem.placeholder || undefined}
                          required={fieldItem.required || false}
                          {...field}
                          value={
                            (field.value as string)
                          }
                          disabled={submission && fieldItem.disableOnEdit}
                          type="email"
                          icon={"atSign"}
                          autoComplete="email"
                        />
                      </FormControl>
                      {fieldItem.description && (
                        <FormDescription>
                          {fieldItem.description}
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )
            case "password":
              return (
                <FormField
                  key={fieldItem.id}
                  control={form.control}
                  name={fieldItem.label}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{fieldItem.label}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={fieldItem.placeholder || undefined}
                          required={fieldItem.required || false}
                          {...field}
                          disabled={submission && fieldItem.disableOnEdit}
                          type="password"
                          icon={"password"}
                          autoComplete="password"
                        />
                      </FormControl>
                      {fieldItem.description && (
                        <FormDescription>
                          {fieldItem.description}
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )
            case "checkbox":
              return (
                <FormField
                  key={fieldItem.id}
                  control={form.control}
                  name={fieldItem.label}
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 pl-0">
                      <FormControl>
                        <Checkbox
                          checked={
                            (field.value as boolean)
                          }
                          defaultChecked={(submission && submission[field.name]) ||false}
                          onCheckedChange={field.onChange}
                          disabled={submission && fieldItem.disableOnEdit}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>{fieldItem.label}</FormLabel>
                        <FormDescription>
                          {fieldItem.description}
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />
              )
            case "number":
              return (
                <FormField
                  key={fieldItem.id}
                  control={form.control}
                  name={fieldItem.label}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{fieldItem.label}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={fieldItem.placeholder || undefined}
                          {...field}
                          required={fieldItem.required || false}
                          value={
                            (field.value as string)
                          }
                          disabled={submission && fieldItem.disableOnEdit}
                          icon="hash"
                          type="number"
                        />
                      </FormControl>
                      {fieldItem.description && (
                        <FormDescription>
                          {fieldItem.description}
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )
            case "url":
              return (
                <FormField
                  key={fieldItem.id}
                  control={form.control}
                  name={fieldItem.label}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{fieldItem.label}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={fieldItem.placeholder || undefined}
                          required={fieldItem.required || false}
                          {...field}
                          icon="link"
                          value={
                            (field.value as string)
                          }
                          disabled={submission && fieldItem.disableOnEdit}
                          type="url"
                          autoComplete="url"
                        />
                      </FormControl>
                      {fieldItem.description && (
                        <FormDescription>
                          {fieldItem.description}
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )
            case "tel":
              return (
                <FormField
                  key={fieldItem.id}
                  control={form.control}
                  name={fieldItem.label}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{fieldItem.label}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={fieldItem.placeholder || undefined}
                          required={fieldItem.required || false}
                          {...field}
                          icon="phone"
                          value={
                            (field.value as string)
                          }
                          disabled={submission && fieldItem.disableOnEdit}
                          type="tel"
                          autoComplete="tel"
                        />
                      </FormControl>
                      {fieldItem.description && (
                        <FormDescription>
                          {fieldItem.description}
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )
            case "date":
              return (
                <FormField
                  key={fieldItem.id}
                  control={form.control}
                  name={fieldItem.label}
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>{fieldItem.label}</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "justify-start pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                              {submission && submission[field.name] ? (
                                format(submission[field.name] as Date, "PPP")
                              ) : field.value ? (
                                format(field.value as Date, "PPP")
                              ) : (
                                <span>Pick a date</span>
                              )}
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value as Date}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date("1900-01-01")
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormDescription>{fieldItem.description}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )

            case "select":
              return (
                <FormField
                  key={fieldItem.id}
                  control={form.control}
                  name={fieldItem.label}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{fieldItem.label}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={
                          (field.value as string)
                        }
                          disabled={submission && fieldItem.disableOnEdit}
                      >
                        <FormControl>
                          <SelectTrigger required={fieldItem.required}>
                            <SelectValue placeholder={fieldItem.placeholder} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {fieldItem.options
                            ?.split(",")
                            .map((option, index) => (
                              <SelectItem key={index} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>{fieldItem.description}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )
            case "radio":
              return (
                <FormField
                  key={fieldItem.id}
                  control={form.control}
                  name={fieldItem.label}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{fieldItem.label}</FormLabel>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={
                          (field.value as string)
                        }
                          disabled={submission && fieldItem.disableOnEdit}
                      >
                        {fieldItem.options?.split(",").map((option, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2"
                          >
                            <FormControl>
                              <RadioGroupItem key={index} value={option}>
                                {option}
                              </RadioGroupItem>
                            </FormControl>

                            <FormLabel>{option}</FormLabel>
                          </div>
                        ))}
                      </RadioGroup>
                      <FormDescription>{fieldItem.description}</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )
            case "time":
              return (
                <FormField
                  key={fieldItem.id}
                  control={form.control}
                  name={fieldItem.label}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{fieldItem.label}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={fieldItem.placeholder || undefined}
                          required={fieldItem.required || false}
                          {...field}
                          icon="clock"
                          value={
                            (field.value as string)
                          }
                          disabled={submission && fieldItem.disableOnEdit}
                          type="time"
                        />
                      </FormControl>
                      {fieldItem.description && (
                        <FormDescription>
                          {fieldItem.description}
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )
            case "hidden":
              return (
                <FormField
                  key={fieldItem.id}
                  control={form.control}
                  name={fieldItem.label}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          type="hidden"
                          placeholder={fieldItem.placeholder || undefined}
                          required={fieldItem.required || false}
                          {...field}
                          value={
                            (field.value as string)
                          }
                        />
                      </FormControl>
                      {fieldItem.description && (
                        <FormDescription>
                          {fieldItem.description}
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )
          }
        })}
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : null}
          {formData.submitText}
        </Button>
      </form>
    </Form>
  )
}