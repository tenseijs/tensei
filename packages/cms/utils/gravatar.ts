import md5 from "md5"

export const getUserGravatar = (email?: string) => {
  const hash = md5(email ?? window.Tensei.state.admin.email)
  return `https://www.gravatar.com/avatar/${hash}`
}
