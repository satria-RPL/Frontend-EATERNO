// import PagePlaceholder from '@/components/Page-Placeholder';

// export default function Home() {
//   return <PagePlaceholder pageName="Home" />;
// }

import { redirect } from "next/navigation";

export default function Home() {
  redirect("/auth/login");
}
