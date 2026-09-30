"use client"

import { CheckIcon, MailIcon } from "lucide-react"
import { useActionState, useState } from "react"

import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { siteHost } from "@/lib/site"
import { useUsernameAvailability } from "@/hooks/use-username-availability"

import { signUp, type AuthState } from "../actions"
import { SubmitButton } from "../submit-button"

export function SignupForm({ initialUsername }: { initialUsername?: string }) {
  const [state, action] = useActionState<AuthState, FormData>(signUp, null)
  const [username, setUsername] = useState(state?.values?.username ?? initialUsername ?? "")
  const availability = useUsernameAvailability(username)

  if (state?.checkEmail) {
    return (
      <div role="status" className="flex flex-col items-start gap-4 rounded-2xl border bg-card p-6">
        <span className="flex size-11 items-center justify-center rounded-full bg-secondary">
          <MailIcon aria-hidden="true" className="size-5" />
        </span>
        <h2 className="text-xl font-semibold">Check your inbox</h2>
        <p className="text-muted-foreground">
          We sent a link to <span className="font-medium text-foreground">{state.checkEmail}</span>. Open it on
          this device to finish setting up your page.
        </p>
      </div>
    )
  }

  const usernameError =
    state?.fieldErrors?.username ??
    (availability.status === "invalid" && username.length >= 3 ? availability.message : undefined) ??
    (availability.status === "taken" ? "That name is taken. Try another." : undefined)

  return (
    <form action={action} noValidate>
      <FieldGroup className="gap-5">
        {state?.error ? (
          <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
            {state.error}
          </p>
        ) : null}
        <Field data-invalid={!!usernameError}>
          <FieldLabel htmlFor="username">Page name</FieldLabel>
          <div className="flex h-11 items-center rounded-md border border-input bg-transparent pl-3 shadow-xs transition-[color,box-shadow] focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50 has-[[aria-invalid=true]]:border-destructive dark:bg-input/30">
            <span className="shrink-0 text-muted-foreground select-none">{siteHost}/</span>
            <input
              id="username"
              name="username"
              value={username}
              onChange={(event) => setUsername(event.target.value.toLowerCase())}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              aria-invalid={!!usernameError}
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
            {usernameError ? (
              <FieldError>{usernameError}</FieldError>
            ) : availability.status === "available" ? (
              <FieldDescription>{`${siteHost}/${username} is yours if you want it.`}</FieldDescription>
            ) : (
              <FieldDescription>Letters, numbers, dots and underscores.</FieldDescription>
            )}
          </div>
        </Field>
        <Field data-invalid={!!state?.fieldErrors?.email}>
          <FieldLabel htmlFor="email">E-mail</FieldLabel>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            defaultValue={state?.values?.email}
            aria-invalid={!!state?.fieldErrors?.email}
            className="h-11"
            required
          />
          <FieldError>{state?.fieldErrors?.email}</FieldError>
        </Field>
        <Field data-invalid={!!state?.fieldErrors?.password}>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            aria-invalid={!!state?.fieldErrors?.password}
            aria-describedby="password-hint"
            className="h-11"
            required
          />
          {state?.fieldErrors?.password ? (
            <FieldError>{state.fieldErrors.password}</FieldError>
          ) : (
            <FieldDescription id="password-hint">At least 8 characters.</FieldDescription>
          )}
        </Field>
        <SubmitButton pendingLabel="Creating your page">Create your page</SubmitButton>
      </FieldGroup>
    </form>
  )
}
