import { Role } from "@prisma/client";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      username: string;
      nip?: string | null;
      role: Role;
      avatar?: string | null;
      fungsiId?: string | null;
      fungsiNama?: string | null;
    };
  }

  interface User {
    id: string;
    name: string;
    username: string;
    nip?: string | null;
    role: Role;
    avatar?: string | null;
    fungsiId?: string | null;
    fungsiNama?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string;
    username: string;
    nip?: string | null;
    role: Role;
    avatar?: string | null;
    fungsiId?: string | null;
    fungsiNama?: string | null;
  }
}
