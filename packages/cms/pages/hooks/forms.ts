import { useState, FormEvent } from 'react'
import { AxiosResponse, AxiosError } from 'axios'

type PartialErrorRecord<T extends string | number | symbol> = Partial<
  Record<T, string | string[]>
>

interface ServerValidationError {
  message: string
  field: string
  validation: string
}

export function useForm<
  FormInput extends { [key: string]: any },
  Errors = PartialErrorRecord<keyof FormInput>
>({
  defaultValues,
  onSubmit,
  onSuccess
}: {
  defaultValues: FormInput
  onSubmit: <
    T,
    E = {
      errors: ServerValidationError[]
    }
  >(
    form: FormInput
  ) => Promise<[AxiosResponse<T> | null, AxiosError<E> | null]>
  onSuccess?: <T>(payload: {
    response: AxiosResponse<T>
    form: FormInput
  }) => void
}) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState<FormInput>(defaultValues || {})
  const [errors, setErrors] = useState<Errors>()

  const setValue = (field: keyof FormInput, value: any) => {
    setForm({
      ...form,
      [field]: value
    })
    setErrors({
      ...errors,
      [field]: undefined
    } as any)
  }

  const submit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault()

    setLoading(true)

    const [response, error] = await onSubmit(form)

    if (error) {
      let formErrors: any = {}
      error?.response?.data?.errors?.forEach(error => {
        formErrors[error.field as keyof Errors] = [error?.message]
      })

      setErrors(formErrors)
    } else {
      onSuccess?.({
        response: response!,
        form
      })
    }

    setLoading(false)

    return [response, error]
  }

  return {
    form,
    errors,
    submit,
    loading,
    setForm,
    setValue
  }
}
