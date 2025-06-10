
import * as React from "react"

import type {
  ToastProps,
  ToastActionElement,
} from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToasterToast = {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
  variant?: "default" | "destructive"
  className?: string
  duration?: number
  visible: boolean
  onDismiss: () => void
}

const actionTypes = {
  ACTION_ADD_TOAST: "ADD_TOAST",
  ACTION_UPDATE_TOAST: "UPDATE_TOAST",
  ACTION_DISMISS_TOAST: "DISMISS_TOAST",
  ACTION_REMOVE_TOAST: "REMOVE_TOAST",
} as const

let count = 0

function genId() {
  count = (count + 1) % Number.MAX_VALUE
  return count.toString()
}

type ActionType = typeof actionTypes

type Action =
  | {
      type: ActionType["ACTION_ADD_TOAST"]
      toast: Omit<ToasterToast, "id">
    }
  | {
      type: ActionType["ACTION_UPDATE_TOAST"]
      toast: Partial<ToasterToast> & Pick<ToasterToast, "id">
    }
  | {
      type: ActionType["ACTION_DISMISS_TOAST"]
      toastId?: ToasterToast["id"]
    }
  | {
      type: ActionType["ACTION_REMOVE_TOAST"]
      toastId?: ToasterToast["id"]
    }

interface State {
  toasts: ToasterToast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId)
    dispatch({
      type: actionTypes.ACTION_REMOVE_TOAST,
      toastId: toastId,
    })
  }, TOAST_REMOVE_DELAY)

  toastTimeouts.set(toastId, timeout)
}

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case actionTypes.ACTION_ADD_TOAST:
      return {
        ...state,
        toasts: [
          ...state.toasts,
          { ...action.toast, id: genId(), visible: true },
        ].slice(0, TOAST_LIMIT),
      }

    case actionTypes.ACTION_UPDATE_TOAST:
      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === action.toast.id ? { ...t, ...action.toast } : t
        ),
      }

    case actionTypes.ACTION_DISMISS_TOAST: {
      const { toastId } = action

      // ! Side effects ! - This could be extracted into a dismissToast() action,
      // but I'll keep it here for simplicity
      if (toastId) {
        addToRemoveQueue(toastId)
      } else {
        state.toasts.forEach((toast) => {
          addToRemoveQueue(toast.id)
        })
      }

      return {
        ...state,
        toasts: state.toasts.map((t) =>
          t.id === toastId || toastId === undefined
            ? {
                ...t,
                visible: false,
              }
            : t
        ),
      }
    }
    case actionTypes.ACTION_REMOVE_TOAST:
      if (action.toastId === undefined) {
        return {
          ...state,
          toasts: [],
        }
      }
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.toastId),
      }
  }
}

const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action)
  listeners.forEach((listener) => {
    listener(memoryState)
  })
}

type ToastOptions = Omit<ToasterToast, "id" | "visible" | "onDismiss">

function toast(props: ToastOptions) {
  const id = genId()

  const update = (props: Partial<ToasterToast> & Pick<ToasterToast, "id">) =>
    dispatch({
      type: actionTypes.ACTION_UPDATE_TOAST,
      toast: props,
    })
    
  const dismiss = () => dispatch({ type: actionTypes.ACTION_DISMISS_TOAST, toastId: id })

  dispatch({
    type: actionTypes.ACTION_ADD_TOAST,
    toast: {
      ...props,
      visible: true,
      onDismiss: dismiss,
    },
  })

  return {
    id,
    dismiss,
    update,
  }
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState)

  React.useEffect(() => {
    listeners.push(setState)
    return () => {
      const index = listeners.indexOf(setState)
      if (index > -1) {
        listeners.splice(index, 1)
      }
    }
  }, [state])

  return {
    ...state,
    toast,
    dismiss: (toastId?: string) => dispatch({ type: actionTypes.ACTION_DISMISS_TOAST, toastId }),
  }
}

export { useToast, toast }
