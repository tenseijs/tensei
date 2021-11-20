import { ReactChild } from 'react'
import create, { State } from 'zustand'
import { devtools } from 'zustand/middleware'
import { EuiToastProps } from '@tensei/eui/lib/components/toast/toast'
import { htmlIdGenerator } from '@tensei/eui/lib/services'

export interface Toast {
  id: string
  text?: ReactChild
  toastLifeTimeMs?: number
  title?: ReactChild
  color?: EuiToastProps['color']
}

interface ToastState extends State {
  toasts: Toast[]
}

interface ToastMethodsState extends State {
  toast: (
    title: Toast['title'],
    text?: Toast['text'],
    color?: Toast['color']
  ) => void
  remove: (toast: Toast) => void
  toastId: () => string
}

export const useToastStore = create<ToastState & ToastMethodsState>(
  devtools((set, get) => ({
    toasts: [],
    toastId: htmlIdGenerator(),
    toast(title, text, color = 'success') {
      set({
        toasts: [
          ...get().toasts,
          {
            id: get().toastId(),
            title,
            text,
            color
          }
        ]
      })
    },
    remove(removedToast) {
      set({
        toasts: get().toasts.filter(toast => removedToast.id !== toast.id)
      })
    }
  }))
)
