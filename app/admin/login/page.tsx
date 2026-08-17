import { redirect } from "next/navigation";

export default function Page() {
  redirect("/login?returnTo=/admin");
}
