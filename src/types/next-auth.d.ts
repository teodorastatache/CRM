import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      role: "OWNER" | "EMPLOYEE";
    } & DefaultSession["user"];
  }

  interface User {
    role: "OWNER" | "EMPLOYEE";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: "OWNER" | "EMPLOYEE";
  }
}
