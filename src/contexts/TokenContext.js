import React, { useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";

export let TokenContext = React.createContext({
  token: '',
  setToken: () => {}
})

export function useTokenManager() {
  try {
    JSON.parse(localStorage.getItem('token'))
  } catch (err) {
    localStorage.setItem('token', JSON.stringify(localStorage.getItem('token')))
  }

  const [token, setToken] = useLocalStorage('token')

  return {token, setToken}
}