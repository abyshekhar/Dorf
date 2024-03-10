import { persistentAtom } from "@nanostores/persistent"
import { useStore } from "@nanostores/react"
import { atom } from "nanostores"

export type Field = {
  id: string
  createdAt: Date
  updatedAt: Date
  type: string
  label: string
}
export type State = {
  id: string
  createdAt: Date
  updatedAt: Date
  title: string
  description: string
  submitText: string
  published: boolean
  archived: boolean
  userId: string
  fields: Field[]
}

export const $appState = persistentAtom<State>(
  "state",
  {
    id: "",
    createdAt: new Date(),
    updatedAt: new Date(),
    title: "",
    description: "",
    submitText: "",
    published: false,
    archived: false,
    userId: "",
    fields: [],
  },
  {
    encode: JSON.stringify,
    decode: JSON.parse,
  }
)

export function useAppState() {
  return {
    selectForm,
    deleteForm,
    updateFormName,
    updateFormFields,
    newForm,
    setAppState,
  }
}
function setAppState(state: State) {
  $appState.set(state)
}

function newForm() {
  
}

function updateFormFields() {
  
}

function selectForm() {
}

function deleteForm() {
  
}

function updateFormName(newName: string) {
 
}
