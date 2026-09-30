"use client"

import { CheckIcon } from "lucide-react"
import { useActionState, useState } from "react"

import { SubmitButton } from "@/app/(site)/(auth)/submit-button"
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field"
import { HostPrefix } from "@/components/host-prefix"
import { Spinner } from "@/components/ui/spinner"
import { useUsernameAvailability } from "@/hooks/use-username-availability"

import { chooseUsername, type OnboardingState } from "./actions"

export function OnboardingForm({ initialUsername }: { initialUsername?: string }) {
  const [state, action] = useActionState<OnboardingState, FormData>(chooseUsername, null)
  const [username, setUsername] = useState(state?.username ?? initialUsername ?? "")
  const availability = useUsernameAvailability(username)
  const error =
    state?.error ??
    (availability.status === "invalid" && username.length >= 3 ? availability.message : undefined) ??
    (availability.status === "taken" ? "That name is taken. Try another." : undefined)

  return (
    <form action={action} noValidate className="flex flex-col gap-5">
      <Field data-invalid={!!error}>
        <FieldLabel htmlFor="username">Page name</FieldLabel>
        <div className="flex h-11 items-center rounded-md border border-input pl-3 shadow-xs focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-[[aria-invalid=true]]:border-destructive dark:bg-input/30">
          <HostPrefix className="max-w-[60%]" />
          <input
            id="username"
            name="username"
            value={username}
            onChange={(event) => setUsername(event.target.value.toLowerCase())}
            autoCapitalize="none"
            autoComplete="off"
            spellCheck={false}
            aria-invalid={!!error}
            aria-describedby="username-status"
            className="h-full min-w-0 flex-1 bg-transparent pr-2 font-medium outline-none"
            required
          />
          <span className="flex w-8 shrink-0 justify-center" aria-hidden="true">
            {availability.status === "checking" ? <Spinner className="text-muted-foreground" /> : null}
            {availability.status === "available" ? <CheckIcon className="size-4 text-chart-1" /> : null}
          </span>
        </div>
        <div id="username-status" aria-live="polite">
          {error ? (
            <FieldError>{error}</FieldError>
          ) : (
            <FieldDescription>You can change it later in settings.</FieldDescription>
          )}
        </div>
      </Field>
      <SubmitButton pendingLabel="Saving">Continue</SubmitButton>
    </form>
  )
}
