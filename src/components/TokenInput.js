import React, { useContext } from "react";
import { useForm } from "react-hook-form";
import { TokenContext } from "../contexts/TokenContext";

export default function TokenInput() {

  const { token, setToken } = useContext(TokenContext)
  const { register, handleSubmit, watch, formState: { errors } } = useForm()

  function onSubmit(data) {
    setToken(data.token)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* {!token && <>
        <p>your pluralkit token is required to use this app</p>
      </>} */}
      <p>use the <b>pk;token</b> command to get your token from pluralkit</p>
      <input type="text" {...register("token", { required: true })}
        defaultValue={token}
        style={{marginRight: '1em'}}
      />
      {errors.token && <span>token is required to use this app</span>}
      <input type="submit" value='submit token' />
    </form>
  )
}