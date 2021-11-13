import { TenseiCtxInterface } from '@tensei/components'
import { createContext } from 'react'

export const TenseiCtx = createContext<TenseiCtxInterface>({
  user: null as any,
  booted: false,
  setUser: () => {},
  setBooted: () => {},
  routes: [],
  setRoutes: () => {}
})
