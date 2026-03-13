//Redirect to product page
import { redirect } from "next/navigation";
const HomePage = () => {
  redirect("/products");
}
export default HomePage;

