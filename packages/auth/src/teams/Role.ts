export class Role {
  constructor(
    public key: string,
    public name: string,
    public permissions: string[]
  ) {}
}

export const teamRole = (key: string, name: string, permissions: string[]) =>
  new Role(key, name, permissions)
