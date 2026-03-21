//src/app/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

const HomePage = async () => {
  const { userId } = await auth();
  if (userId) {
    redirect("/products");
  } else {
    redirect("/products");  
  }
};

export default HomePage;