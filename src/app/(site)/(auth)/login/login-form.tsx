"use client"

import { useActionState } from "react"

import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { signIn, type AuthState } from "../actions"
import { SubmitButton } from "../submit-button"

export function LoginForm({ next }: { next?: string }) {
  const [state, action] = useActionState<AuthState, FormData>(signIn, null)

  return (
    <form action={action} noValidate>
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <FieldGroup className="gap-5">
        {state?.error ? (
          <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
            {state.error}
          </p>
        ) : null}
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
            autoComplete="current-password"
            aria-invalid={!!state?.fieldErrors?.password}
            className="h-11"
            required
          />
          <FieldError>{state?.fieldErrors?.password}</FieldError>
        </Field>
        <SubmitButton pendingLabel="Logging in">Log in</SubmitButton>
      </FieldGroup>
    </form>
  )
}
